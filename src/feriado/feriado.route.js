(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/feriado/', {
			templateUrl: 'src/feriado/feriado-lista.html',
			controller: 'FeriadoLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();