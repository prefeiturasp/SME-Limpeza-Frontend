(function () {

  'use strict';

  angular
    .module('relatorio-contrato.relatorio-contrato-importacao')
    .controller('RelatorioContratoImportacaoController', RelatorioContratoImportacaoController);

  RelatorioContratoImportacaoController.$inject = ['$timeout', '$scope', '$location', '$httpParamSerializer', 'controller', 'RelatorioContratoRest', 'BotaoUploadArquivoUtils'];

  function RelatorioContratoImportacaoController($timeout, $scope, $location, $httpParamSerializer, controller, dataservice, BotaoUploadArquivoUtils) {

    var vm = this;

    vm.listaImportacao = [];

    iniciar();

    $scope.$watch('vm.uploadUtils.response', (newValue, oldValue) => {
      if (newValue !== oldValue) processarResultadoImportacao(newValue);
    });

    function iniciar() {

      vm.model = $location.search();

      if (!vm.model.ano || !vm.model.mes || !vm.model.idContrato || !vm.model.idPrestadorServico) {
        redirecionarListagem();
      }

      buscar();

      $timeout(() => {
        vm.uploadUtils = new BotaoUploadArquivoUtils(`${dataservice.urlImportacao}/?${$httpParamSerializer(vm.model)}`);
        vm.uploader = vm.uploadUtils.uploader;
      }, 50);

    }

    function buscar() {

      dataservice.buscar(vm.model).then(success).catch(error);

      function success(response) {
        vm.dados = controller.ler(response, 'data');
      }

      function error(response) {
        controller.feedMessage(response);
        redirecionarListagem();
      }

    }

    async function processarResultadoImportacao(response) {

      if (!response) return;

      if (!response.status) {
        controller.feed('error', 'Houve um erro ao processar a importação.');
        return;
      }

      controller.feed('success', 'Oba! A importação foi concluída com sucesso.');
      vm.listaImportacao = response.data;

    }

    function redirecionarListagem() {
      controller.$location.path(`/relatorio/contrato`);
    }

  }

})();