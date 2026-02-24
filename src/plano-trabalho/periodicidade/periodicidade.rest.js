(function () {
	'use strict';
	
	angular
	.module('plano-trabalho.periodicidade')
	.factory('PeriodicidadeRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.periodicidade);

		return service;

	}
	
})();