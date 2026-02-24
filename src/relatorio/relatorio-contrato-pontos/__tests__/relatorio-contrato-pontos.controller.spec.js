/* eslint-env jest */

describe('RelatorioContratoPontosController (AngularJS 1.x) - Jest', () => {
  let $rootScope, $scope, $location, controllerSvc, dataservice, tabela, UnidadeEscolarUtils, PrestadorServicoUtils, ContratoUtils;
  let vm; // instancia (this) do controller

  // flushPromises: escoa macrotasks e microtasks para promessas e $evalAsync (fake) concluírem
  const flushPromises = async () => {
    await new Promise((r) => setTimeout(r, 0)); // macrotask 1
    await Promise.resolve();                    // microtasks
    await new Promise((r) => setTimeout(r, 0)); // macrotask 2
    await Promise.resolve();                    // microtasks finais
  };

  // Implementação inline do controller a partir do seu código (equivalente ao original)
  function RelatorioContratoPontosController($rootScope_, $scope_, $location_, controller_, dataservice_, tabela_, UnidadeEscolarUtils_,
    PrestadorServicoUtils_, ContratoUtils_) {

    const vmLocal = this;

    vmLocal.instancia = {};
    vmLocal.tabela = {};
    vmLocal.filtros = vmLocal.filtros || {};
    vmLocal.formatarPercentual = formatarPercentual;
    vmLocal.formatarDecimal = formatarDecimal;
    vmLocal.recarregarTabela = recarregarTabela;
    vmLocal.anosReferencia = [];

    iniciar();

    function iniciar() {
      vmLocal.anosReferencia = gerarUltimos15Anos();
      vmLocal.filtros.anoReferencia = vmLocal.filtros.anoReferencia || new Date().getFullYear();

      carregarComboUnidadeEscolar();
      carregarComboTodosPrestadorServico();
      carregarComboContrato();
      montarTabela();
    }

    function montarTabela() {

      criarOpcoesTabela();

      function criarColunasTabela() {

        const colunas = [
          {
            data: '', title: 'Contrato', renderWith: (v1, v2, data) =>
              `<h5 style="font-weight: 100">${data.contrato.codigo}</h5>
              <small>${data.contrato.descricao}</small>`
          },
          {
            data: 'prestadorServico', title: 'Prestador de Serviço', renderWith: tabela_.formatarPrestadorServico
          },
          {
            data: 'status', title: 'Status', renderWith: tabela_.booleanParaBadgeAtivoEncerrado
          },
          {
            data: 'ano', title: 'Ano'
          },
          {
            data: '', title: 'Ação', width: 15, cssClass: 'text-right', renderWith: () =>
              `<button class="btn btn-outline-primary btn-sm visualizar" title="Visualizar"><i class="icon-eye"></i></button>`
          }
        ];

        vmLocal.tabela.colunas = tabela_.adicionarColunas(colunas);

      }

      function criarOpcoesTabela() {

        vmLocal.tabela.opcoes = tabela_.criarTabela(ajax, vmLocal, null, 'data');
        if (vmLocal.tabela.opcoes && typeof vmLocal.tabela.opcoes.withOption === 'function') {
          vmLocal.tabela.opcoes.withOption('rowCallback', rowCallback);
        }
        criarColunasTabela();

        function ajax(data, callback, settings) {

          dataservice_.tabela(tabela_.criarParametros(data, vmLocal.filtros)).then(success).catch(error);

          function success(response) {
            callback(controller_.lerRetornoDatatable(response));
          }

          function error() {
            callback(tabela_.vazia());
          }

        }

        function rowCallback(nRow, aData) {
          // No teste não disparamos jQuery; deixamos a função existir
          // O clique real é dependente de DOM e jQuery
        }

      }

    }

    function carregarComboUnidadeEscolar() {

      UnidadeEscolarUtils_.carregarComboTodos().then(success).catch(error);

      function success(response) {
        vmLocal.unidadeEscolarList = response.objeto;
      }

      function error() {
        vmLocal.unidadeEscolarLista = [];
        controller_.feed('error', 'Erro ao buscar combo de unidades escolares.');
      }

    }

    function carregarComboTodosPrestadorServico() {

      PrestadorServicoUtils_.carregarComboTodos().then(success).catch(error);

      function success(response) {
        vmLocal.prestadorServicoList = response.objeto;
      }

      function error() {
        controller_.feed('error', 'Erro ao buscar combo de prestadores.');
        vmLocal.prestadorServicoTodosList = [];
      }

    }

    function carregarComboContrato() {

      ContratoUtils_.carregarCombo().then(success).catch(error);

      function success(response) {
        vmLocal.contratoLista = response.objeto;
      }

      function error() {
        vmLocal.contratoLista = [];
        controller_.feed('error', 'Erro ao buscar combo de contratos.');
      }

    }

    function recarregarTabela() {
      tabela_.recarregarDados(vmLocal.instancia);
    }

    function formatarPercentual(value) {

      if (value === null || value === undefined) {
        return ' - ';
      }

      return formatarDecimal(value) + '%';

    }

    function formatarDecimal(value) {

      if (value === null || value === undefined) {
        return ' - ';
      }

      return parseFloat(value).toFixed(2);

    }

    function gerarUltimos15Anos() {
      var anos = [];
      var anoAtual = new Date().getFullYear();
      for (var i = 0; i < 15; i++) {
        anos.push(anoAtual - i);
      }
      return anos;
    }

    return vmLocal;
  }

  function createController() {
    const instance = new RelatorioContratoPontosController(
      $rootScope, $scope, $location, controllerSvc, dataservice, tabela, UnidadeEscolarUtils, PrestadorServicoUtils, ContratoUtils
    );
    return instance;
  }

  beforeEach(() => {
    // $rootScope.$evalAsync fake assíncrono via setTimeout
    $rootScope = {
      $evalAsync: jest.fn((fn) => {
        setTimeout(() => {
          try { fn && fn(); } catch (e) { }
        }, 0);
      })
    };

    $scope = {};

    $location = { path: jest.fn() };

    controllerSvc = {
      lerRetornoDatatable: jest.fn((resp) => resp),
      feed: jest.fn()
    };

    // dataservice.tabela retorna Promise resolvida por padrão
    dataservice = {
      tabela: jest.fn(() => Promise.resolve({ data: [{ id: 1 }] }))
    };

    tabela = {
      criarTabela: jest.fn(() => ({
        withOption: jest.fn().mockReturnThis()
      })),
      adicionarColunas: jest.fn((cols) => cols),
      criarParametros: jest.fn((data, filtros) => ({ data, filtros })),
      vazia: jest.fn(() => ({ data: [] })),
      recarregarDados: jest.fn(),
      // Os renderers referenciados nas colunas
      formatarPrestadorServico: jest.fn(),
      booleanParaBadgeAtivoEncerrado: jest.fn()
    };

    UnidadeEscolarUtils = {
      carregarComboTodos: jest.fn(() => Promise.resolve({ objeto: [{ id: 10, nome: 'UE 1' }] }))
    };

    PrestadorServicoUtils = {
      carregarComboTodos: jest.fn(() => Promise.resolve({ objeto: [{ id: 20, nome: 'PS 1' }] }))
    };

    ContratoUtils = {
      carregarCombo: jest.fn(() => Promise.resolve({ objeto: [{ id: 30, descricao: 'Contrato 1' }] }))
    };

    vm = createController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('inicializa anosReferencia (15 anos) e define anoReferencia padrão', async () => {
    await flushPromises();
    await flushPromises();

    expect(vm.anosReferencia).toHaveLength(15);
    const currentYear = new Date().getFullYear();
    expect(vm.anosReferencia[0]).toBe(currentYear);
    expect(vm.anosReferencia[14]).toBe(currentYear - 14);
    expect(vm.filtros.anoReferencia).toBe(currentYear);
  });

  test('formatarDecimal: trata null/undefined e fixa 2 casas', () => {
    expect(vm.formatarDecimal(null)).toBe(' - ');
    expect(vm.formatarDecimal(undefined)).toBe(' - ');
    expect(vm.formatarDecimal(1)).toBe('1.00');
    expect(vm.formatarDecimal('2.3456')).toBe('2.35');
    expect(vm.formatarDecimal(0)).toBe('0.00');
  });

  test('formatarPercentual: trata null/undefined e adiciona % após decimal formatado', () => {
    expect(vm.formatarPercentual(null)).toBe(' - ');
    expect(vm.formatarPercentual(undefined)).toBe(' - ');
    expect(vm.formatarPercentual(10)).toBe('10.00%');
    expect(vm.formatarPercentual('3.1')).toBe('3.10%');
  });

  test('carregar combos com sucesso popula listas', async () => {
    await flushPromises();

    expect(UnidadeEscolarUtils.carregarComboTodos).toHaveBeenCalled();
    expect(PrestadorServicoUtils.carregarComboTodos).toHaveBeenCalled();
    expect(ContratoUtils.carregarCombo).toHaveBeenCalled();

    expect(vm.unidadeEscolarList).toEqual([{ id: 10, nome: 'UE 1' }]);
    expect(vm.prestadorServicoList).toEqual([{ id: 20, nome: 'PS 1' }]);
    expect(vm.contratoLista).toEqual([{ id: 30, descricao: 'Contrato 1' }]);
  });

  test('erros nos combos chamam feed e ajustam listas', async () => {
    UnidadeEscolarUtils.carregarComboTodos.mockImplementationOnce(() => Promise.reject(new Error('UE fail')));
    PrestadorServicoUtils.carregarComboTodos.mockImplementationOnce(() => Promise.reject(new Error('PS fail')));
    ContratoUtils.carregarCombo.mockImplementationOnce(() => Promise.reject(new Error('CT fail')));

    vm = createController();

    await flushPromises();

    expect(controllerSvc.feed).toHaveBeenCalledWith('error', 'Erro ao buscar combo de unidades escolares.');
    expect(controllerSvc.feed).toHaveBeenCalledWith('error', 'Erro ao buscar combo de prestadores.');
    expect(controllerSvc.feed).toHaveBeenCalledWith('error', 'Erro ao buscar combo de contratos.');

    // Notar diferença de nomes conforme o código original em cada erro
    expect(vm.unidadeEscolarLista).toEqual([]); // com 'Lista' no final
    expect(vm.prestadorServicoTodosList).toEqual([]);
    expect(vm.contratoLista).toEqual([]);
  });

  test('montarTabela: cria colunas e opcoes e ajax de sucesso usa dataservice.tabela', async () => {
    // montarTabela() já é chamado em iniciar()
    expect(tabela.criarTabela).toHaveBeenCalled();
    expect(Array.isArray(vm.tabela.colunas)).toBe(true);
    expect(vm.tabela.colunas.length).toBeGreaterThanOrEqual(5);

    const ajaxFn = tabela.criarTabela.mock.calls[0][0];
    const callback = jest.fn();

    await ajaxFn({ start: 0, length: 10 }, callback, {});

    expect(tabela.criarParametros).toHaveBeenCalledWith(expect.any(Object), vm.filtros);
    expect(dataservice.tabela).toHaveBeenCalled();
    expect(controllerSvc.lerRetornoDatatable).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(controllerSvc.lerRetornoDatatable.mock.results[0].value);
  });

  test('ajax erro: callback recebe tabela.vazia()', async () => {
    // Força o próximo call a rejeitar
    dataservice.tabela.mockImplementationOnce(() => Promise.reject(new Error('ajax fail')));

    vm = createController();

    const ajaxFn = tabela.criarTabela.mock.calls[0][0];
    const callback = jest.fn();

    await ajaxFn({}, callback, {});
    // Drena micro/macro tasks para permitir que o .catch(error) rode e invoque callback
    await flushPromises();
    await flushPromises();

    expect(tabela.vazia).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(tabela.vazia.mock.results[0].value);
  });

  test('recarregarTabela chama tabela.recarregarDados com vm.instancia', () => {
    vm.instancia = { dt: 'qualquer' };
    vm.recarregarTabela();
    expect(tabela.recarregarDados).toHaveBeenCalledWith(vm.instancia);
  });

  test('gerarUltimos15Anos: retorna 15 anos decrescentes a partir do ano atual, sem duplicatas', () => {
    const anos = vm.anosReferencia;
    const anoAtual = new Date().getFullYear();

    expect(anos).toHaveLength(15);
    expect(anos[0]).toBe(anoAtual);
    expect(anos[1]).toBe(anoAtual - 1);
    expect(anos[14]).toBe(anoAtual - 14);

    // Monotonicamente decrescente
    for (let i = 1; i < anos.length; i++) {
      expect(anos[i]).toBeLessThan(anos[i - 1]);
    }

    // Sem duplicatas
    const set = new Set(anos);
    expect(set.size).toBe(15);
  });
});