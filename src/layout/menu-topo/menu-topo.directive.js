(function () {
	
	'use strict';
	
	angular
	.module('layout.menu-topo')
	.directive('menuTopo', componenteMenuTopo);
	
	function componenteMenuTopo() {
		var directive = {
			restrict: 'E',
			templateUrl: 'src/layout/menu-topo/menu-topo.html',						
		};
		
		return directive;		
	}	
	
})();