(function () {

  'use strict';

  angular
    .module('relatorio.relatorio-ocorrencia-funcionario')
    .controller('RelatorioOcorrenciaFuncionarioController', RelatorioOcorrenciaFuncionarioController);

  RelatorioOcorrenciaFuncionarioController.$inject = ['controller', 'RelatorioOcorrenciaFuncionarioRest', 'tabela', 'UnidadeEscolarUtils', '$window'];

  function RelatorioOcorrenciaFuncionarioController(controller, dataservice, tabela, UnidadeEscolarUtils, $window) {
    /* jshint validthis: true */

    var vm = this;

    vm.filtros = {};
    vm.instancia = {};
    vm.tabela = {};

    vm.optionsDatePickerFiltro = {
      minMode: 'day',
      maxDate: moment()
    };

    vm.recarregarTabela = recarregarTabela;

    iniciar();

    function iniciar() {
      vm.filtros.dataInicial = new Date();
      vm.filtros.dataFinal = new Date();
      carregarComboUnidadeEscolar();
      montarTabela();
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

    function montarTabela() {

      criarOpcoesTabela();

      function criarColunasTabela() {

        var colunas = [
          { data: 'data', title: 'Data/Hora da Ocorrência', renderWith: tabela.formatarDataHora },
          {
            data: '', title: 'Unidade Escolar', renderWith: (var1, var2, data) => `
							<h5 style="font-weight: 100">${data.unidadeEscolar.descricao}</h5>
							<small>${data.unidadeEscolar.endereco}</small>
						`
          },
          { data: 'cargo', title: 'Cargo' },
          { data: 'quantidadeContratada', title: 'Quant. Contratada', cssClass: 'text-right' },
          { data: 'quantidadePresente', title: 'Quant. Presente', cssClass: 'text-right' },
          { data: 'quantidadeAusente', title: 'Quant. Ausente', cssClass: 'text-right' },
          { data: 'valor', title: 'Valor Total', cssClass: 'text-right', renderWith: tabela.formatarValorMonetario },
          {
            data: 'idOcorrencia', title: 'Ações', width: 8, cssClass: 'text-right', renderWith: (var1, var2, data) => `
              <button class="btn btn-outline-primary btn-sm visualizar" title="Visualizar"><i class="icon-eye"></i></button>
            `
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

        function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {

          $('.visualizar', nRow).off('click');
          $('.visualizar', nRow).on('click', () => $window.open(`ocorrencia/detalhe/${aData.idOcorrencia}`, '_blank'));

        }

      }
    }

    function recarregarTabela() {
      tabela.recarregarDados(vm.instancia);
    }

  }

})();