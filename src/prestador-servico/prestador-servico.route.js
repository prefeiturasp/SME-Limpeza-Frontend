(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/prestador-servico/', {
			templateUrl: 'src/prestador-servico/prestador-servico-lista.html',
			controller: 'PrestadorServicoLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();