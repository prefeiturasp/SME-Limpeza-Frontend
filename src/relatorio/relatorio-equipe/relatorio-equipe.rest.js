(() => {

  'use strict';

  angular
    .module('relatorio.relatorio-equipe')
    .factory('RelatorioEquipeRest', dataservice);

  dataservice.$inject = ['$http', '$httpParamSerializer', 'RestUtils', 'ConfigRest'];

  function dataservice($http, $httpParamSerializer, RestUtils, ConfigRest) {

    const service = new RestUtils(ConfigRest.relatorioEquipe);
    service.buscar = buscar;
    service.exportar = exportar;
    return service;

    function buscar(ano, mes, idEquipe) {
      return $http.get(`${service.url}/${ano}/${mes}/${idEquipe}`);
    }

    function exportar(filtros) {
      return $http.get(`${service.url}/exportar?${$httpParamSerializer(filtros)}`);
    }

  }

})();