(function () {
	
	'use strict';
	angular
	.module('relatorio.relatorio-agendamento-manual')
	.controller('RelatorioAgendamentoManualController', RelatorioAgendamentoManualController);

	RelatorioAgendamentoManualController.$inject = ['$rootScope','controller', 'MonitoramentoRest', 'tabela','ContratoUtils', 'UnidadeEscolarUtils', 'MonitoramentoUtils'];

	function RelatorioAgendamentoManualController($rootScope, controller, dataservice, tabela, ContratoUtils, UnidadeEscolarUtils, MonitoramentoUtils) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.filtros = {};
		vm.instancia = {};
		vm.tabela = {};
		vm.isFilterOpen = true;
		vm.recarregarTabela = recarregarTabelaAgendamentoManual;
		vm.evtChangeFilter = evtChangeFilterAgendamentoManual;
		vm.exportar = exportarRelatorioAgendamentoManual;

		iniciar();

		function iniciar() {
			carregarComboUnidadeEscolarAgendamentoManual();
			if ($rootScope.usuario.usuarioOrigem.codigo === 'sme') {
				carregarComboContratoAgendamentoManual();
			}
			montarTabelaAgendamentoManual();
		}

		function montarTabelaAgendamentoManual() {

			criarOpcoesTabelaAgendamentoManual();

			function criarColunasTabelaAgendamentoManual() {
				var colunas = [
					{data: 'contrato', title: 'DRE/Contrato', renderWith: tabela.formatarContrato},
					{data: 'unidadeEscolar.descricao', title: 'Unidade Escolar'},
					{data: 'data', title: 'Data do Agendamento', renderWith: tabela.formatarData}
				];
				vm.tabela.colunas = tabela.adicionarColunas(colunas);
			}

			function criarOpcoesTabelaAgendamentoManual() {
				vm.tabela.opcoes = tabela.criarTabela(ajaxFn, vm, null, 'data');
				vm.tabela.opcoes.withOption('rowCallback', rowCallbackFn);
				criarColunasTabelaAgendamentoManual();

				function ajaxFn(data, callback, settings) {

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

				function rowCallbackFn(nRow, aData, iDisplayIndex, iDisplayIndexFull) {

				}

			}
		}

		function recarregarTabelaAgendamentoManual() {
			tabela.recarregarDados(vm.instancia, true);
		}

		function carregarComboUnidadeEscolarAgendamentoManual() {

			return UnidadeEscolarUtils.carregarComboTodos().then(success).catch(error);

			function success(response) {
				vm.unidadeEscolarList = response.objeto;
			}

			function error(response) {
				vm.unidadeEscolarList = [];
				controller.feed('error', 'Houve um erro ao carregar as unidades escolares.');
			}

		}

		function carregarComboContratoAgendamentoManual() {
			ContratoUtils.carregarCombo().then(success).catch(error);

			function success(response) {
				vm.contratoLista = response.objeto;
			}

			function error(response) {
				vm.contratoLista = [];
				controller.feed('error', 'Erro ao buscar combo de contratos.');
			}
		}

		function buscaComboUePorIdContratoFiltradoAgendamentoManual(idsContrato){
			MonitoramentoUtils.comboUePorIdContratoList(idsContrato).then(function (response) {
				vm.unidadeEscolarList = response.data || [];
			}).catch(function () {
				controller.feed('error', 'Erro ao carregar unidades escolares para o contrato selecionado.');
			});
		}

		function evtChangeFilterAgendamentoManual() {
			const contratos = vm.filtros.contrato || [];
			if (contratos.length > 0) {
				let idsContrato = contratos.map(c => c.id);
				buscaComboUePorIdContratoFiltradoAgendamentoManual(idsContrato);
			} else {
				carregarComboUnidadeEscolarAgendamentoManual();
			}
		}

		    function exportarRelatorioAgendamentoManual() {

				dataservice.exportar(vm.filtros).then(success).catch(error);
				function success(response) {
					const dados = response.data;
					const eleA = document.createElement("a");
					document.body.appendChild(eleA);
					eleA.style = "display: none";
					const file = new Blob([dados], { type: 'application/csv', endings: 'native' });
					const fileUrl = window.URL.createObjectURL(file);
					eleA.href = fileUrl;
					// O nome do arquivo será definido pelo cabeçalho Content-Disposition do back-end
					eleA.download = `relatorio-agendamento-manual-${moment().format('DDMMyyyyHHmmss')}.csv`;
					eleA.click();
				}
				function error(response) {
					controller.feed('error', 'Houve um erro ao exportar o relatório.');
				}
			}

	}
	
})();