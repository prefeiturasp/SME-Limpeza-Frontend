(() => {

  'use strict';

  angular
    .module('app.ocorrencia')
    .factory('OcorrenciaUtils', OcorrenciaUtils);

  OcorrenciaUtils.$inject = ['controller', 'OcorrenciaRest'];

  function OcorrenciaUtils(utils, dataservice) {

    let service = {
      buscarPrestadoresComReincidencia: buscarPrestadoresComReincidencia,
      buscarUltimos: buscarUltimos,
    };

    return service;

    function buscarPrestadoresComReincidencia() {

      return dataservice.buscarPrestadoresComReincidencia().then(success).catch(error);

      function success(response) {
        return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
      }

      function error(response) {
        return utils.criarRetornoPromise(false, []);
      }

    }

    function buscarUltimos() {

      return dataservice.buscarUltimos().then(success).catch(error);

      function success(response) {
        return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
      }

      function error(response) {
        return utils.criarRetornoPromise(false, []);
      }

    }

  }

})();