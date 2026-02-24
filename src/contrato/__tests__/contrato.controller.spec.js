require('../contrato.module.js');
require('../contrato.controller.js');

describe('Controller: ContratoLista (Jest + AngularJS Injector)', () => {
  let $controller, $rootScope, $scope, vm;

  beforeEach(() => {
    // Cria um injector do AngularJS com 'ng' e o seu módulo
    const injector = angular.injector(['ng', 'app.contrato']);

    // Resolve serviços do Angular necessários
    $controller = injector.get('$controller');
    $rootScope = injector.get('$rootScope');

    // Cria um novo scope
    $scope = $rootScope.$new();

    // Instancia o controller com os mocks das dependências
    vm = $controller('ContratoLista as vm', {
      $scope,
      SweetAlert: {},
      $timeout: () => { },
      controller: {
        feed() { },
        feedMessage() { },
        ler(x) { return x; },
        lerRetornoDatatable(r) { return r; }
      },
      ContratoRest: {},
      tabela: {
        criarTabela() { },
        adicionarColunas(c) { return c; },
        criarParametros() { },
        vazia() { return {}; },
        recarregarDados() { }
      },
      $uibModal: {},
      PrestadorServicoUtils: {
        carregarCombo: () => Promise.resolve({ objeto: [] }),
        carregarComboTodos: () => Promise.resolve({ objeto: [] })
      },
      UnidadeEscolarUtils: {
        carregarComboDetalhadoTodos: () => Promise.resolve({ objeto: [] })
      },
      BotaoUploadArquivoUtils: function () { },
      DiretoriaRegionalUtils: {},
      moment: global.moment,
      CargoUtils: {
        carregarCombo: () => Promise.resolve({ objeto: [] })
      }
    });
  });

  describe('getTotalEquipe', () => {
    test('retorna 0 quando unidade é undefined', () => {
      expect($scope.vm.getTotalEquipe(undefined)).toBe(0);
    });

    test('retorna 0 quando equipeLista é undefined', () => {
      expect($scope.vm.getTotalEquipe({})).toBe(0);
    });

    test('soma as quantidades corretamente', () => {
      const unidade = { equipeLista: [{ quantidade: 1 }, { quantidade: 5 }, { quantidade: 1 }, { quantidade: 1 }] };
      expect($scope.vm.getTotalEquipe(unidade)).toBe(8);
    });

    test('trata strings e valores inválidos', () => {
      const unidade = { equipeLista: [{ quantidade: '2' }, { quantidade: null }, { quantidade: '3.5' }, {}] };
      expect($scope.vm.getTotalEquipe(unidade)).toBeCloseTo(5.5, 5);
    });

    test('retorna 0 para lista vazia', () => {
      expect($scope.vm.getTotalEquipe({ equipeLista: [] })).toBe(0);
    });
  });
});

