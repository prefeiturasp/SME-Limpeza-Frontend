(function () {
	
	'use strict';
	
	angular
	.module('app.prestador-servico')
	.controller('PrestadorServicoLista', PrestadorServicoLista);
	
	PrestadorServicoLista.$inject = ['$rootScope', '$scope', 'controller', 'PrestadorServicoRest', 'tabela', '$uibModal'];
	
	function PrestadorServicoLista($rootScope, $scope, controller, dataservice, tabela, $uibModal) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.instancia = {};
		vm.tabela = {};

		vm.optionsDatePicker = {minMode: 'day', maxDate: moment()};
		
		vm.abrirModal = abrirModal;
		vm.fecharModal = fecharModal;
		vm.salvar = salvar;

		vm.recarregarTabela = recarregarTabela;

		iniciar();
		
		function iniciar() {
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
					{data: 'razaoSocial', title: 'Razão Social'},
					{data: 'cnpj', title: 'CNPJ', width: 20, renderWith: tabela.formatarCnpj},
					{data: 'id', title: 'Ações', width: 20, cssClass: 'text-right', renderWith: tabela.criarBotaoPadrao}
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
				controller.feed('success', 'Registro salvo com sucesso.');
				tabela.recarregarDados(vm.instancia);
				fecharModal();
			}

			function error(response) {
				controller.feed('error', 'Erro ao salvar registro.');
			}

		}

		function abrirModal(id, prestadorServico) {

			vm.modal = $uibModal.open({
				templateUrl: 'src/prestador-servico/prestador-servico-form.html?' + new Date(),
				backdrop: 'static',
				scope: $scope,
				size: 'lg',
				keyboard: false
			});

			vm.modal.model = angular.isDefined(prestadorServico) ? angular.copy(prestadorServico) : {};
			vm.modal.model.id = id;
			vm.modal.isEditar = angular.isDefined(prestadorServico);

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