(function () {
	'use strict';

	angular
	.module('app.unidade-escolar')
	.factory('UnidadeEscolarUtils', UnidadeEscolarUtils);

	UnidadeEscolarUtils.$inject = ['controller', 'UnidadeEscolarRest'];

	function UnidadeEscolarUtils(utils, dataservice) {

		var service = {
			buscar: buscar,
			carregarComboTipoEscola: carregarComboTipoEscola,
			carregarCombo: carregarCombo,
			carregarComboDRE: carregarComboDRE,
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

		function carregarCombo() {

			return dataservice.carregarCombo().then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}

		}

		function carregarComboDRE(idDiretoriaRegional) {

			return dataservice.carregarComboDRE(idDiretoriaRegional).then(success).catch(error);

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