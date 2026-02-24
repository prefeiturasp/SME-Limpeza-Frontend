(() => {

	'use strict';

	angular
		.module('relatorio.relatorio-contrato-pontos')
		.factory('RelatorioContratoPontosRest', dataservice);

	dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];

	function dataservice($http, RestUtils, ConfigRest) {

		const service = new RestUtils(ConfigRest.relatorioContratoPontos);
		service.buscar = buscar;
		service.exportar = exportar;
		service.carregaComboAnos = carregaComboAnos;
		return service;

		function buscar(idContrato, filtros = {}) {
			return $http.get(`${service.url}/${idContrato}`, { params: filtros });
		}

		function exportar(idContrato) {
			return $http.get(`${service.url}/exportar/${idContrato}`);
		}

		function carregaComboAnos(idContrato) {
			return $http.get(`${service.url}/anos/${idContrato}`);
		}
	}

})();