(function () {
	'use strict';
	
	angular
	.module('app.prestador-servico')
	.factory('PrestadorServicoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.prestadorServico);
		service.buscarDadosAcesso = buscarDadosAcesso;
		service.alterarSenhaAplicativo = alterarSenhaAplicativo;
		return service;

		function buscarDadosAcesso() {
			return $http.get(service.url + '/buscar-dados-acesso');
		}

		function alterarSenhaAplicativo(senha) {
			return $http.post(service.url + '/alterar-senha-aplicativo', { senhaAplicativo: senha });
		}

	}
	
})();