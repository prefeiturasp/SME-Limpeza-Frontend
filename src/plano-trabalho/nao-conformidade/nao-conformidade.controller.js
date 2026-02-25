(function () {
	
	'use strict';
	
	angular
	.module('plano-trabalho.nao-conformidade')
	.controller('NaoConformidadeLista', NaoConformidadeLista);
	
	NaoConformidadeLista.$inject = ['$window', '$scope', 'controller', 'NaoConformidadeRest', 'tabela', '$uibModal'];
	
	function NaoConformidadeLista($window, $scope, controller, dataservice, tabela, $uibModal) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.instancia = {};
		vm.tabela = {};


		vm.abrirModal = abrirModal;
		vm.fecharModal = fecharModal;
		vm.salvar = salvar;

		vm.abrirModalAcaoCorretiva = abrirModalAcaoCorretiva;
		vm.fecharModalAcaoCorretiva = fecharModalAcaoCorretiva;
		vm.salvarAcaoCorretiva = salvarAcaoCorretiva;
		vm.removerAcaoCorretiva = removerAcaoCorretiva;

		vm.evtChangeFlagAcaoImediata= evtChangeFlagAcaoImediata;
		vm.recarregarTabela = recarregarTabela;
		vm.verificarFormulario = verificarFormulario;

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
					{data: 'descricao', title: 'Descrição'},
					{data: 'flagAcaoImediata', title: 'Exigir Ação Imediata', cssClass: 'text-right', renderWith: tabela.booleanParaBadgeSimNao},
					{data: 'prazoAcaoCorretiva', title: 'Prazo para Ação', cssClass: 'text-right', renderWith: function (prazo) {
						return prazo === null ? '-' : `<div class="badge bg-info badge-pill text-white">${prazo} ${(prazo == 1 ? 'dia' : 'dias')} </div>`;
					}},
					{data: 'quantidadeAcaoCorretiva', title: 'Quant. de AC', cssClass: 'text-right', renderWith: function (quantidade, var2, data) {
						return (quantidade === null || !data.flagAcaoImediata) ? '-' : `<div class="badge bg-info badge-pill text-white">${quantidade}</div>`;
					}},
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

		function abrirModal(id, naoConformidade) {

			vm.modal = $uibModal.open({
				templateUrl: 'src/plano-trabalho/nao-conformidade/nao-conformidade-form.html?' + new Date(),
				backdrop: 'static',
				scope: $scope,
				size: 'lg',
				keyboard: false
			});

			vm.modal.model = angular.isDefined(naoConformidade) ? angular.copy(naoConformidade) : {};
			vm.modal.model.acaoCorretiva = vm.modal.model.acaoCorretiva || [];
			vm.modal.model.id = id;
			vm.modal.isEditar = angular.isDefined(naoConformidade);

		}

		function fecharModal() {
			vm.modal.close();
			delete vm.modal;
		}

		function abrirModalAcaoCorretiva(indice, acaoCorretiva) {

			vm.modalAcaoCorretiva = $uibModal.open({
				templateUrl: 'src/plano-trabalho/nao-conformidade/nao-conformidade-form-acao-corretiva.html?' + new Date(),
				backdrop: 'static',
				scope: $scope,
				size: 'md',
				keyboard: false
			});

			vm.modalAcaoCorretiva.model = angular.isDefined(acaoCorretiva) ? angular.copy(acaoCorretiva) : {};
			vm.modalAcaoCorretiva.index = indice;
			vm.modalAcaoCorretiva.isEditar = angular.isDefined(acaoCorretiva) && angular.isDefined(indice);

		}

		function fecharModalAcaoCorretiva() {
			vm.modalAcaoCorretiva.close();
			delete vm.modalAcaoCorretiva;
		}

		function salvarAcaoCorretiva(formularioAcaoCorretiva) {

			if(formularioAcaoCorretiva.$invalid) {
				return;
			}

			if(vm.modalAcaoCorretiva.isEditar) {
				vm.modal.model.acaoCorretivaLista[vm.modalAcaoCorretiva.index] = angular.copy(vm.modalAcaoCorretiva.model);
			} else {
				vm.modal.model.acaoCorretivaLista = vm.modal.model.acaoCorretivaLista || [];
				vm.modal.model.acaoCorretivaLista.push(angular.copy(vm.modalAcaoCorretiva.model));
			}

			fecharModalAcaoCorretiva();
			
		}

		function removerAcaoCorretiva(indice) {
			vm.modal.model.acaoCorretivaLista.splice(indice, 1);
		}

		function evtChangeFlagAcaoImediata() {
			vm.modal.model.prazoAcaoCorretiva = null;
			vm.modal.model.acaoCorretivaLista = [];
		}

		function recarregarTabela() {
			tabela.recarregarDados(vm.instancia);
		}
		
		function verificarFormulario(formulario) {

			if(formulario.$invalid) {
				return false;
			}

			if(vm.modal.model.flagAcaoImediata) {
				return vm.modal.model.acaoCorretivaLista.length > 0;
			}

			return true;

		}

	}
	
})();