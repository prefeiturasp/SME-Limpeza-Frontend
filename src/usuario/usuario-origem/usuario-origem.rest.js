(function () {
	'use strict';
	
	angular
	.module('usuario.usuario-origem')
	.factory('UsuarioOrigemRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.usuarioOrigem);

		service.carregarComboDrePs = carregarComboDrePs;

		return service;

		function carregarComboDrePs(idPrestadorServico) {
			return $http.get(service.url + '/combo-dre-ps/' + idPrestadorServico);
		}

	}
	
})();