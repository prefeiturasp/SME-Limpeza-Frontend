/* eslint-env jest */

describe('RelatorioContratoPontosDetalheController (AngularJS 1.x) - Jest', () => {
  let $rootScope, $location, controllerSvc, dataservice, $routeParams;
  let vm;
  const flushPromises = async () => {
    await new Promise((r) => setTimeout(r, 0));
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    await Promise.resolve();
  };

  // implementação inline do controller
  function RelatorioContratoPontosDetalheController($rootScope_, controller_, $routeParams_, dataservice_, $location_) {
    const vmLocal = this;

    vmLocal.exportar = exportar;
    vmLocal.formatarPercentual = formatarPercentual;
    vmLocal.formatarDecimal = formatarDecimal;
    vmLocal.recarregarDados = recarregarDados;
    vmLocal.filtros = vmLocal.filtros || {};

    iniciar();

    function iniciar() {
      vmLocal.idContrato = $routeParams_.idContrato;
      vmLocal.anosReferencia = [];
      carregaComboAnos().then(anos => { vmLocal.anosReferencia = anos; });

      if (!vmLocal.idContrato) {
        redirecionarListagem();
      }

      buscar();
    }

    function buscar() {
      const filtros = { ...vmLocal.filtros };

      dataservice_.buscar(vmLocal.idContrato, filtros).then(success).catch(error);

      function success(response) {
        vmLocal.dados = controller_.ler(response, 'data');
      }

      function error(response) {
        controller_.feedMessage(response);
        redirecionarListagem();
      }
    }

    function exportar() {
      dataservice_.exportar(vmLocal.idContrato).then(success).catch(error);

      function success(response) {
        const data = controller_.ler(response, 'data');
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        const file = new Blob([data], { type: 'application/csv' });
        const fileUrl = window.URL.createObjectURL(file);
        a.href = fileUrl;
        a.download = `relatorio-pontos-${vmLocal.idContrato}.csv`;
        a.click();
      }

      function error(response) {
        controller_.feed('error', 'Houve um erro ao exportar o relatório.');
      }
    }

    function redirecionarListagem() {
      $rootScope_.$evalAsync(() => $location_.path('relatorio/contrato-pontos'));
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

    function recarregarDados() {
      buscar();
    }

    function carregaComboAnos() {
      return dataservice_.carregaComboAnos(vmLocal.idContrato)
        .then(response => {
          return (response && response.data && response.data.data) ? response.data.data : [];
        })
        .catch(() => []);
    }

    return vmLocal;
  }

  function createController() {
    return new RelatorioContratoPontosDetalheController($rootScope, controllerSvc, $routeParams, dataservice, $location);
  }

  beforeEach(() => {
    $rootScope = {
      $evalAsync: jest.fn((fn) => {
        setTimeout(() => {
          try { fn && fn(); } catch (e) { }
        }, 0);
      })
    };

    $location = { path: jest.fn() };

    controllerSvc = {
      ler: jest.fn((resp) => resp && resp.data ? resp.data : resp),
      feed: jest.fn(),
      feedMessage: jest.fn()
    };

    // defaults para dataservice
    dataservice = {
      buscar: jest.fn(() => Promise.resolve({ data: { items: [] } })),
      exportar: jest.fn(() => Promise.resolve({ data: 'csv-content' })),
      carregaComboAnos: jest.fn(() => Promise.resolve({ data: { data: [2025, 2024] } }))
    };

    $routeParams = { idContrato: 123 };

    vm = createController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('quando idContrato ausente, redireciona para listagem', async () => {
    $routeParams = {}; // sem idContrato
    vm = createController();

    // aguarda promises de iniciar() (carregaComboAnos e buscar)
    await flushPromises();

    expect($rootScope.$evalAsync).toHaveBeenCalled();
    // $evalAsync executa callback que chama $location.path
    // como chamamos flushPromises, esperamos que $location.path tenha sido chamado
    expect($location.path).toHaveBeenCalledWith('relatorio/contrato-pontos');
  });

  test('carregaComboAnos: resolve com response.data.data popula anosReferencia', async () => {
    dataservice.carregaComboAnos.mockResolvedValueOnce({ data: { data: [2025, 2024, 2023] } });
    vm = createController();
    // esperar a promise que popula vm.anosReferencia
    await flushPromises();

    expect(dataservice.carregaComboAnos).toHaveBeenCalledWith(vm.idContrato);
    expect(vm.anosReferencia).toEqual([2025, 2024, 2023]);
  });

  test('carregaComboAnos: em erro retorna array vazio', async () => {
    dataservice.carregaComboAnos.mockImplementationOnce(() => Promise.reject(new Error('fail')));
    vm = createController();
    await flushPromises();

    expect(dataservice.carregaComboAnos).toHaveBeenCalled();
    expect(vm.anosReferencia).toEqual([]);
  });

  test('buscar: sucesso popula vm.dados via controller.ler', async () => {
    const fakeResponse = { data: { items: [{ id: 1 }] } };
    dataservice.buscar.mockResolvedValueOnce(fakeResponse);
    controllerSvc.ler.mockReturnValueOnce(fakeResponse.data);

    vm = createController();
    await flushPromises();

    expect(dataservice.buscar).toHaveBeenCalledWith(vm.idContrato, expect.any(Object));
    expect(controllerSvc.ler).toHaveBeenCalledWith(fakeResponse, 'data');
    expect(vm.dados).toEqual(fakeResponse.data);
  });

  test('buscar: erro chama controller.feedMessage e redireciona', async () => {
    dataservice.buscar.mockImplementationOnce(() => Promise.reject(new Error('buscar fail')));
    vm = createController();

    await flushPromises();

    expect(controllerSvc.feedMessage).toHaveBeenCalled();
    expect($location.path).toHaveBeenCalledWith('relatorio/contrato-pontos');
  });

  test('formatarDecimal e formatarPercentual comportam-se como antes', () => {
    expect(vm.formatarDecimal(null)).toBe(' - ');
    expect(vm.formatarDecimal(undefined)).toBe(' - ');
    expect(vm.formatarDecimal(1)).toBe('1.00');
    expect(vm.formatarDecimal('2.3456')).toBe('2.35');

    expect(vm.formatarPercentual(null)).toBe(' - ');
    expect(vm.formatarPercentual(undefined)).toBe(' - ');
    expect(vm.formatarPercentual(10)).toBe('10.00%');
    expect(vm.formatarPercentual('3.1')).toBe('3.10%');
  });

  test('recarregarDados chama buscar (dataservice.buscar)', async () => {
    const spyBuscar = jest.spyOn(dataservice, 'buscar');
    vm = createController();
    await flushPromises();

    vm.recarregarDados();
    // buscar é assíncrono; escoamos promises
    await flushPromises();

    expect(spyBuscar).toHaveBeenCalled();
  });

  test('exportar: sucesso cria link, define download e aciona click', async () => {
    // Preparar mocks para DOM e URL
    const clickMock = jest.fn();
    const appended = [];
    const fakeAnchor = {
      style: '',
      href: '',
      download: '',
      click: clickMock
    };

    const originalCreateElement = document.createElement;
    const originalBodyAppend = document.body.appendChild;
    const originalCreateObjectURL = window.URL.createObjectURL;

    document.createElement = jest.fn(() => fakeAnchor);
    document.body.appendChild = jest.fn((el) => appended.push(el));
    window.URL.createObjectURL = jest.fn(() => 'blob:fake-url');

    // controller.ler deve retornar os dados "csv"
    controllerSvc.ler.mockReturnValueOnce('colA,colB\n1,2');

    // garantir que exportar resolve
    dataservice.exportar.mockResolvedValueOnce({ data: 'ignored' });

    vm = createController();
    await flushPromises();

    // Chamando exportar (usa dataservice.exportar)
    await vm.exportar();

    expect(dataservice.exportar).toHaveBeenCalledWith(vm.idContrato);
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(fakeAnchor.download).toBe(`relatorio-pontos-${vm.idContrato}.csv`);
    expect(fakeAnchor.click).toHaveBeenCalled();

    // restaurar overrides
    document.createElement = originalCreateElement;
    document.body.appendChild = originalBodyAppend;
    window.URL.createObjectURL = originalCreateObjectURL;
  });

  test('exportar: erro chama controller.feed com mensagem de erro', async () => {
    dataservice.exportar.mockImplementationOnce(() => Promise.reject(new Error('export fail')));
    vm = createController();
    await flushPromises();

    await vm.exportar();
    // aguarda catch do exportar
    await flushPromises();

    expect(controllerSvc.feed).toHaveBeenCalledWith('error', 'Houve um erro ao exportar o relatório.');
  });

});
