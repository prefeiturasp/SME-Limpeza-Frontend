(() => {

	'use strict';
	
	angular
	.module('app.declaracao')
	.factory('DeclaracaoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		let service = new RestUtils(ConfigRest.declaracao);

		service.carregarComboTurnos = carregarComboTurnos;
		return service;

		function carregarComboTurnos() {
			return $http.get(service.url + '/combo-turnos/');
		}

	}
	
})();