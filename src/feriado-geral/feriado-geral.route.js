(function () {

	'use strict';

	angular.module('app').config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider.when('/feriado-geral/', {
			templateUrl: 'src/feriado-geral/feriado-geral-lista.html',
			controller: 'FeriadoGeralLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();