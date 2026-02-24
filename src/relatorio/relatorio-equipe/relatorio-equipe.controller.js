(() => {

  'use strict';

  angular
    .module('relatorio.relatorio-equipe')
    .controller('RelatorioEquipeController', RelatorioEquipeController);

  RelatorioEquipeController.$inject = ['$rootScope', '$location', 'controller', 'RelatorioEquipeRest', 'tabela', 'UnidadeEscolarUtils',
    'PrestadorServicoUtils', 'ContratoUtils'];

  function RelatorioEquipeController($rootScope, $location, controller, dataservice, tabela, UnidadeEscolarUtils,
    PrestadorServicoUtils, ContratoUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.filtros = {};
    vm.instancia = {};
    vm.tabela = {};

    vm.exportar = exportar;
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

        var colunas = [
          { data: '', title: 'Referência', renderWith: (v1, v2, data) => `${data.mes}/${data.ano}` }
        ];

        if ($rootScope.usuario.usuarioOrigem.codigo !== 'ue') {
          colunas.push({
            data: 'unidadeEscolar', title: 'Unidade Escolar', renderWith: tabela.formatarUnidadeEscolar
          });
        }

        if ($rootScope.usuario.usuarioOrigem.codigo !== 'ps') {
          colunas.push({
            data: 'prestadorServico', title: 'Prestador de Serviço', renderWith: tabela.formatarPrestadorServico
          });
        }

        colunas.push({
          data: 'quantidadeContratadaMensal', title: 'Qtd. Contratada Mensal', cssClass: 'text-right', renderWith: (v1, v2, data) => `
          <span title=" = ${data.quantidadeContratada} * 21.74">${parseFloat(Math.abs(v1), 10).toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        ` });

        colunas.push({ data: 'quantidadeAusente', title: 'Qtd. Ausente', cssClass: 'text-right', renderWith: tabela.formatarNumero });

        colunas.push({
          data: 'percentualAusencia', title: '% Ausente', cssClass: 'text-right', renderWith: (v1, v2, data) => `
          <span class="${data.classePercentualAusencia} text-bold">${parseFloat(v1).toFixed(3)}%</span>
        ` });

        colunas.push({ data: 'percentualMulta', title: '% Multa', cssClass: 'text-right', renderWith: (value) => parseFloat(value).toFixed(1) + '%' });

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
            $rootScope.$evalAsync(() => $location.path('/relatorio/gerencial/detalhe/' + aData.id))
          });
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
        a.download = `relatorio-multa-equipe-${moment().format('DDMMyyyyHHmmss')}.csv`;
        a.click();
      }

      function error(response) {
        controller.feed('error', 'Houve um erro ao exportar o relatório.');
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

  }

})();