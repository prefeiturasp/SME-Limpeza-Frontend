(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/plano-trabalho/ambiente/ambiente-unidade-escolar', {
			templateUrl: 'src/plano-trabalho/ambiente/ambiente-unidade-escolar/ambiente-unidade-escolar-lista.html',
			controller: 'AmbienteUnidadeEscolarController',
			controllerAs: 'vm',
			reloadOnSearch: false
		})
		.when('/plano-trabalho/ambiente/ambiente-unidade-escolar/importar', {
			templateUrl: 'src/plano-trabalho/ambiente/ambiente-unidade-escolar/ambiente-unidade-escolar-importacao/ambiente-unidade-escolar-importacao.html',
			controller: 'AmbienteUnidadeEscolarImportacao',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();