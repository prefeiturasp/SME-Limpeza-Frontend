(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/plano-trabalho/matriz', {
			templateUrl: 'src/plano-trabalho/plano-trabalho-matriz/plano-trabalho-matriz-lista.html',
			controller: 'PlanoTrabalhoMatrizLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();