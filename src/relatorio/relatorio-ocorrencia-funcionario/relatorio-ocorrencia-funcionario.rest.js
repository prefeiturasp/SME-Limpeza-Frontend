(() => {

  'use strict';

  angular
    .module('relatorio.relatorio-ocorrencia-funcionario')
    .factory('RelatorioOcorrenciaFuncionarioRest', dataservice);

  dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];

  function dataservice($http, RestUtils, ConfigRest) {

    const service = new RestUtils(ConfigRest.relatorioOcorrenciaFuncionario);
    return service;

  }

})();