(function () {
	'use strict';

	angular
	.module('plano-trabalho.nao-conformidade')
	.factory('NaoConformidadeUtils', NaoConformidadeUtils);

	NaoConformidadeUtils.$inject = ['controller', 'NaoConformidadeRest'];

	function NaoConformidadeUtils(utils, dataservice) {

		var service = {
			buscar: buscar,
			carregarComboTipoEscola: carregarComboTipoEscola,
			carregarComboTodos: carregarComboTodos,
			carregarComboDetalhadoTodos: carregarComboDetalhadoTodos,
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

		function carregarComboTipoEscola() {

			return dataservice.carregarComboTipoEscola().then(success).catch(error);

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

		function carregarComboDetalhadoTodos() {

			return dataservice.carregarComboDetalhadoTodos().then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}

		}

	}
	
})();