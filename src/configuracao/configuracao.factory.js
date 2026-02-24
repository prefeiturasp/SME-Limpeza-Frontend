(function () {
	'use strict';

	angular
	.module('app.configuracao')
	.factory('ConfiguracaoUtils', ConfiguracaoUtils);

	ConfiguracaoUtils.$inject = ['controller', 'ConfiguracaoRest'];

	function ConfiguracaoUtils(utils, dataservice) {

		let service = {
			buscar: buscar,
		};

		return service;

		function buscar(parametro) {

			return dataservice.buscar(parametro).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, {});
			}

		}

	}
})();