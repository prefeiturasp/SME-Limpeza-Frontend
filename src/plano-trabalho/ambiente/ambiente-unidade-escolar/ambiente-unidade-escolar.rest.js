(function () {

	'use strict';
	
	angular
	.module('ambiente.ambiente-unidade-escolar')
	.factory('AmbienteUnidadeEscolarRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		let service = new RestUtils(ConfigRest.ambienteUnidadeEscolar);

		service.buscarPorHash = buscarPorHash;
		service.carregarComboPorAmbienteGeral = carregarComboPorAmbienteGeral;
		service.gerarQRCode = gerarQRCode;
		service.gerarTodosQRCode = gerarTodosQRCode;

		service.urlImportacao = service.url + '/importar';
		
		return service;

		function buscarPorHash(hash) {
			return $http.post(service.url + '/hash/', { hash });
		}

		function carregarComboPorAmbienteGeral(idUnidadeEscolar, idAmbienteGeral) {
			return $http.get(service.url + '/combo/' + idUnidadeEscolar + '/ambiente-geral/' + idAmbienteGeral);
		}

		function gerarQRCode(idAmbienteUnidadeEscolar) {
			return $http.get(service.url + '/qrcode/' + idAmbienteUnidadeEscolar);
		}

		function gerarTodosQRCode() {
			return $http.get(service.url + '/todos-qrcode/');
		}

	}
	
})();