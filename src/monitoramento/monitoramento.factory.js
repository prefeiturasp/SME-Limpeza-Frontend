(function () {
	'use strict';

	angular
	.module('app.monitoramento')
	.factory('MonitoramentoUtils', MonitoramentoUtils);

	MonitoramentoUtils.$inject = ['controller', 'MonitoramentoRest'];

	function MonitoramentoUtils(utils, dataservice) {

		var service = {
			buscar: buscar
		};

		return service;

		function buscar(id) {

			return dataservice.buscar(id).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, {});
			}

		}

	}
	
})();