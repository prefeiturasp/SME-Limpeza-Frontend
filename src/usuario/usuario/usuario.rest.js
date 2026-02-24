(function () {
	'use strict';
	
	angular
	.module('usuario.usuario')
	.factory('UsuarioRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		let service = new RestUtils(ConfigRest.usuario);
		
		service.urlImportacao = service.url + '/importar';
		service.buscarMenu = buscarMenu;
		service.alterarSenha = alterarSenha;

		return service;

		function buscarMenu() {
			return $http.get(service.url + '/menu');
		}

		function alterarSenha(dados) {
            return $http.post(service.url + '/alterar-senha', dados);
        }

	}
	
})();