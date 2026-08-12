(function () {
	'use strict';
	
	angular.module('app.feriado-geral').factory('FeriadoGeralRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		let service = new RestUtils(ConfigRest.feriadoGeral);

		return service;

	}
	
})();