(function () {
	'use strict';
	
	angular
	.module('ambiente.ambiente-geral')
	.factory('AmbienteGeralRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.ambienteGeral);
		return service;

	}
	
})();