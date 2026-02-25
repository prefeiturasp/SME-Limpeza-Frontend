(function () {
	'use strict';
	
	angular
	.module('plano-trabalho.plano-trabalho-matriz')
	.factory('PlanoTrabalhoMatrizRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.planoTrabalhoMatriz);

		service.comboUnidadeEscolar = comboUnidadeEscolar;
		service.buscarPorAmbienteGeralPeriodicidadeTurno = buscarPorAmbienteGeralPeriodicidadeTurno;

		return service;

		function comboUnidadeEscolar() {
			return $http.get(service.url + '/combo-unidade-escolar');
		}

		function buscarPorAmbienteGeralPeriodicidadeTurno(idAmbienteGeral, idPeriodicidade, idTurno) {
			return $http.get(service.url + `/ambiente-geral/${idAmbienteGeral}/periodicidade/${idPeriodicidade}/turno/${idTurno}`);
		}

	}
	
})();