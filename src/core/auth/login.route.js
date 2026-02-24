(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider', '$locationProvider'];

	function routes($routeProvider, $locationProvider) {
		
		$routeProvider
		.when('/login', {
			templateUrl: 'src/core/auth/login.html',
			controller: 'Login',
			controllerAs: 'vm',
			notSecured: true,
			reloadOnSearch: false
		});
	}

})();