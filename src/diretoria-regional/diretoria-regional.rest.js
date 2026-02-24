(function () {
	'use strict';
	
	angular
	.module('app.diretoria-regional')
	.factory('DiretoriaRegionalRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		let service = new RestUtils(ConfigRest.diretoriaRegional);
		
		service.urlImportacao = service.url + '/importar';

		return service;

	}
	
})();