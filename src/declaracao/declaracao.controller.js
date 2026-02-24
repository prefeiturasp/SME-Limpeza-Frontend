(function () {

  'use strict';

  angular
    .module('app.declaracao')
    .controller('DeclaracaoLista', DeclaracaoLista);

  DeclaracaoLista.$inject = ['$scope', '$rootScope', 'controller', 'DeclaracaoRest', 'tabela',
    '$uibModal', 'UnidadeEscolarUtils', 'moment', 'ConfiguracaoUtils'];

  function DeclaracaoLista($scope, $rootScope, controller, dataservice, tabela,
    $uibModal, UnidadeEscolarUtils, moment, ConfiguracaoUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.filtros = {};
    vm.instancia = {};
    vm.tabela = {};

    vm.optionsDatePickerFiltro = {
      minMode: 'day',
      maxDate: moment()
    };

    vm.optionsDatePickerForm = {
      minMode: 'day',
      maxDate: moment(),
      minDate: moment()
    };

    vm.abrirModal = abrirModal;
    vm.fecharModal = fecharModal;
    vm.salvar = salvar;
    vm.recarregarTabela = recarregarTabela;

    iniciar();

    function iniciar() {
      vm.filtros.dataInicial = new Date();
      vm.filtros.dataFinal = new Date();
      carregarConfiguracao();
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

    function carregarConfiguracao() {
      ConfiguracaoUtils.buscar('DIAS_RET_DECLARACAO').then(response => {
        let minDate = moment();
        for (let d = 0; d < response.objeto.valor; d++) {
          minDate = minDate.subtract(1, 'days');
          while (minDate.isoWeekday() === 6 || minDate.isoWeekday() === 7) {
            minDate = minDate.subtract(1, 'days');
          }
        }
        vm.optionsDatePickerForm.minDate = minDate;
      }).catch(error => {
        controller.feed('error', 'Hove um erro ao buscar as configurações.');
      });
    }

    function montarTabela() {

      criarOpcoesTabela();

      function criarColunasTabela() {

        var colunas = [
          { data: 'data', title: 'Data', renderWith: tabela.formatarData },
          { data: 'flagFiscalizado', title: 'Declarado', renderWith: tabela.booleanParaBadgeSimNao },
        ];

        if ($rootScope.usuario.usuarioOrigem.codigo !== 'ue') {
          colunas.push({
            data: 'unidadeEscolar', title: 'Unidade Escolar', renderWith: tabela.formatarUnidadeEscolar
          });
        }

        colunas.push({ data: 'nomeFiscal', title: 'Nome do Fiscal', renderWith: tabela.substituirValorNulo });
        colunas.push({ data: 'dataHoraCadastro', title: 'Data/Hora Registro', renderWith: tabela.formatarDataHora });
        vm.tabela.colunas = tabela.adicionarColunas(colunas);

      }

      function criarOpcoesTabela() {

        vm.tabela.opcoes = tabela.criarTabela(ajax, vm, null, 'data');
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

      }

    }

    function salvar(formulario) {

      if (formulario.$invalid) {
        return;
      }

      dataservice.inserir(vm.modal.model).then(success).catch(error);

      function success(response) {
        controller.feed('success', 'Declaração salva com sucesso.');
        tabela.recarregarDados(vm.instancia);
        fecharModal();
      }

      function error(response) {
        controller.feed('error', 'Houve um erro ao salvar sua declaração.');
        controller.feedMessage(response);
      }

    }

    function abrirModal(declaracao) {

      vm.modal = $uibModal.open({
        templateUrl: 'src/declaracao/declaracao-form.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });

      vm.modal.model = angular.isDefined(declaracao) ? angular.copy(declaracao) : {};
      vm.modal.model.data = vm.modal.model.data ? new Date(moment(vm.modal.model.data).format('YYYY-MM-DD') + 'T00:00:00') : new Date();

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