(function () {
	'use strict';

	angular
	.module('plano-trabalho.turno')
	.factory('TurnoUtils', TurnoUtils);

	TurnoUtils.$inject = ['controller', 'TurnoRest'];

	function TurnoUtils(utils, dataservice) {

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