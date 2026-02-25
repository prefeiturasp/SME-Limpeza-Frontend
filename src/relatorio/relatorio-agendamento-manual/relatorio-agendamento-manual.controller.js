(function () {
	
	'use strict';
	
	angular
	.module('relatorio.relatorio-agendamento-manual')
	.controller('RelatorioAgendamentoManualController', RelatorioAgendamentoManualController);
	
	RelatorioAgendamentoManualController.$inject = ['controller', 'MonitoramentoRest', 'tabela'];
	
	function RelatorioAgendamentoManualController(controller, dataservice, tabela) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.instancia = {};
		vm.tabela = {};

		vm.recarregarTabela = recarregarTabela;

		iniciar();
		
		function iniciar() {
			montarTabela();
		}

		function montarTabela() {

			criarOpcoesTabela();

			function criarColunasTabela() {

				var colunas = [
					{data: 'data', title: 'Data do Agendamento', renderWith: tabela.formatarData},
					{data: '', title: '', renderWith: () => 'Possui Agendamento Manual'}
				];

				vm.tabela.colunas = tabela.adicionarColunas(colunas);

			}

			function criarOpcoesTabela() {

				vm.tabela.opcoes = tabela.criarTabela(ajax, vm, null, 'data');
				vm.tabela.opcoes.withOption('rowCallback', rowCallback);
				criarColunasTabela();

				function ajax(data, callback, settings) {

					dataservice.tabelaDatasAgendamentoManual(tabela.criarParametros(data, vm.filtros)).then(success).catch(error);

					function success(response) {
						callback(controller.lerRetornoDatatable(response));
					}

					function error(response) {
						callback(tabela.vazia());
					}

				}

				function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {

				}

			}
		}

		function recarregarTabela() {
			tabela.recarregarDados(vm.instancia);
		}

	}
	
})();