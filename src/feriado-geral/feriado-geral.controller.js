(function () {
	
	'use strict';
	
	angular.module('app.feriado-geral').controller('FeriadoGeralLista', FeriadoGeralLista);
	
	FeriadoGeralLista.$inject = ['SweetAlert', '$scope', 'controller', '$uibModal', 'PrestadorServicoUtils','FeriadoGeralRest', 'tabela'];
	
	function FeriadoGeralLista(SweetAlert, $scope, controller, $uibModal, PrestadorServicoUtils, dataservice, tabela) {
		/* jshint validthis: true */

		let vm = this;
		
		vm.instancia = {};
		vm.tabela = {};
		
		vm.abrirModalFg = abrirModalFg;
		vm.fecharModalFg = fecharModalFg;
		vm.salvar = salvarFg;
		vm.recarregarTabelaFg = recarregarTabelaFg;

		vm.optionsDatePicker = {minMode: 'day'};

		vm.opcoesSimNao = [
			{ label: 'Sim', value: true },
			{ label: 'Não', value: false }
		];

		iniciarTab();
		
		function iniciarTab() {
			montarTabela();
		}
		
		function montarTabela() {

			criarOpcoesTabelaFg();

			function carregarObjetoFg(aData) {
				abrirModalFg(aData.id, aData);
			}

			function criarColunasTabelaFg() {

				let colunas = [
					{data: 'data', title: 'Data do Feriado', width: 20, renderWith: tabela.formatarData},
					{data: 'descricao', title: 'Descrição'},
					{data: 'recorrente', title: 'Recorrente', renderWith: tabela.booleanParaBadgeSimNao},
					{data: 'id', title: 'Ações', width: 15, cssClass: 'text-right', renderWith: tabela.criarBotaoPadrao}
				];

				vm.tabela.colunas = tabela.adicionarColunas(colunas);

			}

			function criarOpcoesTabelaFg() {

				vm.tabela.opcoes = tabela.criarTabela(ajax, vm, removerFg, 'data', carregarObjetoFg);
				criarColunasTabelaFg();

				function ajax(data, callback, settings) {

					dataservice.tabela(tabela.criarParametros(data, vm.filtros)).then(success).catch(error);

					function success(response) {
						callback(controller.lerRetornoDatatable(response));
					}

					function error(response) {
						callback(tabela.vazia());
					}

				}

				function removerFg(id) {
					
					dataservice.remover(id).then(success).catch(error);

					function success(response) {
						controller.feed('success', 'Registro removido com sucesso.');
						tabela.recarregarDados(vm.instancia);
					}

					function error(response) {
						controller.feed('error', 'Erro ao remover registro.');				
					}

				}

			}

		}

		function salvarFg(formulario) {

			if(formulario.$invalid) {
				return;
			}

			if(vm.modal.isEditar) {
				dataservice.atualizar(vm.modal.model.id, vm.modal.model).then(success).catch(error);
			} else {
				dataservice.inserir(vm.modal.model).then(success).catch(error);
			}

			function success(response) {
				controller.feed('success', 'Feriado geral salvo com sucesso.');
				tabela.recarregarDados(vm.instancia);
				fecharModalFg();
			}

			function error(response) {
				controller.feed('error', 'Erro ao salvar feriado geral.');
				controller.feedMessage(response);
			}

		}

		function abrirModalFg(id, feriado) {

			vm.modal = $uibModal.open({
				templateUrl: 'src/feriado-geral/feriado-geral-form.html?' + new Date(),
				backdrop: 'static',
				scope: $scope,
				size: 'md',
				keyboard: false
			});

			vm.modal.model = angular.isDefined(feriado) ? angular.copy(feriado) : {};
			vm.modal.model.data = (feriado && feriado.data) ? new Date(feriado.data) : null;
			vm.modal.model.id = id;
			vm.modal.isEditar = angular.isDefined(feriado);


		}

		function fecharModalFg() {
			vm.modal.close();
			delete vm.modal;
		}

		function recarregarTabelaFg() {
			tabela.recarregarDados(vm.instancia);
		}

	}
	
})();