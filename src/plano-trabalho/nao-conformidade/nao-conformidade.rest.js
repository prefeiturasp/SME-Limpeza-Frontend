(function () {
	'use strict';
	
	angular
	.module('plano-trabalho.nao-conformidade')
	.factory('NaoConformidadeRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.naoConformidade);
		
		service.carregarComboTipoEscola = carregarComboTipoEscola;

		return service;

		function carregarComboTipoEscola() {
			return $http.get(service.url + '/combo-tipo-escola');
		}

	}
	
})();