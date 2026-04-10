(function () {

	'use strict';

	angular
		.module('app.configuracao')
		.controller('Configuracao', Configuracao);

	Configuracao.$inject = ['$rootScope', '$window', '$location', 'controller', 'ConfiguracaoRest', 'OcorrenciaTipoUtils'];

	function Configuracao($rootScope, $window, $location, controller, dataservice, OcorrenciaTipoUtils) {
		/* jshint validthis: true */

		var vm = this;

		vm.abrirEdicao = abrirEdicao;
		vm.evtChangeConfiguracao = evtChangeConfiguracao;
		vm.evtKeyboardConfiguracao = evtKeyboardConfiguracao;
		vm.salvarNoticia = salvarNoticia;
		vm.manutencaoSistema = false;
		vm.evtChangeManutencao = evtChangeManutencao;
		vm.emailSettings = [];
		vm.salvarEmailSettings = salvarEmailSettings;
		vm.evtChangeEmailSetting = evtChangeEmailSetting;


		vm.optionsSummernote = {
			height: 300,
			focus: true,
			toolbar: [
				['edit', ['undo', 'redo']],
				['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
				['textsize', ['fontsize']],
				['fontclr', ['color']],
				['alignment', ['ul', 'paragraph', 'lineheight']],
				['height', ['height']],
				['table', ['table']],
				['insert', ['link', 'picture', 'video', 'hr']],
			]
		};

		iniciar();

		function iniciar() {
			buscar();
			buscarNoticia();
			carregarComboOcorrenciaTipo();
			verificaManutencaoSistema();
			buscarEmailSettings();
		}

		function buscar() {

			dataservice.buscar().then(success).catch(error);

			function success(response) {
				$window.scrollTo(0, 0);
				vm.configuracaoList = controller.ler(response, 'data');
			}

			function error(response) {
				controller.feed('error', 'Hove um erro ao buscar os parâmetros gerais.');
				vm.configuracaoList = [];
			}

		}

		function carregarComboOcorrenciaTipo() {

			OcorrenciaTipoUtils.carregarCombo().then(success).catch(error);

			function success(response) {
				const ocorrenciaTipoList = response.objeto;
				vm.ocorrenciaTipoListModelo1 = ocorrenciaTipoList.filter(ot => ot.contratoModelo === 1);
				vm.ocorrenciaTipoListModelo2 = ocorrenciaTipoList.filter(ot => ot.contratoModelo === 2);
				const pesoTotalModelo1 = (vm.ocorrenciaTipoListModelo1).reduce((accumulator, ov) => accumulator + parseInt(ov.peso), 0);
				const pesoTotalModelo2 = (vm.ocorrenciaTipoListModelo2).reduce((accumulator, ov) => accumulator + parseInt(ov.peso), 0);
				vm.flagExibirAlertaPesoTotal = pesoTotalModelo1 !== 100 || pesoTotalModelo2 !== 100;
			}

			function error(response) {
				controller.feed('error', 'Hove um erro ao buscar as variáveis gerenciais.');
				vm.ocorrenciaTipoList = [];
			}

		}

		function abrirEdicao(idOcorrenciaTipo) {
			$rootScope.$evalAsync(() => {
				$location.path('configuracao/variavel-gerencial/' + idOcorrenciaTipo);
			});
		}

		function evtChangeConfiguracao(configuracao) {

			if (configuracao.novoValor === configuracao.valor) {
				return;
			}

			if (configuracao.novoValor < 0) {
				controller.feed('error', 'O valor não pode ser menor que zero.');
				return;
			}

			dataservice.atualizar(configuracao.parametro, configuracao).then(success).catch(error);

			function success(response) {
				controller.feed('success', 'O parâmetro ' + configuracao.parametro + ' foi atualizado com sucesso.');
				buscar();
			}

			function error(response) {
				controller.feed('error', 'Hove um erro ao atualizar o parâmetro.');
				buscar();
			}

		}

		function evtKeyboardConfiguracao(event, configuracao) {
			const keyCode = event.which || event.keyCode;
			if ([9, 13].includes(keyCode)) {
				evtChangeConfiguracao(configuracao);
			}
		}

		function buscarNoticia() {

			dataservice.buscar('TEXTO_NOTICIA').then(success).catch(error);

			function success(response) {
				vm.conteudoNoticia = controller.ler(response, 'data').descricao;
			}

			function error(response) {
				controller.feed('error', 'Hove um erro ao buscar o conteúdo de notícias.');
				vm.conteudoNoticia = null;
			}

		}

		function salvarNoticia(conteudo) {

			const model = {
				parametro: 'TEXTO_NOTICIA',
				descricao: conteudo
			}

			dataservice.atualizar('TEXTO_NOTICIA', model).then(success).catch(error);

			function success(response) {
				controller.feed('success', 'O conteúdo de notícias foi atualizado com sucesso.');
				buscarNoticia();
			}

			function error(response) {
				controller.feed('error', 'Hove um erro ao atualizar o conteúdo de notícias.');
				buscarNoticia();
			}
		}

		function verificaManutencaoSistema(){
			dataservice.buscaManutencaoSistema().then(success).catch(error);

			function success(response) {
				let valor = response.data.data.valor;
				if (valor === 1) {
					vm.manutencaoSistema = true;
				} else {
					vm.manutencaoSistema = false;
				}
			}
			function error(response) {
				controller.feed('error', 'Hove um erro ao buscar a configuração de manutenção do sistema.');
			}

		}

		function evtChangeManutencao(){
			
			dataservice.salvaManutencaoSistema(vm.manutencaoSistema).then(success).catch(error);
			function success(response) {
				if (vm.manutencaoSistema){
					controller.feed('success', 'Manutenção do sistema foi ativada com sucesso.');
				} else {
					controller.feed('warning', 'Manutenção do sistema foi desativada com sucesso.');
				}
			}
			function error(response) {
				controller.feed('error', 'Hove um erro ao ativar/desativar a manutenção do sistema.');
			}

		}

		function buscarEmailSettings() {
			dataservice.buscarEmailSettings().then(function(response) {
				vm.emailSettings = response.data.data.map(function(setting) {
					return {
						parametro: setting.parametro,
						valor: setting.valor === 1 ? true : false,
						descricao: setting.descricao
					};
				});
			}).catch(function() {
				controller.feed('error', 'Erro ao buscar as configurações de e-mail.');
			});
		}

		function salvarEmailSettings() {
			var payload = vm.emailSettings.map(function(setting) {
				return {
					parametro: setting.parametro,
					valor: setting.valor ? '1' : '0'
				};
			});

			dataservice.atualizarEmailSettings(payload).then(function() {
				controller.feed('success', 'Configurações de e-mail salvas com sucesso!');
			}).catch(function(error) {
				controller.feedMessage(error);
			});
		}


		function evtChangeEmailSetting(opcao){
			salvarEmailSettings();
		}

	}

})();