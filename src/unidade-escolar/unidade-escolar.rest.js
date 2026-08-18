(function () {
	'use strict';
	
	angular
	.module('app.unidade-escolar')
	.factory('UnidadeEscolarRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.unidadeEscolar);
		
		service.urlImportacao = service.url + '/importar';
		service.carregarComboDRE = carregarComboDRE;
		service.carregarComboTipoEscola = carregarComboTipoEscola;
		service.buscaUsuariosUe = buscaUsuariosUe;
		service.buscaStatusUePorId = buscaStatusUePorId;

		return service;

		function carregarComboDRE(idDiretoriaRegional) {
			return $http.get(service.url + '/combo-dre/' + idDiretoriaRegional);
		}

		function carregarComboTipoEscola() {
			return $http.get(service.url + '/combo-tipo-escola');
		}

		function buscaUsuariosUe(idUnidadeEscolar){
			return $http.post(service.url + '/busca-usuarios-ue', {idUnidadeEscolar: idUnidadeEscolar});
		}

		function buscaStatusUePorId(idUe, idStatusUe) {
			return $http.post(service.url + '/status-ue/',	{idUe: idUe, idStatusUe: idStatusUe});
		}

	}
	
})();