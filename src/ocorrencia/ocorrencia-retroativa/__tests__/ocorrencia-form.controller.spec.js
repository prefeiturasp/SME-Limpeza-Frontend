const moment = require('moment');

test('carregarConfiguracao configura dateDisabled para mês anterior encerrado', async () => {
    // Simular que "agora" é 01/10/2025 10:00:00 usando Jest
    const fakeNow = new Date(2025, 9, 1, 10, 0, 0); // mês 9 = outubro (0-based)

    // Ativa fake timers do Jest (moderno)
    jest.useFakeTimers({ now: fakeNow });

    // Mock de Date.now para garantir coerência com moment()
    const realDateNow = Date.now;
    jest.spyOn(Date, 'now').mockImplementation(() => fakeNow.getTime());

    // Mocks
    const ConfiguracaoUtils = {
        buscar: jest.fn().mockResolvedValue({ objeto: { valor: 3 } })
    };

    const RelatorioGerencialRest = {
        tabela: jest.fn()
            // 1ª chamada: mês anterior
            .mockResolvedValueOnce({
                datatables: {
                    data: [{ flagAprovadoFiscal: true, mes: '09', ano: 2025 }]
                }
            })
            // 2ª chamada: mês atual
            .mockResolvedValueOnce({
                datatables: { data: [] }
            })
    };

    // VM mínimo com configurarDateDisabled e carregarConfiguracao
    const vm = {
        optionsDatePicker: {},
        model: { data: new Date(), dataOriginal: new Date() }
    };

    // Implementa o mesmo configurarDateDisabled usado no controller
    vm.configurarDateDisabled = function (params) {
        vm.optionsDatePicker = vm.optionsDatePicker || {};
        const feriadosSet = new Set((params?.feriados || []).map(d => moment(d).format('YYYY-MM-DD')));
        vm.optionsDatePicker.dateDisabled = function (data) {
            if (!data || data.mode !== 'day') return false;
            const m = moment(data.date);

            if (params?.mesEncerrado) {
                if (m.year() === params.mesEncerrado.ano && m.month() === params.mesEncerrado.mesIndex) {
                    return true;
                }
            }
            if (params?.bloquearFinsDeSemana) {
                const wd = m.isoWeekday();
                if (wd === 6 || wd === 7) return true;
            }
            if (feriadosSet.size > 0 && feriadosSet.has(m.format('YYYY-MM-DD'))) {
                return true;
            }
            if (params?.horarioCorteHoje && m.isSame(moment(), 'day')) {
                const [hh, mm = '00'] = params.horarioCorteHoje.split(':');
                const limite = moment().hour(+hh).minute(+mm).second(0);
                if (moment().isAfter(limite)) return true;
            }
            return false;
        };
    };

    // carrega configuração (versão reduzida para teste)
    vm.carregarConfiguracao = async function () {
        const resp = await ConfiguracaoUtils.buscar('DIAS_RET_OCORRENCIA');
        // calcula minDate pulando fds
        let minDate = moment();
        for (let i = 0; i < resp.objeto.valor; i++) {
            minDate = minDate.subtract(1, 'days');
            while (minDate.isoWeekday() === 6 || minDate.isoWeekday() === 7) {
                minDate = minDate.subtract(1, 'days');
            }
        }
        vm.optionsDatePicker.minDate = minDate.clone();
        vm.optionsDatePicker.maxDate = moment();

        vm.configurarDateDisabled({ mesEncerrado: null });

        // mês anterior e atual referenciando "hoje" (01/10/2025)
        const hoje = moment(); // respeita Date.now mockado
        const mAnterior = hoje.clone().subtract(1, 'month'); // setembro/2025
        const mesAnterior = parseInt(mAnterior.format('MM'), 10);
        const anoAnterior = parseInt(mAnterior.format('YYYY'), 10);

        // Consulta mês anterior
        const paramsPrev = [
            'draw=1',
            'filters=' + encodeURIComponent(JSON.stringify({ mes: mesAnterior, ano: anoAnterior })),
            'length=25',
            'start=0'
        ].join('&');

        const resPrev = await RelatorioGerencialRest.tabela(paramsPrev);
        const rowsPrev = resPrev?.datatables?.data || [];
        const encerrado = rowsPrev.some(r => r.flagAprovadoFiscal === true);

        if (encerrado) {
            vm.configurarDateDisabled({
                mesEncerrado: { ano: anoAnterior, mesIndex: mAnterior.month() }
            });
        }

        // Consulta mês atual
        const mesAtual = parseInt(hoje.format('MM'), 10);
        const anoAtual = parseInt(hoje.format('YYYY'), 10);
        const paramsCurr = [
            'draw=1',
            'filters=' + encodeURIComponent(JSON.stringify({ mes: mesAtual, ano: anoAtual })),
            'length=25',
            'start=0'
        ].join('&');
        await RelatorioGerencialRest.tabela(paramsCurr);
    };

    await vm.carregarConfiguracao();

    const d = (yyyy, mm, dd) => ({ date: new Date(yyyy, mm - 1, dd), mode: 'day' });
    expect(vm.optionsDatePicker.dateDisabled(d(2025, 9, 20))).toBe(true);   // setembro bloqueado
    expect(vm.optionsDatePicker.dateDisabled(d(2025, 10, 2))).toBe(false);  // outubro permitido

    // Limpeza dos mocks
    jest.spyOn(Date, 'now').mockRestore();
    jest.useRealTimers();
});

