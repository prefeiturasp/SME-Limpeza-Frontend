(function () {

  'use strict';

  angular
    .module('app.ocorrencia')
    .factory('OcorrenciaRest', dataservice);

  dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];

  function dataservice($http, RestUtils, ConfigRest) {

    let service = new RestUtils(ConfigRest.ocorrencia);

    service.encerrar = encerrar;
    service.reabrir = reabrir;
    service.buscarPrestadoresComReincidencia = buscarPrestadoresComReincidencia;
    service.exportar = exportar;
    service.buscarUltimos = buscarUltimos;
    service.comboUesPorIdContrato = comboUesPorIdContrato;

    return service;

    function encerrar(id, model) {
      return $http.patch(service.url + '/encerrar/' + id, model);
    }

    function reabrir(idOcorrencia) {
      return $http.patch(service.url + '/reabrir/' + idOcorrencia);
    }

    function buscarPrestadoresComReincidencia() {
      return $http.get(service.url + '/reincidencia-por-prestador/');
    }

    function exportar(filtros) {
      return $http.get(`${service.url}/exportar?filtros=${encodeURI(JSON.stringify(filtros))}`);
    }

    function buscarUltimos() {
      return $http.get(`${service.url}/ultimos`);
    }

    function comboUesPorIdContrato(idsContratos) {

			let arrIdsContrato = idsContratos['idContratoList'];

			$http.post(`${service.url}/ocorrencia-retroativa/comboTodasUesPorIdContrato/`, arrIdsContrato).then(function (response) {
        console.log(response.data);
				return response.data;
			});
		}

  }

})();