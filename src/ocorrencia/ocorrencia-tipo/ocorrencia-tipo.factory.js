(function () {
	'use strict';

	angular
	.module('ocorrencia.ocorrencia-tipo')
	.factory('OcorrenciaTipoUtils', OcorrenciaTipoUtils);

	OcorrenciaTipoUtils.$inject = ['controller', 'OcorrenciaTipoRest'];

	function OcorrenciaTipoUtils(utils, dataservice) {

		var service = {
			buscar: buscar,
			carregarCombo: carregarCombo,
			carregarComboCadastro: carregarComboCadastro,
			remover: remover,
			inserir: inserir,
		};

		return service;

		function buscar(idOcorrenciaTipo) {

			return dataservice.buscar(idOcorrenciaTipo).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}

		}

		function carregarCombo() {

			return dataservice.carregarCombo().then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}

		}

		function carregarComboCadastro() {

			return dataservice.carregarComboCadastro().then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}

		}

		function remover(idOcorrenciaTipo) {
			return dataservice.remover(idOcorrenciaTipo);
		}

		function inserir(ocorrenciaTipo) {
			return dataservice.inserir(ocorrenciaTipo);
		}

	}
	
})();