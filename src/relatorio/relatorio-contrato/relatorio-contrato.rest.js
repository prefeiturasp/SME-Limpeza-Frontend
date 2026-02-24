(() => {

  'use strict';

  angular
    .module('relatorio.relatorio-contrato')
    .factory('RelatorioContratoRest', dataservice);

  dataservice.$inject = ['$http', '$httpParamSerializer', 'RestUtils', 'ConfigRest'];

  function dataservice($http, $httpParamSerializer, RestUtils, ConfigRest) {

    const service = new RestUtils(ConfigRest.relatorioContrato);

    service.buscar = buscar;
    service.exportar = exportar;

    service.urlImportacao = service.url + '/importar';

    return service;

    function buscar(filtros) {
      return $http.get(`${service.url}/?${$httpParamSerializer(filtros)}`);
    }

    function exportar(filtros) {
      return $http.get(`${service.url}/exportar/?${$httpParamSerializer(filtros)}`);
    }

  }

})();