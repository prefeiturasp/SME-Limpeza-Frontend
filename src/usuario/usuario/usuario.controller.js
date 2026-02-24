(function () {
	
	'use strict';
	
	angular
	.module('usuario.usuario')
	.controller('UsuarioController', UsuarioController);
	
	UsuarioController.$inject = ['$rootScope', '$scope', '$location', 'controller', 'UsuarioRest', 'tabela', '$uibModal', 'UsuarioOrigemUtils', 
		'UsuarioCargoUtils', 'UsuarioStatusUtils', 'DiretoriaRegionalUtils', 'UnidadeEscolarUtils', 'PrestadorServicoUtils', 'ContratoUtils'];
	
	function UsuarioController($rootScope, $scope, $location, controller, dataservice, tabela, $uibModal, UsuarioOrigemUtils, 
		UsuarioCargoUtils, UsuarioStatusUtils, DiretoriaRegionalUtils, UnidadeEscolarUtils, PrestadorServicoUtils, ContratoUtils) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.filtros = {};
		vm.instancia = {};
		vm.tabela = {};

		vm.abrirModal = abrirModal;
		vm.fecharModal = fecharModal;
		vm.salvar = salvar;

		vm.evtChangeUsuarioOrigem = evtChangeUsuarioOrigem;
		vm.recarregarTabela = recarregarTabela;
		vm.irParaImportacao = irParaImportacao;
		
		iniciar();
		
		function iniciar() {
			montarTabela();
			carregarComboUsuarioOrigem();
			carregarComboUsuarioStatus();
		}
		
		function montarTabela() {

			criarOpcoesTabela();

			function carregarObjeto(aData) {
				dataservice.buscar(aData.id).then((response) => {
					abrirModal(aData.id, controller.ler(response, 'data'));
				});
			}

			function criarColunasTabela() {

				let colunas = [
					{data: '', title: 'Nome do Usuário', renderWith: (v1, v2, data) => {
						return `
							<div class="py-3">
              	<h5>${data.nome}</h5>
                <small>${data.email || '-'}</small>
							</div>
						`;
					}}
				];

				if(!['ps', 'ue'].includes($rootScope.usuario.usuarioOrigem.codigo)) {
					colunas.push({
						data: '', title: 'Origem e Cargo', width: 30, renderWith: (v1, v2, data) => {
							return ['sme', 'dre'].includes(data.usuarioOrigem.codigo) ? data.usuarioOrigem.descricao : `
								<div class="py-3">
									<h5>${data.usuarioOrigem.descricao}</h5>
									<small>${data.usuarioCargo.descricao}</small>
								</div>
							`;
						}
					});
				}

				if(['ps', 'ue'].includes($rootScope.usuario.usuarioOrigem.codigo)) {
					colunas.push({
						data: 'usuarioCargo.descricao', title: 'Cargo do Usuário', width: 30 });
				}

				colunas.push(
					{data: 'usuarioStatus', title: 'Situação', renderWith: (usuarioStatus) => {
						return `<div class="badge ${usuarioStatus.classeLabel}">${usuarioStatus.descricao}</div>`;
					}},
					{data: 'id', title: 'Ações', width: 15, cssClass: 'text-right', renderWith: tabela.criarBotaoPadrao}
				);

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

		function carregarComboUsuarioOrigem() {

			UsuarioOrigemUtils.carregarCombo().then(success).catch(error);

			function success(response) {
				vm.usuarioOrigemList = response.objeto;
				if($rootScope.usuario.usuarioOrigem.codigo == 'ue') {
					vm.filtros.idUsuarioOrigem = $rootScope.usuario.usuarioOrigem.id;
					evtChangeUsuarioOrigem(true);
				}
			}

			function error(err) {
				console.log(err);
				vm.usuarioOrigemList = [];
				controller.feed('error', 'Houve um erro ao carregar a relação de origem.');
			}

		}

		function carregarComboUsuarioStatus() {

			UsuarioStatusUtils.carregarCombo().then(success).catch(error);

			function success(response) {
				vm.usuarioStatusList = response.objeto;
			}

			function error(response) {
				vm.usuarioStatusList = [];
				controller.feed('error', 'Houve um erro ao carregar a relação de status.');
			}

		}

		function evtChangeUsuarioOrigem(ehFiltro = false) {

			vm.origemSelecionada = vm.usuarioOrigemList.find(origem => origem.id == (ehFiltro ? vm.filtros.idUsuarioOrigem : vm.modal.model.idUsuarioOrigem));
			if(ehFiltro) vm.filtros.idOrigemDetalhe = null;
			carregarComboUsuarioCargo(ehFiltro);
			carregarComboOrigemDetalhe();

			if(vm.modal) {
				vm.modal.model.unidadeEscolarList = [];
				vm.modal.model.contratoList = [];
			}

		}

		function carregarComboUsuarioCargo(ehFiltro = false) {

			const idUsuarioOrigem = angular.copy(ehFiltro ? vm.filtros.idUsuarioOrigem : vm.modal.model.idUsuarioOrigem);
			if(!idUsuarioOrigem) {
				return;
			}

			UsuarioCargoUtils.carregarCombo(idUsuarioOrigem).then(success).catch(error);

			function success(response) {
				vm.usuarioCargoList = response.objeto;
			}

			function error(response) {
				vm.usuarioCargoList = [];
				controller.feed('error', 'Houve um erro ao carregar a relação de cargos.');
			}

		}

		function carregarComboOrigemDetalhe() {

			switch(vm.origemSelecionada?.codigo) {
				case 'dre'	: DiretoriaRegionalUtils.carregarComboTodos().then(success).catch(error); break;
				case 'ue'	: UnidadeEscolarUtils.carregarComboTodos().then(success).catch(error); break;
				case 'ps'	: PrestadorServicoUtils.carregarComboTodos().then(success).catch(error); break;
			}

			function success(response) {
				vm.origemDetalheList = response.objeto;
				if(vm.modal) {
					vm.modal.model.idOrigemDetalhe = angular.copy(vm.origemDetalheList.find(od => od.id == vm.modal.model.idOrigemDetalhe));
				}
			}

			function error(response) {
				vm.origemDetalheList = [];
				controller.feed('error');
			}

		}

		function carregarComboUnidadeEscolar() {

			UnidadeEscolarUtils.carregarComboDetalhadoTodos().then(success).catch(error);
			
			function success(response) {
				vm.unidadeEscolarLista = response.objeto;
				vm.modal.model.unidadeEscolarList = vm.unidadeEscolarLista.filter(ue => vm.modal.model.unidadeEscolarPermissao?.includes(ue.id));
			}

			function error(response) {
				vm.unidadeEscolarLista = [];
				controller.feed('error', 'Erro ao buscar combo de unidades escolares.');
			}

		}

		function carregarComboContrato() {

			ContratoUtils.carregarComboTodos().then(success).catch(error);
			
			function success(response) {
				vm.contratoLista = response.objeto;
				vm.modal.model.contratoList = vm.contratoLista.filter(c => vm.modal.model.contratoPermissao?.includes(c.id));
			}

			function error(response) {
				vm.contratoLista = [];
				controller.feed('error', 'Erro ao buscar combo de contratos.');
			}

		}

		function salvar(formulario) {

			if(formulario.$invalid) {
				return;
			}

			vm.modal.model.idOrigemDetalhe = vm.modal.model.idOrigemDetalhe?.id || vm.modal.model.idOrigemDetalhe;
			
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
				controller.feedMessage(response);
			}

		}

		function abrirModal(id, usuario) {

			vm.modal = $uibModal.open({
				templateUrl: 'src/usuario/usuario/usuario-form.html?' + new Date(),
				backdrop: 'static',
				scope: $scope,
				size: 'lg',
				keyboard: false
			});

			vm.modal.model = angular.isDefined(usuario) ? angular.copy(usuario) : {};
			vm.modal.model.id = id;
			vm.modal.isEditar = angular.isDefined(usuario);
			evtChangeUsuarioOrigem();
			carregarComboUnidadeEscolar();
			carregarComboContrato();

		}

		function fecharModal() {
			vm.modal.close();
			delete vm.modal;
		}

		function recarregarTabela() {
			tabela.recarregarDados(vm.instancia);
		}

		function irParaImportacao() {
			$rootScope.$evalAsync(() => {
				$location.path('usuario/importar');
			});
		}

	}
})();