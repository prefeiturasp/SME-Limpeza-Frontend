(() => {

	'use strict';
	
	angular
	.module('app.configuracao')
	.factory('ConfiguracaoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		let service = new RestUtils(ConfigRest.configuracao);
		service.atualizarNoticia = atualizarNoticia;
		service.buscaManutencaoSistema = buscaManutencaoSistema;
		service.salvaManutencaoSistema = salvaManutencaoSistema;
		service.buscarEmailSettings = buscarEmailSettings;
		service.atualizarEmailSettings = atualizarEmailSettings;
		
		return service;

		function atualizarNoticia(conteudo) {
			return $http.post(service.url + '/noticia/', { conteudo });
		}

		function buscaManutencaoSistema() {
			return $http.get(service.url + '/manutencao-sistema/');
		}

		function salvaManutencaoSistema(manutencao) {
			manutencao  = (manutencao) ? 1 : 0;
			return $http.post(service.url + '/manutencao-sistema/', { manutencao:manutencao });
		}

		function buscarEmailSettings() {
			return $http.get(service.url + '/email-settings');
		}

		function atualizarEmailSettings(settings) {
			return $http.patch(service.url + '/email-settings', settings);
		}
		
	}
	
})();