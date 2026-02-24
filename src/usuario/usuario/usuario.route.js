(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/usuario/', {
			templateUrl: 'src/usuario/usuario/usuario-lista.html',
			controller: 'UsuarioController',
			controllerAs: 'vm',
			reloadOnSearch: false
		})
		.when('/usuario/importar', {
			templateUrl: 'src/usuario/usuario/usuario-importacao/usuario-importacao.html',
			controller: 'UsuarioImportacao',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();