(() => {

	'use strict';

	angular
		.module('relatorio-contrato.relatorio-contrato-pontos-detalhe')
		.controller('RelatorioContratoPontosDetalheController', RelatorioContratoPontosDetalheController);

	RelatorioContratoPontosDetalheController.$inject = ['$rootScope', 'controller', '$routeParams', 'RelatorioContratoPontosRest', '$location'];

	function RelatorioContratoPontosDetalheController($rootScope, controller, $routeParams, dataservice, $location) {
		/* jshint validthis: true */

		var vm = this;

		vm.exportar = exportar;
		vm.formatarPercentual = formatarPercentual;
		vm.formatarDecimal = formatarDecimal;
		vm.recarregarDados = recarregarDados;
		vm.filtros = vm.filtros || {};

		iniciar();

		function iniciar() {

			vm.idContrato = $routeParams.idContrato;
			vm.anosReferencia = [];
			carregaComboAnos().then(anos => { vm.anosReferencia = anos; });

			if (!vm.idContrato) {
				redirecionarListagem();
			}

			buscar();

		}

		function buscar() {
			const filtros = { ...vm.filtros };

			dataservice.buscar(vm.idContrato, filtros).then(success).catch(error);

			function success(response) {
				vm.dados = controller.ler(response, 'data');
			}

			function error(response) {
				controller.feedMessage(response);
				redirecionarListagem();
			}
		}

		function exportar() {

			dataservice.exportar(vm.idContrato).then(success).catch(error);

			function success(response) {
				const data = controller.ler(response, 'data');
				const a = document.createElement("a");
				document.body.appendChild(a);
				a.style = "display: none";
				const file = new Blob([data], { type: 'application/csv' });
				const fileUrl = window.URL.createObjectURL(file);
				a.href = fileUrl;
				a.download = `relatorio-pontos-${vm.idContrato}.csv`;
				a.click();
			}

			function error(response) {
				controller.feed('error', 'Houve um erro ao exportar o relatório.');
			}

		}

		function redirecionarListagem() {
			$rootScope.$evalAsync(() => $location.path('relatorio/contrato-pontos'));
		}

		function formatarPercentual(value) {

			if (value === null || value === undefined) {
				return ' - ';
			}

			return formatarDecimal(value) + '%';

		}

		function formatarDecimal(value) {

			if (value === null || value === undefined) {
				return ' - ';
			}

			return parseFloat(value).toFixed(2);

		}

		function recarregarDados() {
			buscar();
		}

		function carregaComboAnos() {
			return dataservice.carregaComboAnos(vm.idContrato)
				.then(response => {
					return (response && response.data && response.data.data) ? response.data.data : [];
				})
				.catch(() => []);
		}
	}

})();