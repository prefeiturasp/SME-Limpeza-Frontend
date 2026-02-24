(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/declaracao/', {
			templateUrl: 'src/declaracao/declaracao-lista.html',
			controller: 'DeclaracaoLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();