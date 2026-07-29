(function () {
	'use strict';

	angular
	.module('app.monitoramento')
	.factory('MonitoramentoUtils', MonitoramentoUtils);

	MonitoramentoUtils.$inject = ['controller', 'MonitoramentoRest'];

	function MonitoramentoUtils(utils, dataservice) {

		var service = {
			buscar: buscar,
			comboUePorIdContrato: comboUePorIdContrato,
			comboUePorIdPrestadorServico: comboUePorIdPrestadorServico,
			comboUePorIdContratoList: comboUePorIdContratoList,
			comboContratoPorIdPrestadorServico: comboContratoPorIdPrestadorServico,
			comboContratoPorIdUe: comboContratoPorIdUe,
			comboPrestadorServicoPorIdUe: comboPrestadorServicoPorIdUe,
			comboContratoPorIdUeList: comboContratoPorIdUeList,
			comboPrestadorServicoPorIdContrato: comboPrestadorServicoPorIdContrato
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

		function comboUePorIdContrato(idContrato){
			return dataservice.comboUePorIdContrato(idContrato).then(function (response) {
				return response.data;
			});
		}

		function comboUePorIdContratoList(idContratoList){
			return dataservice.comboUePorIdContratoList(idContratoList).then(function (response) {
				return response.data;
			});
		}

		function comboPrestadorServicoPorIdContrato(idContrato){
			return dataservice.comboPrestadorServicoPorIdContrato(idContrato).then(function (response) {
				return response.data;
			});
		}

		function comboContratoPorIdPrestadorServico(idPrestadorServico){
			return dataservice.comboContratoPorIdPrestadorServico(idPrestadorServico).then(function (response) {
				return response.data;
			});
		}

		function comboUePorIdPrestadorServico(idPrestadorServico){
			return dataservice.comboUePorIdPrestadorServico(idPrestadorServico).then(function (response) {
				return response.data;
			});
		}

		function comboContratoPorIdUeList(idUeList) {
			return dataservice.comboContratoPorIdUeList(idUeList).then(function (response) {
				return response.data;
			});
		}

		function comboContratoPorIdUe(idUe) {
			return dataservice.comboContratoPorIdUe(idUe).then(function (response) {
				return response.data;
			});
		}

		function comboPrestadorServicoPorIdUe(idUe) {
			return dataservice.comboPrestadorServicoPorIdUe(idUe).then(function (response) {
				return response.data;
			});
		}

	}
	
})();