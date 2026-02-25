(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/contrato/', {
			templateUrl: 'src/contrato/contrato-lista.html',
			controller: 'ContratoLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();