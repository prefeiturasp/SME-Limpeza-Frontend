(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/unidade-escolar/', {
			templateUrl: 'src/unidade-escolar/unidade-escolar-lista.html',
			controller: 'UnidadeEscolarLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		})
		.when('/unidade-escolar/importar', {
			templateUrl: 'src/unidade-escolar/unidade-escolar-importacao/unidade-escolar-importacao.html',
			controller: 'UnidadeEscolarImportacao',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();