(() => {

  'use strict';

  angular
    .module('relatorio.relatorio-contrato')
    .controller('RelatorioContratoController', RelatorioContratoController);

  RelatorioContratoController.$inject = ['$rootScope', '$location', 'controller', 'RelatorioContratoRest', 'tabela', 'UnidadeEscolarUtils',
    'PrestadorServicoUtils', 'ContratoUtils'];

  function RelatorioContratoController($rootScope, $location, controller, dataservice, tabela, UnidadeEscolarUtils,
    PrestadorServicoUtils, ContratoUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.filtros = {};
    vm.instancia = {};
    vm.tabela = {};

    vm.formatarPercentual = formatarPercentual;
    vm.formatarDecimal = formatarDecimal;
    vm.recarregarTabela = recarregarTabela;

    iniciar();

    function iniciar() {
      carregarComboUnidadeEscolar();
      carregarComboTodosPrestadorServico();
      carregarComboContrato();
      carregarCombosDatas();
      montarTabela();
    }

    function montarTabela() {

      criarOpcoesTabela();

      function criarColunasTabela() {

        const colunas = [
          {
            data: '', title: 'Referência', renderWith: (v1, v2, data) =>
              `${data.mes}/${data.ano}`
          },
          {
            data: '', title: 'Contrato', renderWith: (v1, v2, data) =>
              `
							<h5 style="font-weight: 100">${data.contrato.codigo}</h5>
							<small>${data.contrato.descricao}</small>
						`
          },
          { data: 'prestadorServico', title: 'Prestador de Serviço', renderWith: tabela.formatarPrestadorServico },
          { data: 'valorTotal', title: 'Valor Contrato', cssClass: 'text-right', renderWith: tabela.formatarValorMonetario },
          { data: 'valorLiquido', title: 'Valor Líquido', cssClass: 'text-right', renderWith: tabela.formatarValorMonetario },
          {
            data: '', title: 'Ação', width: 15, cssClass: 'text-right', renderWith: (v1, v2, data) =>
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
              $location.path(`/relatorio/contrato/detalhe/`).search({
                ano: aData.ano,
                mes: aData.mes,
                idContrato: aData.idContrato,
                idPrestadorServico: aData.idPrestadorServico,
              }))
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

    function carregarCombosDatas() {

      vm.mesList = [
        { mes: 1, descricao: 'Janeiro' },
        { mes: 2, descricao: 'Fevereiro' },
        { mes: 3, descricao: 'Março' },
        { mes: 4, descricao: 'Abril' },
        { mes: 5, descricao: 'Maio' },
        { mes: 6, descricao: 'Junho' },
        { mes: 7, descricao: 'Julho' },
        { mes: 8, descricao: 'Agosto' },
        { mes: 9, descricao: 'Setembro' },
        { mes: 10, descricao: 'Outubro' },
        { mes: 11, descricao: 'Novembro' },
        { mes: 12, descricao: 'Dezembro' }
      ];

      vm.anoList = [];

      let anoAtual = 2020;
      while (anoAtual <= moment().format('YYYY')) {
        vm.anoList.push(anoAtual);
        anoAtual++;
      }

      vm.anoList.sort((a, b) => b - a);
      const dataAnterior = moment().subtract(1, 'months');
      vm.filtros.mes = parseInt(dataAnterior.format('MM'));
      vm.filtros.ano = parseInt(dataAnterior.format('YYYY'));

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

  }

})();