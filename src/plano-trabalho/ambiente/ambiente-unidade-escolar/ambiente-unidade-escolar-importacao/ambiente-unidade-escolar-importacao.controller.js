(function () {

  'use strict';

  angular
    .module('ambiente-unidade-escolar.ambiente-unidade-escolar-importacao')
    .controller('AmbienteUnidadeEscolarImportacao', AmbienteUnidadeEscolarImportacao);

  AmbienteUnidadeEscolarImportacao.$inject = ['$timeout', '$scope', 'controller', 'AmbienteUnidadeEscolarRest', 'BotaoUploadArquivoUtils'];

  function AmbienteUnidadeEscolarImportacao($timeout, $scope, controller, dataservice, BotaoUploadArquivoUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.listaImportacao = [];

    iniciar();

    $scope.$watch('vm.uploadUtils.response', (newValue, oldValue) => {
      if (newValue !== oldValue) processarResultadoImportacao(newValue);
    });

    function iniciar() {

      $timeout(() => {
        vm.uploadUtils = new BotaoUploadArquivoUtils(dataservice.urlImportacao);
        vm.uploader = vm.uploadUtils.uploader;
      }, 50);

    }

    async function processarResultadoImportacao(response) {

      if (!response) return;

      if (!response.status) {
        controller.feed('error', 'Houve um erro ao processar a importação.');
        return;
      }

      controller.feed('success', 'Oba! A importação foi concluída com sucesso.');
      vm.listaImportacao = response.data;
      evtChangeDiretoriaRegional();

    }

  }

})();