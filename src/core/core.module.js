(function () {
	
	'use strict';

	angular.module('app.core', [
		'core.auth',
		'ngRoute', 
		'ngSanitize', 
		'ngAnimate',
		'ngTouch',
		'ngStorage',
		'ngLocale',
		'mwl.confirm',
		'datatables', 
		'datatables.bootstrap',
		'datatables.buttons',
		'bootstrapLightbox',
		'ui.select',
		'ui.bootstrap',
		'core.constantes',
		'angular-jwt',
		'core.session',
		'core.utils',
		'angular-loading-bar',
		'angular-svg-round-progressbar',
		'angularMoment',
		'ui.utils.masks',
		'ui.toggle',
		'ui.sortable',
		'ui.bootstrap.datetimepicker',
		'oitozero.ngSweetAlert',
		'summernote',
		'angularFileUpload',
		'naif.base64',
		'idf.br-filters',
		'angular-inview',
		'qrScanner',
		'nemLogging',
		'ui-leaflet'
	]);

})();