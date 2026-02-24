(function () {
	'use strict';
	
	angular
	.module('usuario.usuario-status')
	.factory('UsuarioStatusRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.usuarioStatus);
		
		return service;

	}
	
})();