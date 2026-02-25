(function () {

  'use strict';

  angular
    .module('diretoria-regional.diretoria-regional-importacao')
    .controller('DiretoriaRegionalImportacao', DiretoriaRegionalImportacao);

  DiretoriaRegionalImportacao.$inject = ['$rootScope', '$scope', 'controller', 'DiretoriaRegionalRest', 'BotaoUploadArquivoUtils', '$uibModal'];

  function DiretoriaRegionalImportacao($rootScope, $scope, controller, dataservice, BotaoUploadArquivoUtils, $uibModal) {
    /* jshint validthis: true */

    var vm = this;

    vm.listaImportacao = [];

    iniciar();

    function iniciar() {
      vm.uploadUtils = new BotaoUploadArquivoUtils(dataservice.urlImportacao);
      vm.uploader = vm.uploadUtils.uploader;
    }

    $scope.$watch('vm.uploadUtils.response', (newValue, oldValue) => {
      if (newValue !== oldValue) processarResultadoImportacao(newValue);
    });

    async function processarResultadoImportacao(response) {

      if (!response.status) {
        controller.feed('error', 'Houve um erro ao processar a importação.');
        return;
      }

      controller.feed('success', 'Oba! A importação foi concluída com sucesso.');
      vm.listaImportacao = response.data;

    }

  }

})();