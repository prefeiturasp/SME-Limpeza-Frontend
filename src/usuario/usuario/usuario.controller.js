(function () {
	
	'use strict';
	
	angular.module('usuario.usuario').controller('UsuarioController', UsuarioController);
	
	UsuarioController.$inject = ['$rootScope', '$scope', '$location', 'controller', 'UsuarioRest', 'tabela', '$uibModal', 'UsuarioOrigemUtils', 'UsuarioCargoUtils', 'UsuarioStatusUtils', 'ContratoUtils', 'DiretoriaRegionalUtils', 'UnidadeEscolarUtils', 'PrestadorServicoUtils', 'moment'];
	
	function UsuarioController($rootScope, $scope, $location, controller, dataservice, tabela, $uibModal, UsuarioOrigemUtils, UsuarioCargoUtils, UsuarioStatusUtils, ContratoUtils, DiretoriaRegionalUtils, UnidadeEscolarUtils, PrestadorServicoUtils, moment) {
		/* jshint validthis: true */
		var vm = this;
		
		vm.filtros = { dreContrato: null };
		vm.instancia = {};
		vm.tabela = {};

		vm.abrirModalUsuario = abrirModalUsuario;
		vm.fecharModalUsuario = fecharModalUsuario;
		vm.salvarUsuario = salvarUsuario;

		vm.evtChangeUsuarioOrigem = evtChangeUsuarioOrigem;
		vm.recarregarTabelaUsuario = recarregarTabelaUsuario;
		vm.irParaImportacaoUsuario = irParaImportacaoUsuario;
		vm.exportar = exportar;
		
		init();
		
		function init() {
			montarTabelaUsuario();
			carregaComboUsuarioOrigem();
			carregaComboUsuarioStatus();
			carregaComboContratoDre();
		}
		
		function montarTabelaUsuario() {
			
			criarOpcoesdaTabela();
			function carregarObjetoDados(aData) {
				dataservice.buscar(aData.id).then((response) => {
					abrirModalUsuario(aData.id, controller.ler(response, 'data'));
				});
			}

			function criarColunasTabelaUsuario() {
				let colunas = [
					{data: '', title: 'Nome do Usuário', renderWith: (v1, v2, data) => {						
						return `<div class="py-3">
									<h5>${data.nome}</h5>
									<small>${data.email || '-'}</small>
								</div>`;
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
					{data: '', title: 'Dre/Contrato', width: 20, cssClass: 'text-left', renderWith: (v1, v2, data) => {
						if (data.contratoCodigo) {
							return `<div class="py-3">
									<h5>${data.contratoDescricao}</h5>
									<small>${data.contratoCodigo}</small>
								</div>`;
						}
						return '-';
					}},
					{data: 'usuarioStatus', title: 'Situação', renderWith: (usuarioStatus) => {
						return `<div class="badge ${usuarioStatus.classeLabel}">${usuarioStatus.descricao}</div>`;
					}},
					{data: 'id', title: 'Ações', width: 15, cssClass: 'text-right', renderWith: tabela.criarBotaoPadraoListaUsuarios}
				);
				vm.tabela.colunas = tabela.adicionarColunas(colunas);
			}

			function criarOpcoesdaTabela() {

				vm.tabela.opcoes = tabela.criarTabela(ajax, vm, desativar, 'data', carregarObjetoDados);
				criarColunasTabelaUsuario();
				function ajax(data, callback, settings) {

					dataservice.tabela(tabela.criarParametros(data, vm.filtros)).then(success).catch(error);
					function success(response) {
						callback(controller.lerRetornoDatatable(response));
					}

					function error(response) {
						callback(tabela.vazia());
					}

				}

				function desativar(id) {
					
					dataservice.remover(id).then(success).catch(error);

					function success(response) {
						controller.feed('success', 'Usuário(a) desativado(a) com sucesso.');
						tabela.recarregarDados(vm.instancia);
					}

					function error(response) {
						controller.feed('error', 'Erro ao desativar o usuário.');				
					}

				}

			}

		}

		function carregaComboUsuarioOrigem() {

			UsuarioOrigemUtils.carregarCombo().then(success).catch(error);
			function success(response) {
				vm.usuarioOrigemList = response.objeto;
				if($rootScope.usuario.usuarioOrigem.codigo == 'ue') {
					vm.filtros.idUsuarioOrigem = $rootScope.usuario.usuarioOrigem.id;
					evtChangeUsuarioOrigem(true);
				}
			}

			function error(err) {
				vm.usuarioOrigemList = [];
				controller.feed('error', 'Houve um erro ao carregar a relação de origem.');
			}

		}

		function carregaComboUsuarioStatus() {

			UsuarioStatusUtils.carregarCombo().then(success).catch(error);
			function success(response) {
				vm.filtros.idUsuarioStatus = 1;
				vm.usuarioStatusList = response.objeto;
			}
			function error(response) {
				vm.usuarioStatusList = [];
				controller.feed('error', 'Houve um erro ao carregar a relação de status.');
			}

		}

		function carregaComboContratoDre() {

			ContratoUtils.carregarCombo().then(success).catch(error);

			function success(response) {
				vm.contratoLista = response.objeto;
			}

			function error(response) {
				vm.contratoLista = [];
				controller.feed('error', 'Erro ao buscar combo de contratos.');
			}

		}

		function evtChangeUsuarioOrigem(ehFiltro = false) {

			vm.origemSelecionada = vm.usuarioOrigemList.find(origem => origem.id == (ehFiltro ? vm.filtros.idUsuarioOrigem : vm.modal.model.idUsuarioOrigem));
			if(ehFiltro) vm.filtros.idOrigemDetalhe = null;
			carregaComboUsuarioCargo(ehFiltro);
			carregaComboOrigemDetalhe();

			if(vm.modal) {
				vm.modal.model.unidadeEscolarList = [];
				vm.modal.model.contratoList = [];
			}
		}

		function carregaComboUsuarioCargo(ehFiltro = false) {

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

		function carregaComboOrigemDetalhe() {

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

		function carregaComboUnidadeEscolar() {

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

		function carregaComboContrato() {

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

		function salvarUsuario(formulario) {

			if(formulario.$invalid) {
				return;
			}

			vm.modal.model.idOrigemDetalhe = vm.modal.model.idOrigemDetalhe?.id || vm.modal.model.idOrigemDetalhe;
			if(vm.modal.isEditar) {
				dataservice.atualizar(vm.modal.model.id, vm.modal.model).then(success).catch(error);
			} else {
				dataservice.verificaVinculoContrato(vm.modal.model.email).then((response) => {
					const possuiVinculo = response.data.data.possuiVinculo;
					if (possuiVinculo) {
						controller.feed('warning', 'Este usuário já está vinculado a um contrato ativo e não pode ser inserido.');
						return;
					}
				
					dataservice.inserir(vm.modal.model).then(success).catch(error);
				}).catch(error);
			}

			function success(response) {
				controller.feed('success', 'Registro salvo com sucesso.');
				tabela.recarregarDados(vm.instancia);
				fecharModalUsuario();
			}

			function error(response) {
				controller.feedMessage(response);
			}

		}

		function abrirModalUsuario(id, usuario) {

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
			carregaComboUnidadeEscolar();
			carregaComboContrato();

		}

		function fecharModalUsuario() {
			vm.modal.close();
			delete vm.modal;
		}

		function recarregarTabelaUsuario() {
			tabela.recarregarDados(vm.instancia);
		}

		function irParaImportacaoUsuario() {
			$rootScope.$evalAsync(() => {
				$location.path('usuario/importar');
			});
		}

		function exportar() {
			const filtros = angular.copy(vm.filtros);
			if (filtros.idOrigemDetalhe && filtros.idOrigemDetalhe.id) {
				filtros.idOrigemDetalhe = { id: filtros.idOrigemDetalhe.id };
			}
			dataservice.exportar({ filters: filtros }).then(success).catch(error);

			function success(response) {
				const arquivo = controller.ler(response, 'data');
				if (arquivo) {
					controller.downloadArquivo(arquivo);
				}
			}

			function error(response) {
				controller.feed('error', 'Houve um erro ao exportar a lista de usuários.');
			}
		}

	}
})();