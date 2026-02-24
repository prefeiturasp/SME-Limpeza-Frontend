(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/plano-trabalho/ambiente/ambiente-geral', {
			templateUrl: 'src/plano-trabalho/ambiente/ambiente-geral/ambiente-geral-lista.html',
			controller: 'AmbienteGeralLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();