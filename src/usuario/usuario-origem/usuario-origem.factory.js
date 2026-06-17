(function () {
	'use strict';

	angular
		.module('usuario.usuario-origem')
		.factory('UsuarioOrigemUtils', UsuarioOrigemUtils);

	UsuarioOrigemUtils.$inject = ['controller', 'UsuarioOrigemRest'];

	function UsuarioOrigemUtils(utils, dataservice) {

		var service = {
			carregarCombo: carregarCombo,
			carregarComboDrePs: carregarComboDrePs
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

		function carregarComboDrePs(idPrestadorServico) {

			return dataservice.carregarComboDrePs(idPrestadorServico).then(success).catch(error);
	
			function success(response) {	
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}
		}

	}
})();