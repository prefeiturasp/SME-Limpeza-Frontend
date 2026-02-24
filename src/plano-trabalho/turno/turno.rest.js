(function () {
	'use strict';
	
	angular
	.module('plano-trabalho.turno')
	.factory('TurnoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.turno);

		return service;

	}
	
})();