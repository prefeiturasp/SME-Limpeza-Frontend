(function () {

  'use strict';

  angular
    .module('ambiente.ambiente-unidade-escolar')
    .controller('AmbienteUnidadeEscolarController', AmbienteUnidadeEscolarController);

  AmbienteUnidadeEscolarController.$inject = ['$rootScope', '$scope', '$location', 'controller', 'AmbienteUnidadeEscolarRest',
    'tabela', '$uibModal', 'TipoAmbienteUtils', 'AmbienteGeralUtils', 'UnidadeEscolarUtils', 'DiretoriaRegionalUtils'];

  function AmbienteUnidadeEscolarController($rootScope, $scope, $location, controller, dataservice,
    tabela, $uibModal, TipoAmbienteUtils, AmbienteGeralUtils, UnidadeEscolarUtils, DiretoriaRegionalUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.instancia = {};
    vm.tabela = {};

    vm.gerarTodosQRCode = gerarTodosQRCode;
    vm.abrirModal = abrirModal;
    vm.fecharModal = fecharModal;
    vm.salvar = salvar;
    vm.recarregarTabela = recarregarTabela;
    vm.evtChangeAmbienteGeral = evtChangeAmbienteGeral;
    vm.evtChangeDiretoriaRegional = evtChangeDiretoriaRegional;
    vm.irParaImportacao = irParaImportacao;

    iniciar();

    function iniciar() {
      carregarComboTipoAmbiente();
      carregarComboAmbienteGeral();
      carregarComboDiretoriaRegional();
      carregarComboUnidadeEscolar();
      montarTabela();
    }

    function montarTabela() {

      criarOpcoesTabela();

      function carregarObjeto(aData) {
        dataservice.buscar(aData.id).then((response) => {
          abrirModal(aData.id, controller.ler(response, 'data'));
        }).catch((error) => {
          controller.feed('error', 'Houve um erro ao carregar o registro solicitado.');
        });
      }

      function criarColunasTabela() {

        let colunas = [];
        if ($rootScope.usuario.usuarioOrigem.codigo === 'sme') {
          colunas.push({ data: 'unidadeEscolar', title: 'Unidade Escolar', renderWith: tabela.formatarUnidadeEscolar });
        }

        colunas.push(
          { data: 'descricao', title: 'Descrição do Ambiente' },
          { data: 'tipoAmbiente', title: 'Tipo de Ambiente', cssClass: 'text-right' },
          {
            data: 'id', title: 'Ação', width: 20, cssClass: 'text-right', renderWith: (id) => {

              if ($rootScope.usuario.usuarioOrigem.codigo === 'sme') {
                return `
								  <button class="mr-1 btn btn-outline-primary btn-sm editar"><i class="icon-pencil"></i></button>
								  <button class="btn btn-outline-danger btn-sm remover"><i class="icon-trash"></i></button>`;
              }

              return `
							  <button class="mr-1 btn btn-outline-dark btn-sm qrcode"><i class="icon-cloud-download"></i></button>
							  <button class="btn btn-outline-primary btn-sm editar"><i class="icon-pencil"></i></button>`;

            }
          }
        );

        vm.tabela.colunas = tabela.adicionarColunas(colunas);

      }

      function criarOpcoesTabela() {

        vm.tabela.opcoes = tabela.criarTabela(ajax, vm, remover, 'data', carregarObjeto);
        vm.tabela.opcoes.withOption('rowCallback', rowCallback);
        criarColunasTabela();

        function ajax(data, callback, settings) {

          dataservice.tabela(tabela.criarParametros(data, vm.filtros)).then(success).catch(error);

          function success(response) {
            callback(controller.lerRetornoDatatable(response));
          }

          function error(response) {
            callback(tabela.vazia());
          }

        }

        function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {

          $('.remover', nRow).off('click');
          $('.remover', nRow).on('click', () => tabela.evtRemover(aData, remover));

          $('.editar', nRow).off('click');
          $('.editar', nRow).on('click', () => carregarObjeto(aData));

          $('.qrcode', nRow).off('click');
          $('.qrcode', nRow).on('click', () => gerarQRCode(aData.id));

        }

        function remover(id) {

          dataservice.remover(id).then(success).catch(error);

          function success(response) {
            controller.feed('success', 'Registro removido com sucesso.');
            tabela.recarregarDados(vm.instancia);
          }

          function error(response) {
            controller.feed('error', 'Erro ao remover registro.');
          }

        }

      }

    }

    function gerarTodosQRCode() {

      dataservice.gerarTodosQRCode().then(success).catch(error);

      function success(response) {
        response = controller.ler(response, 'data');
        controller.downloadArquivo(response);
      }

      function error(response) {
        controller.feed('error', 'Erro ao gerar ao baixar o arquivo.');
      }

    }

    function gerarQRCode(idAmbienteUnidadeEscolar) {

      dataservice.gerarQRCode(idAmbienteUnidadeEscolar).then(success).catch(error);

      function success(response) {
        response = controller.ler(response, 'data');
        controller.downloadArquivo(response);
      }

      function error(response) {
        controller.feed('error', 'Erro ao gerar o QrCode.');
      }

    }

    function carregarComboTipoAmbiente() {

      TipoAmbienteUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.tipoAmbienteList = response.objeto;
      }

      function error(response) {
        vm.tipoAmbienteList = [];
        controller.feed(false, 'Houve um erro ao carregar os tipos de ambiente.');
      }

    }

    function carregarComboAmbienteGeral() {

      AmbienteGeralUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.ambienteGeralList = response.objeto;
      }

      function error(response) {
        vm.ambienteGeralList = [];
        controller.feed(false, 'Houve um erro ao carregar os ambientes da matriz.');
      }
    }

    async function carregarComboUnidadeEscolar() {

      if (vm.modal || !vm.filtros?.idDiretoriaRegional) {
        await UnidadeEscolarUtils.carregarCombo().then(success).catch(error);
      } else {
        await UnidadeEscolarUtils.carregarComboDRE(vm.filtros.idDiretoriaRegional.id).then(success).catch(error);
      }

      function success(response) {
        vm.unidadeEscolarList = response.objeto;
      }

      function error(response) {
        vm.unidadeEscolarLista = [];
        controller.feed('error', 'Houve um erro ao carregar as unidades escolares.');
      }

    }

    function carregarComboDiretoriaRegional() {

      DiretoriaRegionalUtils.carregarCombo().then((response) => {
        vm.diretoriaRegionalList = response.objeto;
      }).catch((error) => {
        vm.diretoriaRegionalList = [];
      });

    }

    function salvar(formulario) {

      if (formulario.$invalid) {
        return;
      }

      vm.modal.model.idUnidadeEscolar = vm.modal.model.unidadeEscolar?.id;

      if (vm.modal.isEditar) {
        dataservice.atualizar(vm.modal.model.id, vm.modal.model).then(success).catch(error);
      } else {
        dataservice.inserir(vm.modal.model).then(success).catch(error);
      }

      function success(response) {
        controller.feed('success', 'Registro salvo com sucesso.');
        tabela.recarregarDados(vm.instancia);
        fecharModal();
      }

      function error(response) {
        controller.feed('error', 'Houve um erro ao salvar registro.');
        tabela.recarregarDados(vm.instancia);
      }

    }

    async function abrirModal(id, ambienteUnidadeEscolar) {

      await carregarComboUnidadeEscolar();

      vm.modal = $uibModal.open({
        templateUrl: 'src/plano-trabalho/ambiente/ambiente-unidade-escolar/ambiente-unidade-escolar-form.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'md',
        keyboard: false,
      });

      vm.modal.model = angular.isDefined(ambienteUnidadeEscolar) ? angular.copy(ambienteUnidadeEscolar) : {};
      vm.modal.model.id = id;
      vm.modal.isEditar = angular.isDefined(ambienteUnidadeEscolar);

      if (vm.modal.isEditar) {
        vm.modal.model.unidadeEscolar = vm.unidadeEscolarList.find(ue => ue.id === vm.modal.model.idUnidadeEscolar);
        vm.modal.model.tipoAmbiente = vm.ambienteGeralList.find((a) => a.id == vm.modal.model.idAmbienteGeral).tipoAmbiente;
      }

    }

    function fecharModal() {
      vm.modal.close();
      delete vm.modal;
    }

    function recarregarTabela() {
      tabela.recarregarDados(vm.instancia);
    }

    function evtChangeAmbienteGeral() {

      if (!vm.modal.model.idAmbienteGeral) {
        return '';
      }

      vm.modal.model.descricao = vm.ambienteGeralList.find((a) => a.id == vm.modal.model.idAmbienteGeral).descricao;
      vm.modal.model.tipoAmbiente = vm.ambienteGeralList.find((a) => a.id == vm.modal.model.idAmbienteGeral).tipoAmbiente;

    }

    function evtChangeDiretoriaRegional() {
      carregarComboUnidadeEscolar();
    }

    function irParaImportacao() {
      $rootScope.$evalAsync(() => {
        $location.path('plano-trabalho/ambiente/ambiente-unidade-escolar/importar');
      });
    }

  }

})();