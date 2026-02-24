(function () {
	
	'use strict';
	
	angular
	.module('app.diretoria-regional')
	.controller('DiretoriaRegionalLista', DiretoriaRegionalLista);
	
	DiretoriaRegionalLista.$inject = ['$rootScope', '$scope', '$location', 'controller', 'DiretoriaRegionalRest', 'tabela', '$uibModal'];
	
	function DiretoriaRegionalLista($rootScope, $scope, $location, controller, dataservice, tabela, $uibModal) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.instancia = {};
		vm.tabela = {};
	
		vm.recarregarTabela = recarregarTabela;
		
		vm.irParaImportacao = irParaImportacao;
		vm.abrirModal = abrirModal;
		vm.fecharModal = fecharModal;
		vm.salvar = salvar;

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
					{data: 'descricao', title: 'Nome da DRE'},
					{data: 'email', title: 'E-mail', renderWith: tabela.substituirValorNulo},
					{data: 'telefone', title: 'Telefone', cssClass: 'text-right', renderWith: tabela.formatarTelefone},
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
				controller.feed('success', 'Registro salvo com sucesso.');
				tabela.recarregarDados(vm.instancia);
				fecharModal();
			}

			function error(response) {
				controller.feed('error', 'Erro ao salvar registro.');
				tabela.recarregarDados(vm.instancia);
			}

		}

		function irParaImportacao() {
			$rootScope.$evalAsync(() => {
				$location.path('diretoria-regional/importar');
			});
		}

		function abrirModal(id, diretoriaRegional) {

			vm.modal = $uibModal.open({
				templateUrl: 'src/diretoria-regional/diretoria-regional-form.html',
				backdrop: 'static',
				scope: $scope,
				size: 'md',
				keyboard: false,
			});

			vm.modal.model = Object.assign({}, diretoriaRegional);
			vm.modal.model.id = id;
			vm.modal.isEditar = angular.isDefined(diretoriaRegional);

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