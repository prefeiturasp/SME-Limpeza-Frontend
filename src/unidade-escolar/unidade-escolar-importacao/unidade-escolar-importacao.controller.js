(function () {

  'use strict';

  angular
    .module('unidade-escolar.unidade-escolar-importacao')
    .controller('UnidadeEscolarImportacao', UnidadeEscolarImportacao);

  UnidadeEscolarImportacao.$inject = ['$timeout', '$scope', 'controller', 'UnidadeEscolarRest', 'BotaoUploadArquivoUtils', 'DiretoriaRegionalUtils'];

  function UnidadeEscolarImportacao($timeout, $scope, controller, dataservice, BotaoUploadArquivoUtils, DiretoriaRegionalUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.evtChangeDiretoriaRegional = evtChangeDiretoriaRegional;

    vm.idDiretoriaRegional = null;
    vm.listaImportacao = [];

    iniciar();

    $scope.$watch('vm.uploadUtils.response', (newValue, oldValue) => {
      if (newValue !== oldValue) processarResultadoImportacao(newValue);
    });

    function iniciar() {
      carregarComboDiretoriaRegional();
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

    function evtChangeDiretoriaRegional() {

      delete vm.uploadUtils;
      delete vm.uploader;

      $timeout(() => {
        let urlImportacao = dataservice.urlImportacao + '/' + vm.idDiretoriaRegional;
        vm.uploadUtils = new BotaoUploadArquivoUtils(urlImportacao);
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