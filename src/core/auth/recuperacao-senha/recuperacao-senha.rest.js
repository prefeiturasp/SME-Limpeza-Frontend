(function () {
	'use strict';

	angular
	.module('auth.recuperacao-senha')
	.factory('RecuperacaoSenhaRest', dataservice);

	dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];

	function dataservice($http, RestUtils, ConfigRest) {

		var service = new RestUtils(ConfigRest.recuperacaoSenha);

		return service;
		
	}
	
})();