(function () {
	'use strict';

	angular
	.module('app.prestador-servico')
	.factory('PrestadorServicoUtils', PrestadorServicoUtils);

	PrestadorServicoUtils.$inject = ['controller', 'PrestadorServicoRest'];

	function PrestadorServicoUtils(utils, dataservice) {

		var service = {
			carregarCombo: carregarCombo,
			carregarComboTodos: carregarComboTodos,
			buscarDadosAcesso: buscarDadosAcesso,
			alterarSenhaAplicativo: alterarSenhaAplicativo
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

		function carregarComboTodos() {

			return dataservice.carregarComboTodos().then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}

		}

		function buscarDadosAcesso() {

			return dataservice.buscarDadosAcesso().then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, {});
			}

		}

		function alterarSenhaAplicativo(senha) {

			return dataservice.alterarSenhaAplicativo(senha).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true);
			}

			function error(response) {
				return utils.criarRetornoPromise(false);
			}

		}

	}
	
})();