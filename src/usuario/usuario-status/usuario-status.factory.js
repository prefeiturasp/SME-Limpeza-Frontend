(function () {
	'use strict';

	angular
		.module('usuario.usuario-status')
		.factory('UsuarioStatusUtils', UsuarioStatusUtils);

	UsuarioStatusUtils.$inject = ['controller', 'UsuarioStatusRest'];

	function UsuarioStatusUtils(utils, dataservice) {

		var service = {
			carregarCombo: carregarCombo
		};

		return service;

		function carregarCombo() {

			return dataservice.carregarCombo().then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}

		}
		
	}
})();