(function () {
	
	'use strict';
	
	angular
	.module('app')
	.config(routes)
	.config(loading)
	.filter('zpad', zpad)
	.constant('toastr', toastr)
	.value('angularMomentConfig', {
    timezone: 'America/Sao_Paulo'
	})
	.run(appRun);
	
	appRun.$inject = ['$rootScope', '$location', 'AuthToken', 'uibDatepickerPopupConfig', '$templateCache'];
	loading.$inject = ['cfpLoadingBarProvider'];
	routes.$inject = ['$routeProvider', '$locationProvider'];
	
	function appRun($rootScope, $location, AuthToken, uibDatepickerPopupConfig, $templateCache) {

		init();
		
		function init() {
			$rootScope.CSS_VERSION = new Date();
			setRouteEvents();
		}
		
		function routeChangeError(event, current, previous, rejection) {
			
		}
		
		function routeChangeStart(event, next, current) {

			if (typeof(current) !== 'undefined'){
				$templateCache.remove(current.templateUrl);
			}

			if(!next.notSecured) {

				if (!AuthToken.ler()) {
					logout();
				} else {

					if (!$rootScope.usuario) {
						if (!AuthToken.getToken('usuario')) {
							logout();
							return;
						}					
					}

					$rootScope.usuario = AuthToken.getToken('usuario');
					$rootScope.logado = true;
										
					uibDatepickerPopupConfig.ngModelOptions = { timezone: '-03:00' };
					uibDatepickerPopupConfig.datepickerPopup = "dd/MM/yyyy";
					uibDatepickerPopupConfig.currentText = 'Hoje';
					uibDatepickerPopupConfig.clearText = 'Limpar';
					uibDatepickerPopupConfig.closeText = 'Fechar';

				}
				
			}

		}
		
		function logout() {
			$rootScope.logado = false;
			$rootScope.$evalAsync(() => {
				$location.path('/login');
			});
		}
		
		function routeChangeSuccess(event, current) {
		}
		
		function setRouteEvents() {
			$rootScope.$on('$routeChangeError', routeChangeError);
			$rootScope.$on('$routeChangeStart', routeChangeStart);
			$rootScope.$on('$routeChangeSuccess', routeChangeSuccess);
		}

	}
	
	function loading(cfpLoadingBarProvider) {
		cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
		cfpLoadingBarProvider.spinnerTemplate = `<div id="loader-wrapper"><div class="item"><h3>Carregando...</h3><div class="square-path-loader"></div></div></div>`;
	}

	function zpad() {

		return function(input, n) {

			if(input === undefined) input = '';
			if(input.length >= n) return input;
			let zeros = '0'.repeat(n);
			return (zeros + input).slice(-1 * n)
			
		};

	}
	
	function routes($routeProvider, $locationProvider) {
		$routeProvider.otherwise({redirectTo: '/dashboard'});
		$locationProvider.html5Mode(true);		
	}
	
})();