(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/aplicativo/', {
			templateUrl: 'src/aplicativo/aplicativo.html',
			controller: 'AplicativoController',
			controllerAs: 'vm',
			reloadOnSearch: false,
			notSecured: false,
		})
		.when('/aplicativo/download', {
			templateUrl: 'src/aplicativo/aplicativo-download.html',
			controller: 'AplicativoDownloadController',
			controllerAs: 'vm',
			reloadOnSearch: false,
			notSecured: true,
		});

	}

})();