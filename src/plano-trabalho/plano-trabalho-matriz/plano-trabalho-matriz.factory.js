(function () {
	'use strict';

	angular
	.module('plano-trabalho.plano-trabalho-matriz')
	.factory('PlanoTrabalhoMatrizUtils', PlanoTrabalhoMatrizUtils);

	PlanoTrabalhoMatrizUtils.$inject = ['controller', 'PlanoTrabalhoMatrizRest'];

	function PlanoTrabalhoMatrizUtils(utils, dataservice) {

		var service = {
			comboUnidadeEscolar: comboUnidadeEscolar,
			buscarPorAmbienteGeralPeriodicidadeTurno: buscarPorAmbienteGeralPeriodicidadeTurno,
		};

		return service;

		function comboUnidadeEscolar() {

			return dataservice.comboUnidadeEscolar().then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}

		}

		function buscarPorAmbienteGeralPeriodicidadeTurno(idAmbienteGeral, idPeriodicidade, idTurno) {

			return dataservice.buscarPorAmbienteGeralPeriodicidadeTurno(idAmbienteGeral, idPeriodicidade, idTurno).then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, {});
			}

		}

	}
	
})();