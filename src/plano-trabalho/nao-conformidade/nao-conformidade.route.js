(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/plano-trabalho/nao-conformidade', {
			templateUrl: 'src/plano-trabalho/nao-conformidade/nao-conformidade-lista.html',
			controller: 'NaoConformidadeLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();