(function () {
	'use strict';

	angular
		.module('usuario.usuario-cargo')
		.factory('UsuarioCargoUtils', UsuarioCargoUtils);

	UsuarioCargoUtils.$inject = ['controller', 'UsuarioCargoRest'];

	function UsuarioCargoUtils(utils, dataservice) {

		var service = {
			carregarCombo: carregarCombo
		};

		return service;

		function carregarCombo(idUsuarioOrigem) {

			return dataservice.carregarCombo(idUsuarioOrigem).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}

		}
		
	}
})();