(() => {

	'use strict';

	angular
	.module('app')
	.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/relatorio/gerencial/', {
			templateUrl: 'src/relatorio/relatorio-gerencial/relatorio-gerencial-lista.html',
			controller: 'RelatorioGerencialController',
			controllerAs: 'vm',
			reloadOnSearch: false
		})
		.when('/relatorio/gerencial/detalhe/:id', {
			templateUrl: 'src/relatorio/relatorio-gerencial/relatorio-gerencial-detalhe/relatorio-gerencial-detalhe.html',
			controller: 'RelatorioGerencialDetalheController',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();