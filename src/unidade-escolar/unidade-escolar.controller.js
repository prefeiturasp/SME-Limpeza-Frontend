(function () {

  'use strict';

  angular
    .module('app.unidade-escolar')
    .controller('UnidadeEscolarLista', UnidadeEscolarLista);

  UnidadeEscolarLista.$inject = ['$window', '$rootScope', '$scope', '$location', 'controller', 'UnidadeEscolarRest', 'tabela', '$uibModal', 'DiretoriaRegionalUtils', 'EnderecoUtils'];

  function UnidadeEscolarLista($window, $rootScope, $scope, $location, controller, dataservice, tabela, $uibModal, DiretoriaRegionalUtils, EnderecoUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.instancia = {};
    vm.tabela = {};

    vm.abrirModal = abrirModal;
    vm.fecharModal = fecharModal;
    vm.salvar = salvar;

    vm.evtChangeCEP = evtChangeCEP;
    vm.evtChangeEndereco = evtChangeEndereco;
    vm.verificarLatitudeLongitude = verificarLatitudeLongitude;
    vm.verificarLatitude = verificarLatitude;
    vm.verificarLongitude = verificarLongitude;
    vm.recarregarTabela = recarregarTabela;

    vm.abrirModalResponsavelLegal = abrirModalResponsavelLegal;
    vm.fecharModalResponsavelLegal = fecharModalResponsavelLegal;
    vm.salvarResponsavelLegal = salvarResponsavelLegal;
    vm.removerResponsavelLegal = removerResponsavelLegal;

    vm.abrirMapa = abrirMapa;

    vm.irParaImportacao = irParaImportacao;

    iniciar();

    function iniciar() {
      carregarComboTipoEscola();
      carregarComboDiretoriaRegional();
      montarTabela();
    }

    function montarTabela() {

      criarOpcoesTabela();

      function carregarObjeto(aData) {
        dataservice.buscar(aData.id).then((response) => {
          abrirModal(aData.id, controller.ler(response, 'data'));
        });
      }

      function criarColunasTabela() {

        var colunas = [
          { data: 'descricao', title: 'Nome da Unidade Escolar' },
          { data: 'codigo', title: 'Código' },
          { data: 'tipo', title: 'Tipo' },
          { data: 'dre', title: 'Nome da DRE' },
          { data: 'id', title: 'Ações', width: 15, cssClass: 'text-right', renderWith: tabela.criarBotaoPadrao }
        ];

        vm.tabela.colunas = tabela.adicionarColunas(colunas);

      }

      function criarOpcoesTabela() {

        vm.tabela.opcoes = tabela.criarTabela(ajax, vm, remover, 'data', carregarObjeto);
        criarColunasTabela();

        function ajax(data, callback, settings) {

          dataservice.tabela(tabela.criarParametros(data, vm.filtros)).then(success).catch(error);

          function success(response) {
            const datatable = controller.lerRetornoDatatable(response);
            callback(datatable);
          }

          function error(response) {
            callback(tabela.vazia());
          }

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

    function salvar(formulario) {

      if (formulario.$invalid || !verificarLatitudeLongitude()) {
        return;
      }

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
        controller.feedMessage(response);
        tabela.recarregarDados(vm.instancia);
      }

    }

    function abrirModal(id, unidadeEscolar) {

      vm.modal = $uibModal.open({
        templateUrl: 'src/unidade-escolar/unidade-escolar-form.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });

      vm.modal.model = angular.isDefined(unidadeEscolar) ? angular.copy(unidadeEscolar) : {};
      vm.modal.model.id = id;
      vm.modal.isEditar = angular.isDefined(unidadeEscolar);

    }

    function fecharModal() {
      vm.modal.close();
      delete vm.modal;
    }

    function carregarComboTipoEscola() {

      dataservice.carregarComboTipoEscola().then(success).catch(error);

      function success(response) {
        vm.tipoEscolaList = controller.ler(response, 'data');
      }

      function error(response) {
        vm.tipoEscolaList = [];
      }

    }

    function carregarComboDiretoriaRegional() {

      DiretoriaRegionalUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.diretoriaRegionalList = response.objeto;
      }

      function error(response) {
        vm.diretoriaRegionalList = [];
      }

    }

    function evtChangeCEP(formulario) {

      if (formulario.cep.$invalid) {
        return;
      }

      EnderecoUtils.buscarEnderecoPorCep(vm.modal.model.cep).then(success).catch(error);

      function success(response) {
        vm.modal.model.endereco = response.objeto.endereco;
        vm.modal.model.bairro = response.objeto.bairro;
        vm.modal.model.municipio = response.objeto.municipio;
        vm.modal.model.uf = response.objeto.uf;
        evtChangeEndereco(formulario);
      }

      function error(response) {
        vm.modal.model.endereco = '';
        vm.modal.model.bairro = '';
        evtChangeEndereco(formulario);
        controller.feed('error', 'Erro ao consultar CEP.');
      }

    }

    function evtChangeEndereco() {

      vm.modal.model.latitude = '';
      vm.modal.model.longitude = '';

      if (formulario.endereco.$invalid || formulario.numero.$invalid || formulario.cep.$invalid) {
        return;
      }

      if (angular.isUndefined(vm.modal.model.cep)) {
        return;
      }

      const endereco =
        vm.modal.model.endereco + ',' +
        vm.modal.model.numero + ',' +
        vm.modal.model.bairro + ',' +
        vm.modal.model.municipio + ',' +
        vm.modal.model.uf + ',Brasil';

      EnderecoUtils.buscarCoordenadasPorEndereco(endereco).then(success).catch(error);

      function success(response) {

        if (response.objeto.lat && response.objeto.lng) {
          vm.flagErroCoordenadas = false;
          vm.modal.model.latitude = response.objeto.lat;
          vm.modal.model.longitude = response.objeto.lng;
        } else {
          buscarCoordenadasPorCep(vm.modal.model.cep);
        }

      }

      function error(response) {
        vm.flagErroCoordenadas = true;
        controller.feed('error', 'Erro ao consultar coordenadas por endereço.');
      }

    }

    function buscarCoordenadasPorCep(cep) {

      EnderecoUtils.buscarCoordenadasPorCep(cep).then(success).catch(error);

      function success(response) {

        if (response.objeto.lat && response.objeto.lng) {
          vm.modal.model.latitude = response.objeto.lat;
          vm.modal.model.longitude = response.objeto.lng;
        }
      }

      function error(response) {
        controller.feed('error', 'Erro ao consultar coordenadas por CEP.');
      }

    }

    function recarregarTabela() {
      tabela.recarregarDados(vm.instancia);
    }

    function abrirModalResponsavelLegal(indice, responsavelLegal) {

      vm.modalResponsavelLegal = $uibModal.open({
        templateUrl: 'src/unidade-escolar/unidade-escolar-form-responsavel-legal.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'md',
        keyboard: false
      });

      vm.modalResponsavelLegal.model = angular.isDefined(responsavelLegal) ? angular.copy(responsavelLegal) : {};
      vm.modalResponsavelLegal.index = indice;
      vm.modalResponsavelLegal.isEditar = angular.isDefined(responsavelLegal) && angular.isDefined(indice);

    }

    function fecharModalResponsavelLegal() {
      vm.modalResponsavelLegal.close();
      delete vm.modalResponsavelLegal;
    }

    function salvarResponsavelLegal(formularioResponsavelLegal) {

      if (formularioResponsavelLegal.$invalid) {
        return;
      }

      if (vm.modalResponsavelLegal.isEditar) {
        vm.modal.model.responsavelLegalLista[vm.modalResponsavelLegal.index] = angular.copy(vm.modalResponsavelLegal.model);
      } else {
        vm.modal.model.responsavelLegalLista = vm.modal.model.responsavelLegalLista || [];
        vm.modal.model.responsavelLegalLista.push(angular.copy(vm.modalResponsavelLegal.model));
      }

      fecharModalResponsavelLegal();

    }

    function removerResponsavelLegal(indice) {
      vm.modal.model.responsavelLegalLista.splice(indice, 1);
    }

    function abrirMapa() {

      if (!vm.modal.model.latitude || !vm.modal.model.longitude) {
        controller.feed('warning', 'Sem coordenadas para visualizar no mapa.');
        return;
      }

      vm.linkMapa = 'http://www.google.com/maps/place/' + vm.modal.model.latitude + ',' + vm.modal.model.longitude;
      $window.open(vm.linkMapa, '_blank');

    }

    function verificarLatitudeLongitude() {
      return verificarLatitude() && verificarLongitude();
    }

    function verificarLatitude() {
      const regex = /^-?[0-9]{1,3}(?:\.[0-9]{1,10})?$/;
      return regex.test(vm.modal.model.latitude);
    }

    function verificarLongitude() {
      const regex = /^-?[0-9]{1,3}(?:\.[0-9]{1,10})?$/;
      return regex.test(vm.modal.model.longitude);
    }

    function irParaImportacao() {
      $rootScope.$evalAsync(() => {
        $location.path('unidade-escolar/importar');
      });
    }

  }

})();