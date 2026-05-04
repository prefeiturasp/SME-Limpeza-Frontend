(function () {
	
	'use strict';
	
	angular
	.module('app.monitoramento')
	.factory('MonitoramentoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		let service = new RestUtils(ConfigRest.monitoramento);
		service.tabelaDatasAgendamentoManual = tabelaDatasAgendamentoManual;
		service.comboUePorIdContrato = comboUePorIdContrato;
		service.comboPrestadorServicoPorIdContrato = comboPrestadorServicoPorIdContrato;
		service.comboContratoPorIdPrestadorServico = comboContratoPorIdPrestadorServico;
		service.comboUePorIdPrestadorServico = comboUePorIdPrestadorServico;
		service.comboContratoPorIdUe = comboContratoPorIdUe;
		service.comboPrestadorServicoPorIdUe = comboPrestadorServicoPorIdUe;
		service.verificaSeDataEferiado = verificaSeDataEferiado;

		return service;

		function tabelaDatasAgendamentoManual(data) {
			return $http.get(service.url + '/tabela-datas-agendamento-manual?' + data);
		}

		function comboUePorIdContrato(idContrato){
			return $http.post(service.url + '/comboUePorIdContrato', {idContrato: idContrato});
		}	

		function comboPrestadorServicoPorIdContrato(idContrato){
			return $http.post(service.url + '/comboPrestadorServicoPorIdContrato', {idContrato: idContrato});
		}

		function comboContratoPorIdPrestadorServico(idPrestadorServico){
			return $http.post(service.url + '/comboContratoPorIdPrestadorServico', {idPrestadorServico: idPrestadorServico});
		}

		function comboUePorIdPrestadorServico(idPrestadorServico){
			return $http.post(service.url + '/comboUePorIdPrestadorServico', {idPrestadorServico: idPrestadorServico});
		}

		function comboContratoPorIdUe(idUe) {
			return $http.post(service.url + '/comboContratoPorIdUe', {idUe: idUe});
		}

		function comboPrestadorServicoPorIdUe(idUe) {
			return $http.post(service.url + '/comboPrestadorServicoPorIdUe', {idUe: idUe});
		}

		function verificaSeDataEferiado(idUnidadeEscolar, data) {
			return $http.post(service.url + '/verificaSeDataEferiado', { idUnidadeEscolar: idUnidadeEscolar, data: data });
		}

	}
	
})();