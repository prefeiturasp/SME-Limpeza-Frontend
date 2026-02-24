(function () {
	
	'use strict';
	
	angular
	.module('app.aplicativo')
	.factory('AplicativoRest', dataservice);
	
	dataservice.$inject = ['$http', 'RestUtils','ConfigRest'];
	
	function dataservice($http, RestUtils, ConfigRest) {
		
		var service = new RestUtils(ConfigRest.aplicativo);

		service.download = download;

		return service;

		function download() {
			return $http.get(service.url + '/download');
		}

	}
	
})();