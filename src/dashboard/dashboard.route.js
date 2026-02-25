(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider', '$locationProvider'];

	function routes($routeProvider, $locationProvider) {

        $routeProvider.when('/painel-inicial', {
            templateUrl: 'src/dashboard/dashboard.html',
            controller: 'Dashboard',
            controllerAs: 'vm',
            reloadOnSearch: false
        });
    }

})();