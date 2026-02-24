(function () {
	
	'use strict';
	
	angular
	.module('plano-trabalho.plano-trabalho-matriz')
	.controller('PlanoTrabalhoMatrizLista', PlanoTrabalhoMatrizLista);
	
	PlanoTrabalhoMatrizLista.$inject = ['$scope', 'controller', 'PlanoTrabalhoMatrizRest', 'tabela', '$uibModal', 
		'PeriodicidadeUtils', 'AmbienteGeralUtils', 'TipoAmbienteUtils', 'TurnoUtils'];
	
	function PlanoTrabalhoMatrizLista($scope, controller, dataservice, tabela, $uibModal, 
		PeriodicidadeUtils, AmbienteGeralUtils, TipoAmbienteUtils, TurnoUtils) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.instancia = {};
		vm.tabela = {};

		vm.abrirModal = abrirModal;
		vm.fecharModal = fecharModal;
		vm.salvar = salvar;
		vm.recarregarTabela = recarregarTabela;

		vm.optionsSummernote = {
			height: 300,
			focus: true,
			toolbar: [
				['edit',['undo','redo']],
				['alignment', ['ul', 'ol']]
			]
		};

		iniciar();
		
		function iniciar() {
			carregarComboTipoAmbiente();
			carregarComboAmbiente();
			carregarComboPeriodicidade();
			carregarComboTurno();
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
					{data: 'ambiente', title: 'Ambiente'},
					{data: 'tipoAmbiente', title: 'Tipo do Ambiente', cssClass: 'text-right'},
					{data: 'periodicidade.descricao', title: 'Periodicidade', cssClass: 'text-right'},
					{data: 'turno.descricao', title: 'Turno', cssClass: 'text-right'},
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

		function carregarComboAmbiente() {

			AmbienteGeralUtils.carregarCombo().then(success).catch(error);

			function success(response) {
				vm.ambienteGeralList = response.objeto;
			}

			function error(response) {
				vm.ambienteGeralList = [];
				controller.feed('error', 'Erro ao buscar lista de ambientes.');
			}

		}

		function carregarComboPeriodicidade() {

			PeriodicidadeUtils.carregarCombo().then(success).catch(error);

			function success(response) {
				vm.periodicidadeList = response.objeto;
			}

			function error(response) {
				vm.periodicidadeList = [];
				controller.feed('error', 'Erro ao buscar periodicidades.');
			}

		}

		function carregarComboTurno() {

			TurnoUtils.carregarCombo().then(success).catch(error);

			function success(response) {
				vm.turnoList = response.objeto;
			}

			function error(response) {
				vm.turnoList = [];
				controller.feed('error', 'Erro ao buscar turnos.');
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
				controller.feed('success', 'Plano de trabalho salvo com sucesso.');
				tabela.recarregarDados(vm.instancia);
				fecharModal();
			}

			function error(response) {
				controller.feed('error', 'Erro ao salvar plano de trabalho.');
				tabela.recarregarDados(vm.instancia);
			}

		}

		function abrirModal(id, planoTrabalho) {

			vm.modal = $uibModal.open({
				templateUrl: 'src/plano-trabalho/plano-trabalho-matriz/plano-trabalho-matriz-form.html?' + new Date(),
				backdrop: 'static',
				scope: $scope,
				size: 'lg',
				keyboard: false
			});

			vm.modal.model = angular.isDefined(planoTrabalho) ? angular.copy(planoTrabalho) : {};
			vm.modal.model.id = id;
			vm.modal.isEditar = angular.isDefined(planoTrabalho);

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