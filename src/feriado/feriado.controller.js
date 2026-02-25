(function () {
	
	'use strict';
	
	angular
	.module('app.feriado')
	.controller('FeriadoLista', FeriadoLista);
	
	FeriadoLista.$inject = ['SweetAlert', '$scope', 'controller', 'FeriadoRest', 'tabela', '$uibModal', 'PrestadorServicoUtils', 'UnidadeEscolarUtils'];
	
	function FeriadoLista(SweetAlert, $scope, controller, dataservice, tabela, $uibModal, PrestadorServicoUtils, UnidadeEscolarUtils) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.instancia = {};
		vm.tabela = {};
		
		vm.abrirModal = abrirModal;
		vm.fecharModal = fecharModal;
		vm.salvar = salvar;
		vm.recarregarTabela = recarregarTabela;

		vm.optionsDatePicker = {minMode: 'day'};

		iniciar();
		
		function iniciar() {
			montarTabela();
		}
		
		function montarTabela() {

			criarOpcoesTabela();

			function carregarObjeto(aData) {
				abrirModal(aData.id, aData);
			}

			function criarColunasTabela() {

				var colunas = [
					{data: 'data', title: 'Data do Feriado', width: 20, renderWith: tabela.formatarData},
					{data: 'descricao', title: 'Descrição'},
					{data: 'id', title: 'Ações', width: 15, cssClass: 'text-right', renderWith: tabela.criarBotaoPadrao}
				];

				vm.tabela.colunas = tabela.adicionarColunas(colunas);

			}

			function criarOpcoesTabela() {

				vm.tabela.opcoes = tabela.criarTabela(ajax, vm, remover, 'data', carregarObjeto);
				criarColunasTabela();

				function ajax(data, callback, settings) {

					dataservice.tabela(tabela.criarParametros(data, vm.filtros)).then(success).catch(error);

					function success(response) {
						callback(controller.lerRetornoDatatable(response));
					}

					function error(response) {
						callback(tabela.vazia());
					}

				}

				function remover(id) {
					
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

		function salvar(formulario) {

			if(formulario.$invalid) {
				return;
			}

			if(vm.modal.isEditar) {
				dataservice.atualizar(vm.modal.model.id, vm.modal.model).then(success).catch(error);
			} else {
				dataservice.inserir(vm.modal.model).then(success).catch(error);
			}

			function success(response) {
				controller.feed('success', 'Feriado salvo com sucesso.');
				tabela.recarregarDados(vm.instancia);
				fecharModal();
			}

			function error(response) {
				controller.feed('error', 'Erro ao salvar feriado.');
				controller.feedMessage(response);
			}

		}

		function abrirModal(id, feriado) {

			vm.modal = $uibModal.open({
				templateUrl: 'src/feriado/feriado-form.html?' + new Date(),
				backdrop: 'static',
				scope: $scope,
				size: 'md',
				keyboard: false
			});

			vm.modal.model = angular.isDefined(feriado) ? angular.copy(feriado) : {};
			vm.modal.model.data = feriado.data ? new Date(feriado.data) : null;
			vm.modal.model.id = id;
			vm.modal.isEditar = angular.isDefined(feriado);

		}

		function fecharModal() {
			vm.modal.close();
			delete vm.modal;
		}

		function recarregarTabela() {
			tabela.recarregarDados(vm.instancia);
		}

	}
	
})();