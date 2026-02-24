(() => {

	'use strict';
	
	angular
	.module('app.configuracao')
	.factory('ConfiguracaoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		let service = new RestUtils(ConfigRest.configuracao);
		service.atualizarNoticia = atualizarNoticia;
		return service;

		function atualizarNoticia(conteudo) {
			return $http.post(service.url + '/noticia/', { conteudo });
		}

	}
	
})();