(function () {
	'use strict';

	angular
	.module('core.auth')
	.factory('LoginRest', dataservice);

	dataservice.$inject = ['$http', 'ConfigRest'];

	function dataservice($http, ConfigRest) {

		var service = {
			entrar: entrar,
			enviarEmailRecuperacao: enviarEmailRecuperacao,
			url: ConfigRest.url + ConfigRest.authenticate
		};

		return service;

		function entrar(model) {	
			/*jshint validthis: true */
			return $http.post(this.url, model);
		}

		function enviarEmailRecuperacao(model) {	
			/*jshint validthis: true */
			return $http.post(this.url + '/enviar-email-recuperacao', model);
		}
		
	}
	
})();