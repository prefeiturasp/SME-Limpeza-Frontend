(function () {
	'use strict';
	
	angular
	.module('componentes.endereco')
	.factory('EnderecoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.endereco);
		
		service.buscarEnderecoPorCep = buscarEnderecoPorCep;
		service.buscarCoordenadas = buscarCoordenadas;

		return service;

		function buscarEnderecoPorCep(cep) {
			return $http.get(service.url + '/cep/' + cep);
		}

		function buscarCoordenadas(data) {
			return $http.post(service.url + '/coordenadas/', {
				endereco: data
			});
		}

	}
	
})();