describe('persistirContrato', () => {
  let atualizarMock, feedMock, feedMessageMock, recarregarDadosMock, fecharModalMock;

  beforeEach(() => {
    // Recria o controller com os mocks que precisamos espionar
    const injector = angular.injector(['ng', 'app.contrato']);
    const $controller = injector.get('$controller');
    const $rootScope = injector.get('$rootScope');
    const $scope = $rootScope.$new();

    feedMock = jest.fn();
    feedMessageMock = jest.fn();
    recarregarDadosMock = jest.fn();
    fecharModalMock = jest.fn();

    atualizarMock = jest.fn().mockResolvedValue({ data: { id: 123 } });

    // Reinstancia o controller sobrescrevendo dependências com nossos spies
    const vm = $controller('ContratoLista as vm', {
      $scope,
      SweetAlert: {},
      $timeout: () => { },
      controller: {
        feed: feedMock,
        feedMessage: feedMessageMock,
        ler(x) { return x; },
        lerRetornoDatatable(r) { return r; }
      },
      // Importante: mock do service real usado internamente
      ContratoRest: {
        atualizar: atualizarMock,
        inserir: jest.fn() // não será usado pela persistirContrato
      },
      tabela: {
        criarTabela() { },
        adicionarColunas(c) { return c; },
        criarParametros() { },
        vazia() { return {}; },
        recarregarDados: recarregarDadosMock
      },
      $uibModal: {},
      PrestadorServicoUtils: {
        carregarCombo: () => Promise.resolve({ objeto: [] }),
        carregarComboTodos: () => Promise.resolve({ objeto: [] })
      },
      UnidadeEscolarUtils: {
        carregarComboDetalhadoTodos: () => Promise.resolve({ objeto: [] })
      },
      BotaoUploadArquivoUtils: function () { },
      DiretoriaRegionalUtils: {},
      moment: global.moment,
      CargoUtils: {
        carregarCombo: () => Promise.resolve({ objeto: [] })
      }
    });

    // Injeta um model padrão
    $scope.vm.modal = {
      model: {}
    };

    // Sobrescreve fecharModal no vm para a opção fecharModalPrincipal
    $scope.vm.fecharModal = fecharModalMock;

    // Expõe vm para os testes
    $scope.$apply(); // garante digest inicial
    // Anexa no escopo do describe
    global.__vm = $scope.vm;
  });

  afterEach(() => {
    delete global.__vm;
  });

  test('não chama atualizar quando não há id e resolve com { skipped: true }', async () => {
    const result = await global.__vm.persistirContrato();
    expect(atualizarMock).not.toHaveBeenCalled();
    expect(feedMock).not.toHaveBeenCalled();
    expect(feedMessageMock).not.toHaveBeenCalled();
    expect(recarregarDadosMock).not.toHaveBeenCalled();
    expect(result).toEqual({ skipped: true });
  });

  test('chama atualizar quando existe id e emite feed de sucesso e recarrega tabela', async () => {
    global.__vm.modal.model.id = 42;

    await global.__vm.persistirContrato();

    expect(atualizarMock).toHaveBeenCalledWith(42, global.__vm.modal.model);
    expect(feedMock).toHaveBeenCalledWith('success', 'Contrato salvo com sucesso.');
    expect(recarregarDadosMock).toHaveBeenCalledWith(global.__vm.instancia);
    expect(fecharModalMock).not.toHaveBeenCalled();
  });

  test('usa mensagemSucesso customizada', async () => {
    global.__vm.modal.model.id = 99;

    await global.__vm.persistirContrato({ mensagemSucesso: 'Contrato atualizado!' });

    expect(atualizarMock).toHaveBeenCalledWith(99, global.__vm.modal.model);
    expect(feedMock).toHaveBeenCalledWith('success', 'Contrato atualizado!');
  });

  test('fecha a modal principal quando fecharModalPrincipal = true', async () => {
    global.__vm.modal.model.id = 77;

    const closeSpy = jest.fn();
    global.__vm.modal.close = closeSpy;

    await global.__vm.persistirContrato({ fecharModalPrincipal: true });

    expect(atualizarMock).toHaveBeenCalledTimes(1);
    const [idArg, modelArg] = atualizarMock.mock.calls[0];
    expect(idArg).toBe(77);
    expect(modelArg).toEqual(expect.any(Object));

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  test('propaga erro via controller.feedMessage quando atualizar rejeita', async () => {
    global.__vm.modal.model.id = 55;
    const erro = new Error('Falha na API');
    atualizarMock.mockRejectedValueOnce(erro);

    await expect(global.__vm.persistirContrato()).rejects.toThrow('Falha na API');

    expect(feedMessageMock).toHaveBeenCalledWith(erro);
    expect(feedMock).not.toHaveBeenCalledWith('success', expect.anything());
    expect(fecharModalMock).not.toHaveBeenCalled();
  });
});

describe('salvarCargo e editarCargo', () => {
  let $controller, $rootScope, $scope, vm;
  let feedMock, feedMessageMock;
  let fecharModalCargoSpy;
  let $uibModalOpenSpy;
  let cargoComboMock;

  beforeEach(() => {
    const injector = angular.injector(['ng', 'app.contrato']);
    $controller = injector.get('$controller');
    $rootScope = injector.get('$rootScope');
    $scope = $rootScope.$new();

    feedMock = jest.fn();
    feedMessageMock = jest.fn();

    // Mock do abrir modal para cargos
    $uibModalOpenSpy = jest.fn().mockImplementation(() => {
      // Simula um objeto de modal retornado
      return { close: jest.fn() };
    });

    cargoComboMock = jest.fn().mockResolvedValue({ objeto: [] });

    vm = $controller('ContratoLista as vm', {
      $scope,
      SweetAlert: {},
      $timeout: () => { },
      controller: {
        feed: feedMock,
        feedMessage: feedMessageMock,
        ler(x) { return x; },
        lerRetornoDatatable(r) { return r; }
      },
      ContratoRest: {},
      tabela: {
        criarTabela() { },
        adicionarColunas(c) { return c; },
        criarParametros() { },
        vazia() { return {}; },
        recarregarDados() { }
      },
      $uibModal: { open: $uibModalOpenSpy },
      PrestadorServicoUtils: {
        carregarCombo: () => Promise.resolve({ objeto: [] }),
        carregarComboTodos: () => Promise.resolve({ objeto: [] })
      },
      UnidadeEscolarUtils: {
        carregarComboDetalhadoTodos: () => Promise.resolve({ objeto: [] })
      },
      BotaoUploadArquivoUtils: function () { },
      DiretoriaRegionalUtils: {},
      moment: global.moment,
      CargoUtils: {
        carregarCombo: cargoComboMock
      }
    });

    // Monta o contexto necessário para unidade escolar/modal de cargo
    vm.modal = { model: { unidadeEscolarLista: [] } };
    vm.modalUnidadeEscolar = { model: { equipeLista: [] } };

    // Simula abertura da modal de cargo para que vm.modalCargo exista
    vm.abrirModalCargo();
    // Referência à modal criada no abrirModalCargo
    // $uibModal.open retorna um objeto com close; anexado em vm.modalCargo pelo controller
    // O spy retorna um novo objeto a cada chamada; acessamos o último (único aqui)
    fecharModalCargoSpy = vm.modalCargo.close;
  });

  describe('salvarCargo', () => {
    test('não faz nada se o formulário é inválido', () => {
      const initialLength = vm.modalUnidadeEscolar.model.equipeLista.length;
      vm.salvarCargo({ $invalid: true });

      expect(vm.modalUnidadeEscolar.model.equipeLista.length).toBe(initialLength);
      expect(fecharModalCargoSpy).not.toHaveBeenCalled();
    });

    test('define flagAtivo como true quando não explicitamente false', () => {
      vm.modalCargo.model = { id: 1, descricao: 'Prof A' }; // sem flagAtivo
      vm.salvarCargo({ $invalid: false });

      const salvo = vm.modalUnidadeEscolar.model.equipeLista[0];
      expect(salvo.flagAtivo).toBe(true);
      expect(fecharModalCargoSpy).toHaveBeenCalled();
    });

    test('mantém flagAtivo=false quando explicitamente false', () => {
      vm.modalCargo.model = { id: 1, descricao: 'Prof A', flagAtivo: false };
      vm.salvarCargo({ $invalid: false });

      const salvo = vm.modalUnidadeEscolar.model.equipeLista[0];
      expect(salvo.flagAtivo).toBe(false);
    });

    test('inicializa equipeLista se undefined e adiciona novo cargo', () => {
      vm.modalUnidadeEscolar.model.equipeLista = undefined;
      vm.modalCargo.model = { id: 2, descricao: 'Monitor', quantidade: 3 };

      vm.salvarCargo({ $invalid: false });

      expect(Array.isArray(vm.modalUnidadeEscolar.model.equipeLista)).toBe(true);
      expect(vm.modalUnidadeEscolar.model.equipeLista.length).toBe(1);
      expect(vm.modalUnidadeEscolar.model.equipeLista[0]).toEqual(
        expect.objectContaining({ id: 2, descricao: 'Monitor', quantidade: 3 })
      );
      expect(fecharModalCargoSpy).toHaveBeenCalled();
    });

    test('atualiza cargo existente quando isEditar=true', () => {
      vm.modalUnidadeEscolar.model.equipeLista = [
        { id: 10, descricao: 'Antigo', quantidade: 1, flagAtivo: true },
        { id: 11, descricao: 'Outro', quantidade: 2, flagAtivo: true }
      ];

      // Simula entrar em modo edição
      vm.modalCargo.isEditar = true;
      vm.modalCargo.index = 1;
      vm.modalCargo.model = { id: 11, descricao: 'Atualizado', quantidade: 5, flagAtivo: true };

      vm.salvarCargo({ $invalid: false });

      expect(vm.modalUnidadeEscolar.model.equipeLista[1]).toEqual(
        expect.objectContaining({ id: 11, descricao: 'Atualizado', quantidade: 5 })
      );
      expect(vm.modalUnidadeEscolar.model.equipeLista.length).toBe(2);
      expect(fecharModalCargoSpy).toHaveBeenCalled();
    });
  });

  describe('editarCargo', () => {
    test('abre modal em modo edição, define index e clona o cargo', () => {
      // Prepara a lista
      vm.modalUnidadeEscolar.model.equipeLista = [
        { id: 1, descricao: 'Cargo 1', quantidade: 1 },
        { id: 2, descricao: 'Cargo 2', quantidade: 2 }
      ];

      const cargo = vm.modalUnidadeEscolar.model.equipeLista[1];
      vm.editarCargo(1, cargo);

      // Deve abrir modal
      expect($uibModalOpenSpy).toHaveBeenCalledTimes(2); // 1 de abrirModalCargo no beforeEach + 1 aqui
      // Deve ter inicializado modo edição e índice
      expect(vm.modalCargo.isEditar).toBe(true);
      expect(vm.modalCargo.index).toBe(1);
      // Deve ter clonado o cargo
      expect(vm.modalCargo.model).toEqual(cargo);
      expect(vm.modalCargo.model).not.toBe(cargo); // cópia
    });

    test('garante equipeLista inicializado e chama carregarComboCargo', async () => {
      vm.modalUnidadeEscolar.model.equipeLista = undefined;

      vm.editarCargo(0, { id: 99, descricao: 'Teste' });

      // equipeLista deve estar definido
      expect(Array.isArray(vm.modalUnidadeEscolar.model.equipeLista)).toBe(true);

      // carregarComboCargo foi chamado
      expect(cargoComboMock).toHaveBeenCalled();
      // Resolve a promise e executa digest
      await Promise.resolve();
      $scope.$apply();
    });
  });
});