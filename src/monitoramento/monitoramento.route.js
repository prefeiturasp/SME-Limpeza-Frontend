(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/monitoramento/', {
			templateUrl: 'src/monitoramento/monitoramento-lista.html',
			controller: 'MonitoramentoController',
			controllerAs: 'vm',
			reloadOnSearch: false
		}).when('/monitoramento/detalhe/:id', {
			templateUrl: 'src/monitoramento/monitoramento-detalhe/monitoramento-detalhe.html',
			controller: 'MonitoramentoDetalheController',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();