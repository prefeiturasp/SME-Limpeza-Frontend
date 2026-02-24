(function () {
  'use strict';

  angular
    .module('plano-trabalho.plano-trabalho-unidade-escolar')
    .factory('PlanoTrabalhoUnidadeEscolarUtils', PlanoTrabalhoUnidadeEscolarUtils);

  PlanoTrabalhoUnidadeEscolarUtils.$inject = ['controller', 'PlanoTrabalhoUnidadeEscolarRest'];

  function PlanoTrabalhoUnidadeEscolarUtils(utils, dataservice) {

    const service = {
      carregarCombo: carregarCombo,
    };

    return service;

    function carregarCombo() {

      return dataservice.carregarCombo().then(success).catch(error);

      function success(response) {
        return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
      }

      function error(response) {
        return utils.criarRetornoPromise(false, []);
      }

    }

  }

})();