(function () {
	'use strict';
	
	angular
	.module('ocorrencia.ocorrencia-situacao')
	.factory('OcorrenciaSituacaoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.ocorrenciaSituacao);

		return service;

	}
	
})();