(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/configuracao/', {
			templateUrl: 'src/configuracao/configuracao.html',
			controller: 'Configuracao',
			controllerAs: 'vm',
			reloadOnSearch: false
		})
		.when('/configuracao/variavel-gerencial/:id', {
			templateUrl: 'src/configuracao/configuracao-variavel-gerencial/configuracao-variavel-gerencial.html',
			controller: 'ConfiguracaoVariavelGerencial',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();