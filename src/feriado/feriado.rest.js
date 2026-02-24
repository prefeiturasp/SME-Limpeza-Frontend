(function () {
	'use strict';
	
	angular
	.module('app.feriado')
	.factory('FeriadoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		let service = new RestUtils(ConfigRest.feriado);

		return service;

	}
	
})();