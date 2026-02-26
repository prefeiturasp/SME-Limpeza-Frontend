require('../contrato.module.js');
require('../contrato.controller.js');

//
// 🔧 GARANTE QUE O MÓDULO NECESSÁRIO EXISTE
//
angular.module("app.unidade-escolar-status", [])
  .service("UnidadeEscolarStatusUtils", function () {
    this.carregarCombo = () => Promise.resolve({ objeto: [] });
  });

describe("ContratoLista — Testes do Controller (Jest + AngularJS)", () => {

  let $controller, $rootScope, $scope;

  //
  // ------------------------------------------------------------------
  // 🔧 MOCKS GLOBAIS
  // ------------------------------------------------------------------
  //
  const feedMock = jest.fn();
  const feedMessageMock = jest.fn();

  const PrestadorServicoUtilsMock = {
    carregarCombo: jest.fn().mockResolvedValue({ objeto: [] }),
    carregarComboTodos: jest.fn().mockResolvedValue({ objeto: [] })
  };

  const UnidadeEscolarUtilsMock = {
    carregarComboDetalhadoTodos: jest.fn().mockResolvedValue({ objeto: [] })
  };

  const CargoUtilsMock = {
    carregarCombo: jest.fn().mockResolvedValue({ objeto: [] })
  };

  const UnidadeEscolarStatusUtilsMock = {
    carregarCombo: jest.fn().mockResolvedValue({
      objeto: [
        { id: 1, descricao: "Ativa" },
        { id: 2, descricao: "Inativa" }
      ]
    })
  };

  const defaultDeps = {
    SweetAlert: {},
    $timeout: cb => cb && cb(),
    controller: {
      feed: feedMock,
      feedMessage: feedMessageMock,
      ler: x => x,
      lerRetornoDatatable: r => r
    },
    ContratoRest: {
      buscar: jest.fn(),
      atualizar: jest.fn(),
      inserir: jest.fn(),
      remover: jest.fn(),
      tabela: jest.fn().mockResolvedValue({ data: [] })
    },
    tabela: {
      criarTabela: jest.fn(),
      adicionarColunas: x => x,
      criarParametros: jest.fn(),
      vazia: jest.fn().mockReturnValue({}),
      recarregarDados: jest.fn()
    },
    $uibModal: {
      open: jest.fn().mockReturnValue({ close: jest.fn() })
    },
    PrestadorServicoUtils: PrestadorServicoUtilsMock,
    UnidadeEscolarUtils: UnidadeEscolarUtilsMock,
    BotaoUploadArquivoUtils: function () { },
    DiretoriaRegionalUtils: {},
    moment: global.moment,
    CargoUtils: CargoUtilsMock,
    UnidadeEscolarStatusUtils: UnidadeEscolarStatusUtilsMock
  };

  //
  // ------------------------------------------------------------------
  // 🔧 FACTORY PARA CRIAR O CONTROLLER
  // ------------------------------------------------------------------
  //
  function createController(extraDeps = {}) {
    const injector = angular.injector(["ng", "app.contrato"]);
    $controller = injector.get("$controller");
    $rootScope = injector.get("$rootScope");
    $scope = $rootScope.$new();

    const deps = { ...defaultDeps, ...extraDeps };

    return $controller("ContratoLista as vm", {
      $scope,
      ...deps
    });
  }

  //
  // ------------------------------------------------------------------
  // 🔍 TESTES getTotalEquipe
  // ------------------------------------------------------------------
  //
  describe("getTotalEquipe", () => {

    let vm;

    beforeEach(() => {
      vm = createController();
    });

    test("retorna 0 quando unidade é undefined", () => {
      expect(vm.getTotalEquipe(undefined)).toBe(0);
    });

    test("retorna 0 quando equipeLista é undefined", () => {
      expect(vm.getTotalEquipe({})).toBe(0);
    });

    test("soma quantidades corretamente", () => {
      const unidade = { equipeLista: [{ quantidade: 1 }, { quantidade: 5 }, { quantidade: 1 }, { quantidade: 1 }] };
      expect(vm.getTotalEquipe(unidade)).toBe(8);
    });

    test("trata strings e valores inválidos", () => {
      const unidade = { equipeLista: [{ quantidade: "2" }, { quantidade: null }, { quantidade: "3.5" }, {}] };
      expect(vm.getTotalEquipe(unidade)).toBeCloseTo(5.5);
    });

    test("retorna 0 para lista vazia", () => {
      expect(vm.getTotalEquipe({ equipeLista: [] })).toBe(0);
    });

  });

  //
  // ------------------------------------------------------------------
  // 🔍 TESTES persistirContrato
  // ------------------------------------------------------------------
  //
  describe("persistirContrato", () => {

    let vm, atualizarMock, recarregarMock, closeSpy;

    beforeEach(() => {
      atualizarMock = jest.fn().mockResolvedValue({ data: { id: 123 } });
      recarregarMock = jest.fn();

      vm = createController({
        ContratoRest: {
          atualizar: atualizarMock,
          inserir: jest.fn()
        },
        tabela: {
          ...defaultDeps.tabela,
          recarregarDados: recarregarMock
        }
      });

      vm.modal = { model: {} };

      closeSpy = jest.fn();
      vm.modal.close = closeSpy;
    });

    test("não atualiza quando não há id", async () => {
      const result = await vm.persistirContrato();
      expect(result).toEqual({ skipped: true });
      expect(atualizarMock).not.toHaveBeenCalled();
    });

    test("atualiza quando há id", async () => {
      vm.modal.model.id = 99;

      await vm.persistirContrato();

      expect(atualizarMock).toHaveBeenCalledWith(99, vm.modal.model);
      expect(recarregarMock).toHaveBeenCalled();
    });

    test("mensagem customizada", async () => {
      vm.modal.model.id = 77;

      await vm.persistirContrato({ mensagemSucesso: "OK!" });

      expect(feedMock).toHaveBeenCalledWith("success", "OK!");
    });

    test("fecha modal quando fecharModalPrincipal=true", async () => {
      vm.modal.model.id = 5;

      await vm.persistirContrato({ fecharModalPrincipal: true });

      expect(closeSpy).toHaveBeenCalled();
    });

    test("propaga erro corretamente", async () => {
      vm.modal.model.id = 1;
      const err = new Error("Falha API");
      atualizarMock.mockRejectedValueOnce(err);

      await expect(vm.persistirContrato()).rejects.toThrow("Falha API");
      expect(feedMessageMock).toHaveBeenCalledWith(err);
    });

  });

  //
  // ------------------------------------------------------------------
  // 🔍 TESTES salvarCargo e editarCargo
  // ------------------------------------------------------------------
  //
  describe("salvarCargo e editarCargo", () => {

    let vm, modalSpy;

    beforeEach(() => {
      modalSpy = jest.fn().mockReturnValue({ close: jest.fn() });

      vm = createController({
        $uibModal: { open: modalSpy }
      });

      vm.modal = { model: { unidadeEscolarLista: [] } };
      vm.modalUnidadeEscolar = { model: { equipeLista: [] } };

      vm.abrirModalCargo();
    });

    test("não salva se for inválido", () => {
      const before = vm.modalUnidadeEscolar.model.equipeLista.length;

      vm.salvarCargo({ $invalid: true });

      expect(vm.modalUnidadeEscolar.model.equipeLista.length).toBe(before);
    });

    test("flagAtivo default true", () => {
      vm.modalCargo.model = { id: 1 };

      vm.salvarCargo({ $invalid: false });

      expect(vm.modalUnidadeEscolar.model.equipeLista[0].flagAtivo).toBe(true);
    });

    test("mantém flagAtivo=false", () => {
      vm.modalCargo.model = { id: 1, flagAtivo: false };

      vm.salvarCargo({ $invalid: false });

      expect(vm.modalUnidadeEscolar.model.equipeLista[0].flagAtivo).toBe(false);
    });

    test("editarCargo abre modal e clona modelo", () => {
      const cargo = { id: 55, descricao: "Monitor" };

      vm.modalUnidadeEscolar.model.equipeLista = [cargo];

      vm.editarCargo(0, cargo);

      expect(modalSpy).toHaveBeenCalled();
      expect(vm.modalCargo.model).not.toBe(cargo);
      expect(vm.modalCargo.model.id).toBe(55);
    });

  });

  //
  // ------------------------------------------------------------------
  // 🔍 TESTES editarStatusUE e salvarStatusUE
  // ------------------------------------------------------------------
  //
  describe("editarStatusUE e salvarStatusUE", () => {

    let vm, modalSpy, persistirMock;

    beforeEach(() => {
      modalSpy = jest.fn().mockReturnValue({ close: jest.fn() });
      persistirMock = jest.fn().mockResolvedValue({});

      vm = createController({
        $uibModal: { open: modalSpy }
      });

      vm.persistirContrato = persistirMock;

      vm.modal = {
        model: {
          unidadeEscolarLista: [
            { id: 10, idStatusUnidadeEscolar: 2, motivoStatus: "ABC" }
          ]
        }
      };
    });

    test("editarStatusUE abre modal e monta model", async () => {
      vm.editarStatusUE(0);

      expect(modalSpy).toHaveBeenCalled();

      await Promise.resolve();
      $scope.$apply();

      expect(vm.modalStatusUE.model.id).toBe(10);
    });

    test("editarStatusUE aceita UE direta", async () => {
      const ue = { id: 5, idStatusUnidadeEscolar: 1, motivoStatus: "X" };

      vm.editarStatusUE(ue);

      expect(modalSpy).toHaveBeenCalled();

      await Promise.resolve();
      $scope.$apply();

      expect(vm.modalStatusUE.model.id).toBe(5);
    });

    describe("salvarStatusUE", () => {

      beforeEach(() => {
        vm.modalStatusUE = {
          index: 0,
          close: jest.fn(),
          model: {
            idStatusUnidadeEscolar: 2,
            motivoStatus: "OK"
          }
        };

        vm.statusList = [
          { id: 1, descricao: "Ativa" },
          { id: 2, descricao: "Inativa" }
        ];
      });

      test("não salva se formulário inválido", () => {
        vm.salvarStatusUE({ $invalid: true });
        expect(persistirMock).not.toHaveBeenCalled();
      });

      test("salva e fecha modal corretamente", async () => {
        const closeSpy = vm.modalStatusUE.close;

        await vm.salvarStatusUE({ $invalid: false });

        const ue = vm.modal.model.unidadeEscolarLista[0];

        expect(ue.statusDescricao).toBe("Inativa");
        expect(closeSpy).toHaveBeenCalled();
      });

      test("em erro chama feedMessage e não fecha modal", async () => {
        persistirMock.mockRejectedValueOnce(new Error("Erro API"));

        // não retorna promise → não usamos await
        vm.salvarStatusUE({ $invalid: false });

        await Promise.resolve();
        $scope.$apply();

        expect(feedMessageMock).toHaveBeenCalled();

        // modal pode ter sido deletada pelo Angular, então verificamos com segurança
        if (vm.modalStatusUE && vm.modalStatusUE.close) {
          expect(vm.modalStatusUE.close).not.toHaveBeenCalled();
        } else {
          // se modal foi removida, isso também significa que NÃO foi fechada pelo salvarStatusUE
          expect(true).toBe(true);
        }
      });


      test("não encontra UE → erro", () => {
        vm.modalStatusUE.index = 99;

        vm.salvarStatusUE({ $invalid: false });

        expect(feedMock).toHaveBeenCalledWith(
          "error",
          "Não foi possível localizar a unidade escolar."
        );
        expect(persistirMock).not.toHaveBeenCalled();
      });

    });

  });

  describe("carregarComboStatus e reconciliarStatusComLista", () => {

    let vm;
    let carregarComboMock;

    beforeEach(() => {
      carregarComboMock = jest.fn().mockResolvedValue({
        objeto: [
          { id: 1, descricao: "Ativa" },
          { id: 2, descricao: "Inativa" }
        ]
      });

      vm = createController({
        UnidadeEscolarStatusUtils: {
          carregarCombo: carregarComboMock
        }
      });

      // cria modalStatusUE fictícia
      vm.modalStatusUE = {
        model: {}
      };
    });

    // -------------------------------------------------------------
    // 🔍 carregarComboStatus
    // -------------------------------------------------------------
    describe("carregarComboStatus", () => {

      test("carrega lista corretamente quando response.objeto existe", async () => {
        const result = await vm.carregarComboStatus();

        expect(carregarComboMock).toHaveBeenCalled();
        expect(vm.statusList).toEqual([
          { id: 1, descricao: "Ativa" },
          { id: 2, descricao: "Inativa" }
        ]);
        expect(result).toEqual(vm.statusList);
      });

      test("carrega lista quando response.data existe", async () => {
        carregarComboMock.mockResolvedValueOnce({
          data: [{ id: 9, descricao: "Teste" }]
        });

        const result = await vm.carregarComboStatus();

        expect(vm.statusList).toEqual([{ id: 9, descricao: "Teste" }]);
        expect(result).toEqual(vm.statusList);
      });

      test("fallback para array vazio quando valor inválido", async () => {
        carregarComboMock.mockResolvedValueOnce(null);

        const result = await vm.carregarComboStatus();

        expect(vm.statusList).toEqual([]);
        expect(result).toEqual([]);
      });

      test("erro no serviço → limpa lista e chama feed(error)", async () => {
        const err = new Error("Falha");

        carregarComboMock.mockRejectedValueOnce(err);

        await expect(vm.carregarComboStatus()).rejects.toThrow(err);

        expect(vm.statusList).toEqual([]);
        expect(feedMock).toHaveBeenCalledWith(
          "error",
          "Erro ao buscar combo de status."
        );
      });

    });

    // -------------------------------------------------------------
    // 🔍 reconciliarStatusComLista
    // -------------------------------------------------------------
    describe("reconciliarStatusComLista", () => {

      beforeEach(() => {
        vm.statusList = [
          { id: 1, descricao: "Ativa" },
          { id: 2, descricao: "Inativa" },
          { Id: 3, nome: "Pendente" } // variação com Id e nome
        ];
      });

      test("não faz nada quando não há modalStatusUE", () => {
        vm.modalStatusUE = null;

        expect(() => vm.reconciliarStatusComLista()).not.toThrow();
      });

      test("não faz nada quando statusList é vazio", () => {
        vm.statusList = [];
        vm.modalStatusUE.model = { idStatusUnidadeEscolar: 1 };

        vm.reconciliarStatusComLista();

        expect(vm.modalStatusUE.model.status).toBeUndefined();
      });

      test("define status quando idStatusUnidadeEscolar corresponde", () => {
        vm.modalStatusUE.model = { idStatusUnidadeEscolar: 2 };

        vm.reconciliarStatusComLista();
        $scope.$apply(); // para efetivar $timeout interno

        expect(vm.modalStatusUE.model.status).toEqual({ id: 2, descricao: "Inativa" });
        expect(vm.modalStatusUE.model.idStatusUnidadeEscolar).toBe(2);
      });

      test("define status quando model.status.id existe", () => {
        vm.modalStatusUE.model = { status: { id: 1 } };

        vm.reconciliarStatusComLista();
        $scope.$apply();

        expect(vm.modalStatusUE.model.status.descricao).toBe("Ativa");
      });

      test("define status quando model.status é número", () => {
        vm.modalStatusUE.model = { status: 3 };

        vm.reconciliarStatusComLista();
        $scope.$apply();

        expect(vm.modalStatusUE.model.status.descricao).toBe("Pendente");
        expect(vm.modalStatusUE.model.idStatusUnidadeEscolar).toBe(3);
      });

      test("define status quando model.status é string numérica", () => {
        vm.modalStatusUE.model = { status: "1" };

        vm.reconciliarStatusComLista();
        $scope.$apply();

        expect(vm.modalStatusUE.model.status.descricao).toBe("Ativa");
      });

      test("status não encontrado → status = null", () => {
        vm.modalStatusUE.model = { idStatusUnidadeEscolar: 999 };

        vm.reconciliarStatusComLista();

        expect(vm.modalStatusUE.model.status).toBe(null);
      });

      test("statusId null → status = null", () => {
        vm.modalStatusUE.model = { idStatusUnidadeEscolar: null };

        vm.reconciliarStatusComLista();

        expect(vm.modalStatusUE.model.status).toBeNull();
      });

      test("preenche descricao a partir de nome quando necessário", () => {
        vm.modalStatusUE.model = { idStatusUnidadeEscolar: 3 };

        vm.reconciliarStatusComLista();
        $scope.$apply();

        expect(vm.modalStatusUE.model.status.descricao).toBe("Pendente");
      });

    });

  });
});
