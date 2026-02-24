(function () {

	'use strict';

	angular
	.module('app')
	.config(routes);

	routes.$inject = ['$routeProvider', '$locationProvider'];

	function routes($routeProvider, $locationProvider) {
		
		$routeProvider
		.when('/recuperacao-senha', {
			templateUrl: 'src/core/auth/recuperacao-senha/recuperacao-senha.html',
			controller: 'RecuperacaoSenhaCtlr',
			controllerAs: 'vm',
			notSecured: true,
			reloadOnSearch: false
		})
		.when('/recuperacao-senha/:token', {
			templateUrl: 'src/core/auth/recuperacao-senha/recuperacao-senha.html',
			controller: 'RecuperacaoSenhaCtlr',
			controllerAs: 'vm',
			notSecured: true,
			reloadOnSearch: false
		});
	}

})();