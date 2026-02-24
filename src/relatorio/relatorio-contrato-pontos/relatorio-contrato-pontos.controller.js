(() => {

  'use strict';

  angular
    .module('relatorio.relatorio-contrato-pontos')
    .controller('RelatorioContratoPontosController', RelatorioContratoPontosController);

  RelatorioContratoPontosController.$inject = ['$rootScope', '$scope', '$location', 'controller', 'RelatorioContratoPontosRest', 'tabela', 'UnidadeEscolarUtils',
    'PrestadorServicoUtils', 'ContratoUtils'];

  function RelatorioContratoPontosController($rootScope, $scope, $location, controller, dataservice, tabela, UnidadeEscolarUtils,
    PrestadorServicoUtils, ContratoUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.instancia = {};
    vm.tabela = {};
    vm.filtros = vm.filtros || {};
    vm.formatarPercentual = formatarPercentual;
    vm.formatarDecimal = formatarDecimal;
    vm.recarregarTabela = recarregarTabela;
    vm.anosReferencia = [];

    iniciar();

    function iniciar() {
      vm.anosReferencia = gerarUltimos15Anos();
      vm.filtros.anoReferencia = vm.filtros.anoReferencia || new Date().getFullYear();

      carregarComboUnidadeEscolar();
      carregarComboTodosPrestadorServico();
      carregarComboContrato();
      montarTabela();
    }

    function montarTabela() {

      criarOpcoesTabela();

      function criarColunasTabela() {

        const colunas = [
          {
            data: '', title: 'Contrato', renderWith: (v1, v2, data) =>
              `
							<h5 style="font-weight: 100">${data.contrato.codigo}</h5>
							<small>${data.contrato.descricao}</small>
						`
          },
          {
            data: 'prestadorServico', title: 'Prestador de Serviço', renderWith: tabela.formatarPrestadorServico
          },
          {
            data: 'status', title: 'Status', renderWith: tabela.booleanParaBadgeAtivoEncerrado
          },
          {
            data: 'ano', title: 'Ano'
          },
          {
            data: '', title: 'Ação', width: 15, cssClass: 'text-right', renderWith: () =>
              `<button class="btn btn-outline-primary btn-sm visualizar" title="Visualizar"><i class="icon-eye"></i></button>`
          }
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

        function rowCallback(nRow, aData) {

          $('.visualizar', nRow).off('click');
          $('.visualizar', nRow).on('click', () =>
            $rootScope.$evalAsync(() =>
              $location.path(`/relatorio/contrato-pontos/${aData.idContrato}`))
          );

        }

      }

    }

    function carregarComboUnidadeEscolar() {

      UnidadeEscolarUtils.carregarComboTodos().then(success).catch(error);

      function success(response) {
        vm.unidadeEscolarList = response.objeto;
      }

      function error(response) {
        vm.unidadeEscolarLista = [];
        controller.feed('error', 'Erro ao buscar combo de unidades escolares.');
      }

    }

    function carregarComboTodosPrestadorServico() {

      PrestadorServicoUtils.carregarComboTodos().then(success).catch(error);

      function success(response) {
        vm.prestadorServicoList = response.objeto;
      }

      function error(response) {
        controller.feed('error', 'Erro ao buscar combo de prestadores.');
        vm.prestadorServicoTodosList = [];
      }

    }

    function carregarComboContrato() {

      ContratoUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.contratoLista = response.objeto;
      }

      function error(response) {
        vm.contratoLista = [];
        controller.feed('error', 'Erro ao buscar combo de contratos.');
      }

    }

    function recarregarTabela() {
      tabela.recarregarDados(vm.instancia);
    }

    function formatarPercentual(value) {

      if (value === null || value === undefined) {
        return ' - ';
      }

      return formatarDecimal(value) + '%';

    }

    function formatarDecimal(value) {

      if (value === null || value === undefined) {
        return ' - ';
      }

      return parseFloat(value).toFixed(2);

    }

    function gerarUltimos15Anos() {
      var anos = [];
      var anoAtual = new Date().getFullYear();
      for (var i = 0; i < 15; i++) {
        anos.push(anoAtual - i);
      }
      return anos;
    }
  }

})();