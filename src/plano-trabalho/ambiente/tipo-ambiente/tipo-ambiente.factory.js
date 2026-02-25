(function () {
	'use strict';

	angular
	.module('ambiente.tipo-ambiente')
	.factory('TipoAmbienteUtils', TipoAmbienteUtils);

	TipoAmbienteUtils.$inject = ['controller', 'TipoAmbienteRest'];

	function TipoAmbienteUtils(utils, dataservice) {

		var service = {
			carregarCombo: carregarCombo,
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