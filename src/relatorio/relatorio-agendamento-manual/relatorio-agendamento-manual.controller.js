(function () {
	
	'use strict';
	angular
	.module('relatorio.relatorio-agendamento-manual')
	.controller('RelatorioAgendamentoManualController', RelatorioAgendamentoManualController);

	RelatorioAgendamentoManualController.$inject = ['$rootScope','controller', 'MonitoramentoRest', 'tabela','ContratoUtils', 'UnidadeEscolarUtils', 'MonitoramentoUtils'];

	function RelatorioAgendamentoManualController($rootScope, controller, dataservice, tabela, ContratoUtils, UnidadeEscolarUtils, MonitoramentoUtils) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.instancia = {};
		vm.tabela = {};
		vm.filtros = {};
		vm.isFilterOpen = true;
		vm.recarregarTabela = recarregarTabela;
		vm.evtChangeFilter = evtChangeFilter;
		vm.exportar = exportar;

		iniciar();

		function iniciar() {
			carregarComboUnidadeEscolar();
			if ($rootScope.usuario.usuarioOrigem.codigo === 'sme') {
				carregarComboContrato();
			}
			montarTabela();
		}

		function montarTabela() {

			criarOpcoesTabela();

			function criarColunasTabela() {

				var colunas = [
					{data: 'contrato', title: 'DRE/Contrato', renderWith: tabela.formatarContrato},
					{data: 'unidadeEscolar.descricao', title: 'Unidade Escolar'},
					{data: 'data', title: 'Data do Agendamento', renderWith: tabela.formatarData}
				];

				vm.tabela.colunas = tabela.adicionarColunas(colunas);

			}

			function criarOpcoesTabela() {

				vm.tabela.opcoes = tabela.criarTabela(ajax, vm, null, 'data');
				vm.tabela.opcoes.withOption('rowCallback', rowCallback);
				criarColunasTabela();

				function ajax(data, callback, settings) {

					const filtrosParaApi = angular.copy(vm.filtros);

					if (filtrosParaApi.contrato && filtrosParaApi.contrato.length > 0) {
						filtrosParaApi.contrato = filtrosParaApi.contrato.map(c => ({ id: c.id }));
					}
					if (filtrosParaApi.unidadeEscolar && filtrosParaApi.unidadeEscolar.length > 0) {
						filtrosParaApi.unidadeEscolar = filtrosParaApi.unidadeEscolar.map(ue => ({ id: ue.id }));
					}

					dataservice.tabelaDatasAgendamentoManual(tabela.criarParametros(data, filtrosParaApi)).then(success).catch(error);

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
			tabela.recarregarDados(vm.instancia, true);
		}

		function carregarComboUnidadeEscolar() {

			UnidadeEscolarUtils.carregarComboTodos().then(success).catch(error);

			function success(response) {
				vm.unidadeEscolarList = response.objeto;
			}

			function error(response) {
				vm.unidadeEscolarList = [];
				controller.feed('error', 'Houve um erro ao carregar as unidades escolares.');
			}

		}

		function carregarComboContrato() {
			ContratoUtils.carregarCombo().then(success).catch(error);

			function success(response) {
				vm.contratoLista = response.objeto;
			}

			function error(response) {
				vm.contratoLista = [];
				controller.feed('error', 'Erro ao buscar combo de contratos.');
			}
		}

		function buscaComboUePorIdContratoFiltrado(idsContrato){
			MonitoramentoUtils.comboUePorIdContratoList(idsContrato).then(function (response) {
				vm.unidadeEscolarList = response.data || [];
			}).catch(function () {
				controller.feed('error', 'Erro ao carregar unidades escolares para o contrato selecionado.');
			});
		}

		function evtChangeFilter() {
			const contratos = vm.filtros.contrato || [];
		
			if (contratos.length > 0) {
				let idsContrato = contratos.map(c => c.id);
				buscaComboUePorIdContratoFiltrado(idsContrato);
			} else {
				carregarComboUnidadeEscolar();
			}

		}

		    function exportar() {

				dataservice.exportar(vm.filtros).then(success).catch(error);

				function success(response) {
					const data = response.data;
					const a = document.createElement("a");
					document.body.appendChild(a);
					a.style = "display: none";
					const file = new Blob([data], { type: 'application/csv', endings: 'native' });
					const fileUrl = window.URL.createObjectURL(file);
					a.href = fileUrl;
					// O nome do arquivo será definido pelo cabeçalho Content-Disposition do back-end
					a.download = `relatorio-agendamento-manual-${moment().format('DDMMyyyyHHmmss')}.csv`;
					a.click();
				}

				function error(response) {
					controller.feed('error', 'Houve um erro ao exportar o relatório.');
				}

			}

	}
	
})();