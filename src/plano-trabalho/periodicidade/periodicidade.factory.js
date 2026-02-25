(function () {
	'use strict';

	angular
	.module('plano-trabalho.periodicidade')
	.factory('PeriodicidadeUtils', PeriodicidadeUtils);

	PeriodicidadeUtils.$inject = ['controller', 'PeriodicidadeRest'];

	function PeriodicidadeUtils(utils, dataservice) {

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