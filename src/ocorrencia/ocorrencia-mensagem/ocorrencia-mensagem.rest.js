(function () {
	'use strict';
	
	angular
	.module('ocorrencia.ocorrencia-mensagem')
	.factory('OcorrenciaMensagemRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		let service = new RestUtils(ConfigRest.ocorrenciaMensagem);
		service.buscarPorOcorrencia = buscarPorOcorrencia;
		service.buscarUltimos = buscarUltimos;
		return service;

		function buscarPorOcorrencia(id, ignoreLoadingBar) {
			return $http.get(service.url + '/buscar-por-ocorrencia/' + id, {
				ignoreLoadingBar: ignoreLoadingBar
			});
		}

		function buscarUltimos() {
			return $http.get(`${service.url}/ultimos`);
		}

	}
	
})();