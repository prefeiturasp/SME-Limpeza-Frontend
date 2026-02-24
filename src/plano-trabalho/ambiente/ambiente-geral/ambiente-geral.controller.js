(function () {
	
	'use strict';
	
	angular
	.module('ambiente.ambiente-geral')
	.controller('AmbienteGeralLista', AmbienteGeralLista);
	
	AmbienteGeralLista.$inject = ['$scope', 'controller', 'AmbienteGeralRest', 'tabela', '$uibModal', 'TipoAmbienteUtils'];
	
	function AmbienteGeralLista($scope, controller, dataservice, tabela, $uibModal, TipoAmbienteUtils) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.instancia = {};
		vm.tabela = {};

		vm.abrirModal = abrirModal;
		vm.fecharModal = fecharModal;
		vm.salvar = salvar;
		vm.recarregarTabela = recarregarTabela;

		iniciar();
		
		function iniciar() {
			carregarComboTipoAmbiente();
			montarTabela();
		}
		
		function montarTabela() {

			criarOpcoesTabela();

			function carregarObjeto(aData) {
				dataservice.buscar(aData.id).then((response) => {
					abrirModal(aData.id, controller.ler(response, 'data'));
				});
			}

			function criarColunasTabela() {

				var colunas = [
					{data: 'descricao', title: 'Descrição'},
					{data: 'tipoAmbiente', title: 'Tipo de Ambiente', cssClass: 'text-right'},
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

		function carregarComboTipoAmbiente() {
			
			TipoAmbienteUtils.carregarCombo().then(success).catch(error);

			function success(response) {
				vm.tipoAmbienteList = response.objeto;
			}

			function error(response) {
				vm.tipoAmbienteList = [];
				controller.feed(false, 'Erro ao carregar tipos de ambiente.');
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
				controller.feed('success', 'Registro salvo com sucesso.');
				tabela.recarregarDados(vm.instancia);
				fecharModal();
			}

			function error(response) {
				controller.feed('error', 'Erro ao salvar registro.');
				tabela.recarregarDados(vm.instancia);
			}

		}

		function abrirModal(id, ambienteGeral) {

			vm.modal = $uibModal.open({
				templateUrl: 'src/plano-trabalho/ambiente/ambiente-geral/ambiente-geral-form.html?' + new Date(),
				backdrop: 'static',
				scope: $scope,
				size: 'md',
				keyboard: false,
			});

			vm.modal.model = angular.isDefined(ambienteGeral) ? angular.copy(ambienteGeral) : {};
			vm.modal.model.id = id;
			vm.modal.isEditar = angular.isDefined(ambienteGeral);

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