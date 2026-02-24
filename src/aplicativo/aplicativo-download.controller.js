(function () {
	
	'use strict';
	
	angular
	.module('app.aplicativo')
	.controller('AplicativoDownloadController', AplicativoDownloadController);
	
	AplicativoDownloadController.$inject = ['$rootScope', 'controller', 'AplicativoRest'];
	
	function AplicativoDownloadController($rootScope, controller, dataservice) {
		/* jshint validthis: true */

		var vm = this;

		iniciar();
		
		function iniciar() {
			download();
		}

		async function download() {

			dataservice.download().then(success).catch(error);

			function success(response) {

				var response = controller.ler(response, 'data');
				var a = document.createElement("a");
				document.body.appendChild(a);
				a.style = "display: none";
				let file = new Blob([new Uint8Array(response.data)], { type: 'application/vnd.android.package-archive' });
				var fileUrl = window.URL.createObjectURL(file);
				a.href = fileUrl;
				a.download = 'aplicativo-sme.apk';
				a.click();
			
			}

			function error(response) {
				controller.feed('error', 'Não foi possível fazer o download do aplicativo.');	
			}

		}

	}
	
})();