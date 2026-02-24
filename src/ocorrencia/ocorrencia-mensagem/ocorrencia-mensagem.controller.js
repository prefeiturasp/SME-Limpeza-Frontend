(function () {
	
	'use strict';
	
	angular
	.module('ocorrencia.ocorrencia-mensagem')
	.controller('OcorrenciaMensagemLista', OcorrenciaMensagemLista);
	
	OcorrenciaMensagemLista.$inject = ['$rootScope', '$location', 'controller', 'OcorrenciaMensagemRest', 'tabela', '$uibModal',
		'OcorrenciaTipoUtils', 'UnidadeEscolarUtils', 'PrestadorServicoUtils'];
	
	function OcorrenciaMensagemLista($rootScope, $location, controller, dataservice, tabela, $uibModal,
		OcorrenciaTipoUtils, UnidadeEscolarUtils, PrestadorServicoUtils) {
		/* jshint validthis: true */

		var vm = this;
		
		vm.filtros = {};
		vm.instancia = {};
		vm.tabela = {};
	
		vm.optionsDatePicker = {
			minMode: 'day', 
			maxDate: moment()
		};

		vm.recarregarTabela = recarregarTabela;
		vm.abrirModal = abrirModal;
		vm.fecharModal = fecharModal;
		vm.exportar = exportar;

		iniciar();
		
		function iniciar() {
			montarTabela();
		}
		
		function montarTabela() {

			criarOpcoesTabela();

			function criarColunasTabela() {

				const colunas = [
					{data: 'dataHora', title: 'Data/Hora', width: 15, renderWith: tabela.formatarDataHora },
					{data: 'mensagem', title: 'Mensagem', cssClass: 'td-text' },
					{data: 'usuario', title: 'Nome do Usuário', width: 15 },
					{data: 'dataOcorrencia', title: 'Data/Hora da Ocorrência', width: 15, renderWith: tabela.formatarDataHora },
					{data: 'idOcorrencia', title: 'Ações', width: 10, cssClass: 'text-right', renderWith: (var1, var2, data) => {
						return `<button class="btn btn-outline-primary btn-sm visualizar" title="Visualizar"><i class="icon-eye"></i></button>`;
					}}
				];

				vm.tabela.colunas = tabela.adicionarColunas(colunas);

			}

			function criarOpcoesTabela() {

				vm.tabela.opcoes = tabela.criarTabela(ajax, vm, null, 'data');
				vm.tabela.opcoes.withOption('rowCallback', rowCallback);
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

				function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
	
					$('.visualizar', nRow).off('click');
					$('.visualizar', nRow).on('click', () => {
						$rootScope.$evalAsync(() => {
							$location.path('ocorrencia/detalhe/' + aData.idOcorrencia);
						});
					});
	
				}

			}

		}

		function abrirModal(id, ocorrencia) {

			if(!$rootScope.usuario.flagFiscal) {
				return;
			}

			vm.modal = $uibModal.open({
				templateUrl: 'src/ocorrencia/ocorrencia-form/ocorrencia-form-modal.html?' + new Date(),
				bindToController: true,
				backdrop: 'static',
				controller: 'OcorrenciaForm',
				controllerAs: 'vm',
				size: 'lg',
				keyboard: false,
			}).result.then(() => {
				recarregarTabela();
			});

		}

		function fecharModal() {
			vm.modal.close();
			delete vm.modal;
		}

		function recarregarTabela() {
			tabela.recarregarDados(vm.instancia);
		}

		function exportar() {

			dataservice.exportar(vm.filtros).then(success).catch(error);

			function success(response) {
				const data = controller.ler(response, 'data');
				const a = document.createElement("a");
				document.body.appendChild(a);
				a.style = "display: none";
				const file = new Blob([data], { type: 'application/csv' });
				const fileUrl = window.URL.createObjectURL(file);
				a.href = fileUrl;
				a.download = `ocorrencias-${moment().format('ddMMyyyyHH:mm:ss')}.csv`;
				a.click();
			}

			function error(response) {
				controller.feed('error', 'Houve um erro ao exportar o relatório.');
			}

		}

	}
	
})();