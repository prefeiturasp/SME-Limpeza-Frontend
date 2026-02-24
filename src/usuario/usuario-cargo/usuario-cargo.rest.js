(function () {
	'use strict';
	
	angular
	.module('usuario.usuario-cargo')
	.factory('UsuarioCargoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.usuarioCargo);
		
		service.carregarCombo = carregarCombo;

		return service;

		function carregarCombo(idUsuarioOrigem) {
			return $http.get(service.url + '/combo/' + idUsuarioOrigem);
		}

	}
	
})();