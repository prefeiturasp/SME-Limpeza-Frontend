(function () {
	'use strict';

	angular
	.module('componentes.endereco')
	.factory('EnderecoUtils', EnderecoUtils);

	EnderecoUtils.$inject = ['controller', 'EnderecoRest'];

	function EnderecoUtils(utils, dataservice) {

		var service = {
			buscarEnderecoPorCep: buscarEnderecoPorCep,
			buscarCoordenadasPorEndereco: buscarCoordenadasPorEndereco,
			buscarCoordenadasPorCep: buscarCoordenadasPorCep,
		};

		return service;

		function buscarEnderecoPorCep(cep) {

			return dataservice.buscarEnderecoPorCep(cep).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, null);
			}

		}

		function buscarCoordenadasPorEndereco(endereco) {

			return dataservice.buscarCoordenadas(endereco).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, null);
			}

		}
		
		function buscarCoordenadasPorCep(cep) {

			return dataservice.buscarCoordenadas(cep).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, null);
			}

		}

	}
	
})();