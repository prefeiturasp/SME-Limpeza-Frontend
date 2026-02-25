require('../monitoramento.module.js');
require('../monitoramento.controller.js');

describe('Controller: MonitoramentoController (Jest + AngularJS Injector) - criarOpcoesTabela', () => {
    let $controller, $rootScope, $scope, vm;

    function ensureModule(name) {
        try {
            angular.module(name);
        } catch (e) {
            angular.module(name, []);
        }
    }

    beforeEach(() => {
        // Stub de todos os possíveis submódulos que o app.monitoramento depende.
        ensureModule('monitoramento.monitoramento-detalhe');
        ensureModule('monitoramento.monitoramento-agendamento');
        ensureModule('monitoramento.monitoramento-leitura-qrcode');

        const injector = angular.injector(['ng', 'app.monitoramento']);
        $controller = injector.get('$controller');
        $rootScope = injector.get('$rootScope');

        $scope = $rootScope.$new();
    });

    describe('Controller: MonitoramentoController (Jest + AngularJS Injector) - criarOpcoesTabela', () => {
        let $controller, $rootScope, $scope, vm;

        // spies/mocks compartilhados
        let criarTabelaMock, withOptionSpy, adicionarColunasMock, criarParametrosMock, vaziaMock;
        let dataserviceMock, lerRetornoDatatableSpy, tabelaRecarregarSpy;

        // helper para criar um "datatable options" encadeável
        function makeDtOptions() {
            const opts = {
                withOption: jest.fn().mockReturnThis()
            };
            return opts;
        }

        beforeEach(() => {
            const injector = angular.injector(['ng', 'app.monitoramento']);
            $controller = injector.get('$controller');
            $rootScope = injector.get('$rootScope');

            // novo scope
            $scope = $rootScope.$new();

            // mocks de tabela
            const dtOptions = makeDtOptions();
            withOptionSpy = dtOptions.withOption;

            criarParametrosMock = jest.fn((data, filtros) => ({ data, filtros }));
            adicionarColunasMock = jest.fn(cols => cols);
            vaziaMock = jest.fn(() => ({ vazio: true }));

            criarTabelaMock = jest.fn(() => dtOptions);
            tabelaRecarregarSpy = jest.fn();

            // mock do dataservice (MonitoramentoRest)
            dataserviceMock = {
                tabela: jest.fn()
            };

            // controller helper
            lerRetornoDatatableSpy = jest.fn(x => x);
            const controllerHelper = {
                feed: jest.fn(),
                ler: x => x,
                lerRetornoDatatable: lerRetornoDatatableSpy
            };

            // mock de $rootScope.usuario para caminhos de colunas
            $rootScope.usuario = {
                usuarioOrigem: { codigo: 'ue' }, // ajustaremos em cenários
                usuarioCargo: { id: 2 }
            };

            // Instancia o controller
            vm = $controller('MonitoramentoController as vm', {
                $scope,
                $rootScope,
                $window: { innerWidth: 1024 }, // não mobile
                controller: controllerHelper,
                MonitoramentoRest: dataserviceMock,
                tabela: {
                    criarTabela: criarTabelaMock,
                    adicionarColunas: adicionarColunasMock,
                    criarParametros: criarParametrosMock,
                    vazia: vaziaMock,
                    recarregarDados: tabelaRecarregarSpy
                },
                $uibModal: {},
                SweetAlert: { swal: jest.fn() },
                UnidadeEscolarUtils: {
                    carregarComboTodos: () => Promise.resolve({ objeto: [] })
                },
                PrestadorServicoUtils: {
                    carregarCombo: () => Promise.resolve({ objeto: [] })
                },
                AmbienteUnidadeEscolarUtils: {
                    carregarCombo: () => Promise.resolve({ objeto: [] }),
                    buscarPorHash: jest.fn()
                }
            });

            // garante digest inicial (iniciar() é chamado dentro do controller)
            $scope.$apply();
        });

        test('montarTabela cria opcoes e colunas e registra rowCallback', () => {
            // montarTabela() já foi chamado em iniciar()
            expect(criarTabelaMock).toHaveBeenCalledTimes(1);

            // 1º argumento do criarTabela é a função ajax; 2º é vm; 3º null; 4º 'data'
            const [ajaxFn, ctx, third, orderColumn] = criarTabelaMock.mock.calls[0];
            expect(typeof ajaxFn).toBe('function');
            expect(ctx).toBe(vm);
            expect(third).toBeNull();
            expect(orderColumn).toBe('data');

            // withOption registrado com rowCallback
            expect(withOptionSpy).toHaveBeenCalledWith('rowCallback', expect.any(Function));

            // colunas adicionadas
            expect(adicionarColunasMock).toHaveBeenCalledTimes(1);
            expect(vm.tabela.colunas).toBeDefined();
            expect(Array.isArray(vm.tabela.colunas)).toBe(true);
            // Deve conter pelo menos as colunas base (Data, Ambiente, Realizado, Ações)
            const titles = vm.tabela.colunas.map(c => c.title);
            expect(titles).toEqual(expect.arrayContaining(['Data', 'Ambiente', 'Ações']));
        });


        describe('ajax - transformação de datas e chamada do serviço', () => {
            let ajaxFn, callbackSpy;

            beforeEach(() => {
                // recuperar a referência de ajax e rowCallback da chamada a criarTabela
                ajaxFn = criarTabelaMock.mock.calls[0][0];
                callbackSpy = jest.fn();
            });

            test('converte datasSelecionadas em ISO quando array de Date', async () => {
                const d1 = new Date(2025, 10, 4);  // 04/11/2025
                const d2 = new Date(2025, 10, 6);  // 06/11/2025
                vm.filtros.datasSelecionadas = [d1, d2];

                // simular dataservice.tabela resolvendo
                const respostaApi = { data: { items: [] } };
                dataserviceMock.tabela.mockResolvedValueOnce(respostaApi);

                await ajaxFn({ draw: 1 }, callbackSpy);

                // verificar parâmetros enviados ao service
                expect(dataserviceMock.tabela).toHaveBeenCalledTimes(1);
                const paramsEnviados = dataserviceMock.tabela.mock.calls[0][0];
                expect(paramsEnviados.filtros.datas).toEqual(['2025-11-04', '2025-11-06']); // ISO

                // callback recebe retorno processado
                expect(lerRetornoDatatableSpy).toHaveBeenCalledWith(respostaApi);
                expect(callbackSpy).toHaveBeenCalledWith(respostaApi);
            });

            test('converte quando datasSelecionadas é string única com vírgulas', async () => {
                vm.filtros.datasSelecionadas = '04/11/2025, 05/11/2025,06/11/2025';

                dataserviceMock.tabela.mockResolvedValueOnce({ data: {} });

                await ajaxFn({ draw: 2 }, callbackSpy);

                const paramsEnviados = dataserviceMock.tabela.mock.calls[0][0];
                expect(paramsEnviados.filtros.datas).toEqual([
                    '2025-11-04',
                    '2025-11-05',
                    '2025-11-06'
                ]);
            });

            test('converte quando datasSelecionadas é array de strings DMY', async () => {
                vm.filtros.datasSelecionadas = ['01/12/2025', '31/12/2025'];

                dataserviceMock.tabela.mockResolvedValueOnce({ data: {} });

                await ajaxFn({ draw: 3 }, callbackSpy);

                const paramsEnviados = dataserviceMock.tabela.mock.calls[0][0];
                expect(paramsEnviados.filtros.datas).toEqual([
                    '2025-12-01',
                    '2025-12-31'
                ]);
            });

            test('ignora valores vazios/indefinidos e remove campos auxiliares do filtro', async () => {
                vm.filtros = {
                    datasSelecionadas: [null, '', '  ', '02/01/2026'],
                    data: 'campoLegacy',
                    outroFiltro: 123
                };

                dataserviceMock.tabela.mockResolvedValueOnce({ data: {} });

                await ajaxFn({ draw: 4 }, callbackSpy);

                const { filtros } = dataserviceMock.tabela.mock.calls[0][0];
                expect(filtros.datas).toEqual(['2026-01-02']);
                // campos removidos
                expect(filtros.data).toBeUndefined();
                expect(filtros.datasSelecionadas).toBeUndefined();
                // demais filtros preservados
                expect(filtros.outroFiltro).toBe(123);
            });
        });

        describe('colunas variam conforme usuarioOrigem e isMobile', () => {
            test('quando usuarioOrigem != "ue", deve ter coluna "Unidade Escolar" e "Prestador de Serviço"', () => {
                // Recria controller com usuarioOrigem ps para acionar colunas
                const injector = angular.injector(['ng', 'app.monitoramento']);
                const $controller2 = injector.get('$controller');
                const $rootScope2 = injector.get('$rootScope');
                const $scope2 = $rootScope2.$new();

                $rootScope2.usuario = {
                    usuarioOrigem: { codigo: 'adm' }, // não 'ue' e não 'ps'
                    usuarioCargo: { id: 1 }
                };

                const criarTabelaMock2 = jest.fn(() => makeDtOptions());
                const adicionarColunasMock2 = jest.fn(cols => cols);

                $controller2('MonitoramentoController as vm', {
                    $scope: $scope2,
                    $rootScope: $rootScope2,
                    $window: { innerWidth: 1024 },
                    controller: { feed: jest.fn(), ler: x => x, lerRetornoDatatable: x => x },
                    MonitoramentoRest: { tabela: jest.fn().mockResolvedValue({}) },
                    tabela: {
                        criarTabela: criarTabelaMock2,
                        adicionarColunas: adicionarColunasMock2,
                        criarParametros: jest.fn(),
                        vazia: jest.fn(),
                        recarregarDados: jest.fn()
                    },
                    $uibModal: {},
                    SweetAlert: { swal: jest.fn() },
                    UnidadeEscolarUtils: { carregarComboTodos: () => Promise.resolve({ objeto: [] }) },
                    PrestadorServicoUtils: { carregarCombo: () => Promise.resolve({ objeto: [] }) },
                    AmbienteUnidadeEscolarUtils: { carregarCombo: () => Promise.resolve({ objeto: [] }) }
                });

                $scope2.$apply();

                const cols = $scope2.vm.tabela.colunas;
                const titles = cols.map(c => c.title);
                expect(titles).toEqual(expect.arrayContaining(['Unidade Escolar', 'Prestador de Serviço']));
            });

            test('quando usuarioOrigem = "ue" e isMobile = true, título Realizado é "Rlzd" e sem coluna Ocorrência', () => {
                const injector = angular.injector(['ng', 'app.monitoramento']);
                const $controller2 = injector.get('$controller');
                const $rootScope2 = injector.get('$rootScope');
                const $scope2 = $rootScope2.$new();

                $rootScope2.usuario = {
                    usuarioOrigem: { codigo: 'ue' },
                    usuarioCargo: { id: 2 }
                };

                const criarTabelaMock2 = jest.fn(() => makeDtOptions());
                const adicionarColunasMock2 = jest.fn(cols => cols);

                $controller2('MonitoramentoController as vm', {
                    $scope: $scope2,
                    $rootScope: $rootScope2,
                    $window: { innerWidth: 360 }, // mobile
                    controller: { feed: jest.fn(), ler: x => x, lerRetornoDatatable: x => x },
                    MonitoramentoRest: { tabela: jest.fn().mockResolvedValue({}) },
                    tabela: {
                        criarTabela: criarTabelaMock2,
                        adicionarColunas: adicionarColunasMock2,
                        criarParametros: jest.fn(),
                        vazia: jest.fn(),
                        recarregarDados: jest.fn()
                    },
                    $uibModal: {},
                    SweetAlert: { swal: jest.fn() },
                    UnidadeEscolarUtils: { carregarComboTodos: () => Promise.resolve({ objeto: [] }) },
                    PrestadorServicoUtils: { carregarCombo: () => Promise.resolve({ objeto: [] }) },
                    AmbienteUnidadeEscolarUtils: { carregarCombo: () => Promise.resolve({ objeto: [] }) }
                });

                $scope2.$apply();

                const titles = $scope2.vm.tabela.colunas.map(c => c.title);
                expect(titles).toContain('Rlzd'); // título curto em mobile
                expect(titles).not.toContain('Ocorrência'); // não adiciona em mobile
            });
        });
    });
});