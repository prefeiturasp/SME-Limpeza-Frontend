(() => {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
			.when('/relatorio/contrato-pontos/', {
				templateUrl: 'src/relatorio/relatorio-contrato-pontos/relatorio-contrato-pontos-lista.html',
				controller: 'RelatorioContratoPontosController',
				controllerAs: 'vm',
				reloadOnSearch: false
			})
			.when('/relatorio/contrato-pontos/:idContrato', {
				templateUrl: 'src/relatorio/relatorio-contrato-pontos/relatorio-contrato-pontos-detalhe/relatorio-contrato-pontos-detalhe.html',
				controller: 'RelatorioContratoPontosDetalheController',
				controllerAs: 'vm',
				reloadOnSearch: false
			});

	}

})();