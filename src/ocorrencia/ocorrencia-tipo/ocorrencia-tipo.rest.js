(function () {
	'use strict';
	
	angular
	.module('ocorrencia.ocorrencia-tipo')
	.factory('OcorrenciaTipoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.ocorrenciaTipo);
		service.carregarComboCadastro = carregarComboCadastro;
		return service;

		function carregarComboCadastro() {
			return $http.get(service.url + '/combo-cadastro/');
		}

	}
	
})();