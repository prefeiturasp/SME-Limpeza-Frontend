(function () {

	'use strict';

	angular
		.module('app.layout')
		.directive('lista', lista);

	function lista() {
		var directive = {
			restrict: 'E',
			templateUrl: 'src/layout/lista.html'
		};

		return directive;
	}

})();