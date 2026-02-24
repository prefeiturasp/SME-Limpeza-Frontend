(function () {

  'use strict';

  angular
    .module('plano-trabalho.plano-trabalho-unidade-escolar')
    .factory('PlanoTrabalhoUnidadeEscolarRest', dataservice);

  dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];

  function dataservice($http, RestUtils, ConfigRest) {

    const service = new RestUtils(ConfigRest.planoTrabalhoUnidadeEscolar);

    service.exportarTodos = exportarTodos;
    service.aprovar = aprovar;

    return service;

    function exportarTodos(data) {
      return $http.get(service.url + '/exportar-todos?' + data);
    }

    function aprovar(idPlanoTrabalhoUnidadeEscolar) {
      return $http.post(service.url + '/aprovar/' + idPlanoTrabalhoUnidadeEscolar);
    }

  }

})();