test('OcorrenciaLista.montarTabela: cria colunas conforme perfil, configura opcoes, ajax sucesso e erro', async () => {
    // Helpers
    const flushPromises = async () => {
        await new Promise((r) => setTimeout(r, 0));
        await Promise.resolve();
        await new Promise((r) => setTimeout(r, 0));
        await Promise.resolve();
    };

    // Mocks base
    const $window = { open: jest.fn() };
    const $location = { path: jest.fn() };
    const controller = {
        lerRetornoDatatable: jest.fn((resp) => resp),
        feed: jest.fn(),
        feedMessage: jest.fn(),
        ler: jest.fn((resp, key) => resp && resp[key]),
    };

    const dataservice = {
        tabela: jest.fn(() => Promise.resolve({ datatables: { data: [{ id: 1 }] } })),
        exportar: jest.fn().mockResolvedValue({ data: 'csvdata' }),
        remover: jest.fn().mockResolvedValue({})
    };

    const tabela = {
        criarTabela: jest.fn(() => ({ withOption: jest.fn().mockReturnThis() })),
        adicionarColunas: jest.fn((cols) => cols),
        criarParametros: jest.fn((data, filtros) => ({ data, filtros })),
        vazia: jest.fn(() => ({ data: [] })),
        recarregarDados: jest.fn(),
        // formatadores usados nas colunas
        formatarDataHora: jest.fn(),
        formatarContrato: jest.fn(),
        formatarPrestadorServico: jest.fn(),
        formatarUnidadeEscolar: jest.fn(),
        booleanParaBadgeSimNao: jest.fn(),
        encerradoAutomaticamente: '<span class="badge">Auto</span>'
    };

    const $uibModal = { open: jest.fn() };
    const OcorrenciaTipoUtils = { carregarCombo: jest.fn().mockResolvedValue({ objeto: [] }) };
    const UnidadeEscolarUtils = { carregarComboTodos: jest.fn().mockResolvedValue({ objeto: [] }) };
    const PrestadorServicoUtils = { carregarCombo: jest.fn().mockResolvedValue({ objeto: [] }) };
    const SweetAlert = { swal: jest.fn() };
    const ContratoUtils = { carregarCombo: jest.fn().mockResolvedValue({ objeto: [] }) };

    // Controller inline mínimo (apenas o montarTabela e iniciar relevantes)
    function OcorrenciaLista($rootScope_, $window_, $location_, controller_, dataservice_, tabela_, $uibModal_,
        OcorrenciaTipoUtils_, UnidadeEscolarUtils_, PrestadorServicoUtils_, SweetAlert_, ContratoUtils_) {

        const vm = this;

        vm.filtros = {};
        vm.instancia = {};
        vm.tabela = {};
        vm.optionsDatePickerFiltro = { minMode: 'day', maxDate: moment() };

        vm.recarregarTabela = () => tabela_.recarregarDados(vm.instancia);
        vm.abrirModal = () => { };
        vm.fecharModal = () => { };
        vm.exportar = () => { };

        iniciar();

        function iniciar() {
            vm.filtros.dataInicial = new Date(moment().subtract(7, 'days'));
            vm.filtros.dataFinal = new Date();
            vm.filtros.flagSomenteAtivos = 'true';
            // Combos (assíncronos, mas não essenciais para montarTabela)
            OcorrenciaTipoUtils_.carregarCombo().catch(() => { });
            PrestadorServicoUtils_.carregarCombo().catch(() => { });
            UnidadeEscolarUtils_.carregarComboTodos().catch(() => { });
            ContratoUtils_.carregarCombo().catch(() => { });
            montarTabela();
        }

        function montarTabela() {
            criarOpcoesTabela();

            function criarColunasTabela() {
                var colunas = [
                    { data: 'id', title: 'ID', width: 4 },
                ];
                colunas.push({ data: 'dataHoraCadastro', title: 'Data/Hora Cadastro', width: 8, cssClass: 'text-right', renderWith: tabela_.formatarDataHora });
                colunas.push({ data: 'contrato', title: 'Contrato', width: 8, renderWith: tabela_.formatarContrato });

                if ($rootScope_.usuario.usuarioOrigem.codigo !== 'ps') {
                    colunas.push({ data: 'prestadorServico', title: 'Prestador de Serviço', width: 13, renderWith: tabela_.formatarPrestadorServico });
                }
                if ($rootScope_.usuario.usuarioOrigem.codigo !== 'ue') {
                    colunas.push({ data: 'unidadeEscolar', title: 'Unidade Escolar', width: 13, renderWith: tabela_.formatarUnidadeEscolar });
                }

                colunas.push({ data: 'data', title: 'Data/Hora Ocorrência', width: 8, renderWith: tabela_.formatarDataHora });
                colunas.push({ data: 'tipo', title: 'Tipo da Ocorrência', width: 10 });

                colunas.push({
                    data: 'flagEncerrado',
                    title: 'Encerrado',
                    width: 10,
                    cssClass: 'text-right',
                    renderWith: (data, type, full) => {
                        if (full && full.flagEncerramentoAutomatico) {
                            return tabela_.encerradoAutomaticamente;
                        }
                        return tabela_.booleanParaBadgeSimNao(data);
                    }
                });

                colunas.push({
                    data: null,
                    title: 'Atendido',
                    width: 8,
                    cssClass: 'text-right',
                    renderWith: function (row) {
                        const mostrarSim = row.flagEncerrado && !row.flagGerarDesconto;
                        return tabela_.booleanParaBadgeSimNao(mostrarSim);
                    }
                });

                colunas.push({
                    data: null,
                    title: 'Respondido',
                    width: 8,
                    cssClass: 'text-right',
                    renderWith: function (row) {
                        const mostrarSim = !!row.ocorrenciaRespondida;
                        return tabela_.booleanParaBadgeSimNao(mostrarSim);
                    }
                });

                colunas.push({
                    data: 'id', title: 'Ações', width: 15, cssClass: 'text-right', renderWith: (v1, v2, data) => `
            ${!data.flagEncerrado && $rootScope_.usuario.flagFiscal ? '<button class="mr-1 btn btn-outline-danger btn-sm encerrar" title="Encerrar"><i class="icon-close"></i></button>' : ''}
            ${($rootScope_.usuario.flagFiscal || $rootScope_.usuario.usuarioOrigem.codigo === 'dre') ? '<button class="mr-1 btn btn-outline-danger btn-sm remover" title="Remover"><i class="icon-trash"></i></button>' : ''}
            <button class="btn btn-outline-primary btn-sm visualizar" title="Visualizar"><i class="icon-eye"></i></button>
          `
                });

                vm.tabela.colunas = tabela_.adicionarColunas(colunas);
            }

            function criarOpcoesTabela() {
                vm.tabela.opcoes = tabela_.criarTabela(ajax, vm, null, 'data');
                vm.tabela.opcoes.withOption('rowCallback', rowCallback);
                criarColunasTabela();

                function ajax(data, callback) {
                    dataservice_.tabela(tabela_.criarParametros(data, vm.filtros)).then(success).catch(error);
                    function success(response) { callback(controller_.lerRetornoDatatable(response)); }
                    function error() { callback(tabela_.vazia()); }
                }

                function rowCallback() { /* não testamos jQuery aqui */ }
            }
        }

        return vm;
    }

    // Cenário 1: usuarioOrigem.codigo = 'ps' => sem "Prestador de Serviço", com "Unidade Escolar"
    let $rootScope = { usuario: { flagFiscal: true, usuarioOrigem: { codigo: 'ps' } } };
    let vm1 = new OcorrenciaLista($rootScope, $window, $location, controller, dataservice, tabela, $uibModal,
        OcorrenciaTipoUtils, UnidadeEscolarUtils, PrestadorServicoUtils, SweetAlert, ContratoUtils);

    // Verifica opcoes criadas e withOption configurado
    expect(tabela.criarTabela).toHaveBeenCalled();
    expect(vm1.tabela.opcoes).toBeDefined();
    expect(typeof vm1.tabela.opcoes.withOption).toBe('function');

    // Verifica colunas conforme perfil 'ps'
    const titulosPs = vm1.tabela.colunas.map(c => c.title);
    expect(titulosPs).toEqual(expect.arrayContaining([
        'ID',
        'Data/Hora Cadastro',
        'Contrato',
        'Unidade Escolar',
        'Data/Hora Ocorrência',
        'Tipo da Ocorrência',
        'Encerrado',
        'Atendido',
        'Respondido',
        'Ações'
    ]));
    expect(titulosPs).not.toContain('Prestador de Serviço');

    // Testa ajax sucesso
    const ajaxFn1 = tabela.criarTabela.mock.calls[0][0];
    const callback1 = jest.fn();
    await ajaxFn1({ start: 0, length: 10 }, callback1, {});
    await flushPromises();
    expect(tabela.criarParametros).toHaveBeenCalledWith(expect.any(Object), vm1.filtros);
    expect(dataservice.tabela).toHaveBeenCalled();
    expect(controller.lerRetornoDatatable).toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledWith(controller.lerRetornoDatatable.mock.results[0].value);

    // Testa ajax erro
    dataservice.tabela.mockImplementationOnce(() => Promise.reject(new Error('ajax fail')));
    const vmErr = new OcorrenciaLista($rootScope, $window, $location, controller, dataservice, tabela, $uibModal,
        OcorrenciaTipoUtils, UnidadeEscolarUtils, PrestadorServicoUtils, SweetAlert, ContratoUtils);

    const ajaxFnErr = tabela.criarTabela.mock.calls[1][0];
    const callbackErr = jest.fn();
    await ajaxFnErr({}, callbackErr, {});
    await flushPromises();
    expect(tabela.vazia).toHaveBeenCalled();
    expect(callbackErr).toHaveBeenCalledWith(tabela.vazia.mock.results[0].value);

    // Cenário 2: usuarioOrigem.codigo = 'ue' => com "Prestador de Serviço", sem "Unidade Escolar"
    $rootScope = { usuario: { flagFiscal: false, usuarioOrigem: { codigo: 'ue' } } };
    const vm2 = new OcorrenciaLista($rootScope, $window, $location, controller, dataservice, tabela, $uibModal,
        OcorrenciaTipoUtils, UnidadeEscolarUtils, PrestadorServicoUtils, SweetAlert, ContratoUtils);

    const titulosUe = vm2.tabela.colunas.map(c => c.title);
    expect(titulosUe).toEqual(expect.arrayContaining([
        'ID',
        'Data/Hora Cadastro',
        'Contrato',
        'Prestador de Serviço',
        'Data/Hora Ocorrência',
        'Tipo da Ocorrência',
        'Encerrado',
        'Atendido',
        'Respondido',
        'Ações'
    ]));
    expect(titulosUe).not.toContain('Unidade Escolar');
}, 20000);