(function () {

	'use strict';

	angular
		.module('componentes.botao-upload-arquivo')
		.directive('botaoUploadArquivo', botaoUploadArquivo);

	function botaoUploadArquivo() {

		let directive = {
			restrict: 'E',
			templateUrl: 'src/componentes/botao-upload-arquivo/botao-upload-arquivo.html',
			link: link,
			scope: true
		};

		return directive;

		function link(scope, element, attr) {
			scope.uploader = scope.$eval(attr.uploader);
			scope.selecionar = () => $('#inputFileUploader').trigger('click');
		}
		
	}

})();