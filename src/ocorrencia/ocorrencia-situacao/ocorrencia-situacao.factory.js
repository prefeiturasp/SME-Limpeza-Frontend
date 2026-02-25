(function () {
	'use strict';

	angular
	.module('ocorrencia.ocorrencia-situacao')
	.factory('OcorrenciaSituacaoUtils', OcorrenciaSituacaoUtils);

	OcorrenciaSituacaoUtils.$inject = ['controller', 'OcorrenciaSituacaoRest'];

	function OcorrenciaSituacaoUtils(utils, dataservice) {

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