(function () {
  'use strict';

  angular
    .module('componentes.botao-upload-arquivo')
    .factory('BotaoUploadArquivoUtils', BotaoUploadArquivoUtils);

  BotaoUploadArquivoUtils.$inject = ['$rootScope', 'controller', 'FileUploader', 'AuthToken', 'cfpLoadingBar'];

  function BotaoUploadArquivoUtils($rootScope, controller, FileUploader, AuthToken, cfpLoadingBar) {

    function ComponenteUpload(url) {

      var vm = this;

      iniciar();

      function iniciar() {

        vm.uploader = new FileUploader({
          url: url,
          headers: getHeaders(),
          autoUpload: true,
          queueLimit: 1,
          removeAfterUpload: true,
          onWhenAddingFileFailed: onWhenAddingFileFailed,
          onErrorItem: onErrorItem,
          onSuccessItem: onSuccessItem,
          onAfterAddingFile: onAfterAddingFile,
        });

      }

      function getHeaders() {

        let headers = {};

        if (AuthToken.getToken('accessToken')) {
          headers.Authorization = 'Bearer ' + AuthToken.getToken('accessToken');
        }

        return headers;

      }

      function onWhenAddingFileFailed(item, filter, options) {

        cfpLoadingBar.complete();

        if (filter.name === 'queueLimit') {
          controller.feed('warning', 'Não é possível anexar mais que 01 arquivo.');
        }

      }

      function onErrorItem(item, response, status, headers) {

        cfpLoadingBar.complete();
        vm.uploader.destroy();
        iniciar();
        controller.feed('error', response.msg ? response.msg : 'Houve um erro ao carregar o arquivo.');

      }

      async function onSuccessItem(item, response, status, headers) {
        cfpLoadingBar.complete();
        vm.response = response;
        $rootScope.$apply();
        vm.uploader.destroy();
        iniciar();
      }

      function onAfterAddingFile(item) {
        cfpLoadingBar.start();
      }

    }

    return ComponenteUpload;

  }

})();