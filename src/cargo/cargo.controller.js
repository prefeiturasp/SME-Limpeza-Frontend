(function () {

  'use strict';

  angular
    .module('app.cargo')
    .controller('CargoLista', CargoLista);

  CargoLista.$inject = ['$rootScope', '$scope', '$location', 'controller', 'CargoRest', 'tabela', '$uibModal'];

  function CargoLista($rootScope, $scope, $location, controller, dataservice, tabela, $uibModal) {
    /* jshint validthis: true */

    var vm = this;

    vm.instancia = {};
    vm.tabela = {};

    vm.recarregarTabela = recarregarTabela;

    vm.abrirModal = abrirModal;
    vm.fecharModal = fecharModal;
    vm.salvar = salvar;

    iniciar();

    function iniciar() {
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
          { data: 'descricao', title: 'Descrição do Cargo' },
          { data: 'id', title: 'Ações', width: 15, cssClass: 'text-right', renderWith: tabela.criarBotaoRemocao }
        ];

        vm.tabela.colunas = tabela.adicionarColunas(colunas);

      }

      function criarOpcoesTabela() {

        vm.tabela.opcoes = tabela.criarTabela(ajax, vm, remover, 'data', carregarObjeto);
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

        function remover(id) {

          dataservice.remover(id).then(success).catch(error);

          function success(response) {
            controller.feed('success', 'Registro removido com sucesso.');
            tabela.recarregarDados(vm.instancia);
          }

          function error(response) {
            controller.feedMessage(response);
          }

        }

      }

    }

    function salvar(formulario) {

      if (formulario.$invalid) {
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

    function abrirModal(id, diretoriaRegional) {

      vm.modal = $uibModal.open({
        templateUrl: 'src/cargo/cargo-form.html',
        backdrop: 'static',
        scope: $scope,
        size: 'md',
        keyboard: false,
      });

      vm.modal.model = Object.assign({}, diretoriaRegional);
      vm.modal.model.id = id;
      vm.modal.isEditar = angular.isDefined(diretoriaRegional);

    }

    function fecharModal() {
      vm.modal.close();
      delete vm.modal;
    }

    function recarregarTabela() {
      tabela.recarregarDados(vm.instancia);
    }

  }

})();