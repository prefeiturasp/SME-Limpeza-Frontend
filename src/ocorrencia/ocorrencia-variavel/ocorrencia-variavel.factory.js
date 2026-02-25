(function () {
  'use strict';

  angular
    .module('ocorrencia.ocorrencia-variavel')
    .factory('OcorrenciaVariavelUtils', OcorrenciaVariavelUtils);

  OcorrenciaVariavelUtils.$inject = ['controller', 'OcorrenciaVariavelRest'];

  function OcorrenciaVariavelUtils(utils, dataservice) {

    const service = {
      carregarComboCadastro: carregarComboCadastro
    };

    return service;

    function carregarComboCadastro(data) {
      return dataservice.carregarComboCadastro(data);
    }

  }

})();