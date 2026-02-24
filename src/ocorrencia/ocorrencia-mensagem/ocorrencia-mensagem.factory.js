(function () {
	'use strict';

	angular
	.module('ocorrencia.ocorrencia-mensagem')
	.factory('OcorrenciaMensagemUtils', OcorrenciaMensagemUtils);

	OcorrenciaMensagemUtils.$inject = ['controller', 'OcorrenciaMensagemRest'];

	function OcorrenciaMensagemUtils(utils, dataservice) {

		var service = {
			inserir: inserir,
			buscarPorOcorrencia: buscarPorOcorrencia,
			buscarUltimos: buscarUltimos,
		};

		return service;

		function inserir(model) {

			return dataservice.inserir(model).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, {});
			}

		}

		function buscarPorOcorrencia(id, ignoreLoadingBar) {

			return dataservice.buscarPorOcorrencia(id, ignoreLoadingBar).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, {});
			}

		}

		function buscarUltimos() {

			return dataservice.buscarUltimos().then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}
			
		}

	}
	
})();