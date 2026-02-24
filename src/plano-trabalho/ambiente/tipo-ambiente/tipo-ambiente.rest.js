(function () {
	'use strict';
	
	angular
	.module('ambiente.tipo-ambiente')
	.factory('TipoAmbienteRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.tipoAmbiente);
		
		return service;

	}
	
})();