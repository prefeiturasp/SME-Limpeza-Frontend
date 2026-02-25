(function () {
	
	'use strict';
	
	angular
	.module('app.aplicativo')
	.controller('AplicativoController', AplicativoController);
	
	AplicativoController.$inject = ['$rootScope', 'controller', 'PrestadorServicoUtils', 'AplicativoRest'];
	
	function AplicativoController($rootScope, controller, PrestadorServicoUtils, dataservice) {
		/* jshint validthis: true */

		var vm = this;

		vm.alterarSenha = alterarSenha;
		vm.download = download;

		iniciar();
		
		function iniciar() {

			vm.isPrestadorServico = $rootScope.logado && $rootScope.usuario.usuarioOrigem.codigo == 'ps';
			vm.urlAplicativo = window.location.href + 'download';
			QRCode.toCanvas(document.getElementById('canvas'), vm.urlAplicativo, {
				width: 300,
				heigth: 300,
				errorCorrectionLevel: 'Q',
				color: {
					dark: "#00B297",
					light: "#FFF"
				  }
			});

			if(vm.isPrestadorServico) {
				buscarDadosAcesso();
			}

		}

		function buscarDadosAcesso() {

			PrestadorServicoUtils.buscarDadosAcesso().then(success).catch(error);

			function success(response) {
				vm.dados = response.objeto;
				vm.senhaOriginal = vm.dados.senhaAplicativo;
			}

			function error(response) {
				delete vm.dados;
				delete vm.senhaOriginal;
				controller.feed('error', 'Erro ao consultar os dados de acesso.');
			}

		}

		function alterarSenha() {

			if(!vm.dados.senhaAplicativo || !vm.senhaOriginal) {
				return;
			}

			if(vm.dados.senhaAplicativo == vm.senhaOriginal) {
				return;
			}

			PrestadorServicoUtils.alterarSenhaAplicativo(vm.dados.senhaAplicativo).then(success).catch(error);

			function success(response) {
				controller.feed('success', 'Senha do aplicativo alterada com sucesso.');
				buscarDadosAcesso();
			}

			function error(response) {
				controller.feed('error', 'Erro ao alterar a senha do aplicativo.');
			}

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