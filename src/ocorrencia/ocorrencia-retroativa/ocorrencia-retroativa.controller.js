(function () {

  'use strict';
  
  angular.module('ocorrencia.ocorrencia-retroativa').controller('OcorrenciaRetroativa', OcorrenciaRetroativa);

  OcorrenciaRetroativa.$inject = ['$rootScope', '$scope', '$window', '$location', 'controller', 'OcorrenciaRest', 'tabela', '$uibModal', 
    'UnidadeEscolarUtils', 'PrestadorServicoUtils', 'SweetAlert', 'ContratoUtils',  'OcorrenciaRetroativaUtils'];

  function OcorrenciaRetroativa($rootScope, $scope, $window, $location, controller, OcorrenciaRest, tabela, $uibModal, UnidadeEscolarUtils, 
    PrestadorServicoUtils, SweetAlert, ContratoUtils,  OcorrenciaRetroativaUtils) {
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
    vm.abrirModalOcorrenciaRetroativa = abrirModalOcorrenciaRetroativa;
    vm.fecharModalOcorrenciaRetroativa = fecharModalOcorrenciaRetroativa;
    vm.abrirModalDetalhesOcorrenciaRetroativa = abrirModalDetalhesOcorrenciaRetroativa;
    vm.fechaModalDetalhesOcorrenciaRetroativa = fechaModalDetalhesOcorrenciaRetroativa;

    //FORMULÁRIO DE OCORRÊNCIA RETROATIVA
    vm.model = {
      contratoList: [],
      unidadeEscolarList: [],
      dataInicial: new Date(),
      dataFinal: new Date(),
      motivo: ''
    };

    vm.contratoList = [];
    vm.unidadeEscolarList = [];
    vm.unidadeEscolarListFiltered = [];
    vm.evtChangeContrato = evtChangeContrato;
    vm.salvarOcorrenciaRetroativa = salvarOcorrenciaRetroativa;

    vm.retornaStatusOcorrenciaRetroativa = retornaStatusOcorrenciaRetroativa;



    // Restringe datas ao mês atual
    vm.datepickerOptions = {
      minMode: 'day',
      minDate: moment().startOf('month').toDate(),
      maxDate: moment().endOf('month').toDate()
    };


    iniciar();

    function iniciar() {
      carregarComboUnidadeEscolar();
      carregarComboContrato();
      montarTabela();
    }


    function carregarComboUnidadeEscolar() {

      UnidadeEscolarUtils.carregarComboTodos().then(success).catch(error);

      function success(response) {
        vm.unidadeEscolarList = response.objeto;
      }

      function error(response) {
        vm.unidadeEscolarList = [];
        controller.feed('error', 'Erro ao buscar combo de unidades escolares.');
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

    function montarTabela() {

      criarOpcoesTabela();

      function criarColunasTabela() {

        var colunas = [];

        colunas.push( { data: 'dataHoraCriacao', title: 'Data/Hora Ocorrência', width: 6, renderWith: tabela.formatarDataHora});

        colunas.push({ data: 'codigo', title: 'Contrato', width: 6 });

        colunas.push({data: 'descricao', title: 'Unidade Escolar', width: 14});


        colunas.push( { data: 'dataInicial', title: 'Data Inicial', width: 8, renderWith: tabela.formatarDataHora });

        colunas.push( { data: 'dataFinal', title: 'Data Final', width: 8, renderWith: tabela.formatarDataHora });

        colunas.push( { data: 'statusOcorrenciaRetroativa', title: 'Status', width: 6, renderWith: tabela.formatarStatusContratoRetroativo });

        colunas.push({
          data: 'id', title: 'Ações', width: 6, renderWith: tabela.criarBotoesTabOcorrenciaRetroativa});

        vm.tabela.colunas = tabela.adicionarColunas(colunas);

      }

      function criarOpcoesTabela() {

        vm.tabela.opcoes = tabela.criarTabela(ajax, vm, null, 'data');
        vm.tabela.opcoes.withOption('rowCallback', rowCallback);
        criarColunasTabela();

        function ajax(data, callback, settings) {

          OcorrenciaRetroativaUtils.tabela(tabela.criarParametros(data, vm.filtros)).then(success).catch(error);

          function success(response) {
            callback(controller.lerRetornoDatatable(response));
          }

          function error(response) {
            callback(tabela.vazia());
          }

        }

        function rowCallback(nRow, aData) {

          $('.encerrar', nRow).off('click');
          $('.encerrar', nRow).on('click', () => $window.open(`ocorrencia/detalhe/${aData.id}?encerrar=true`, '_blank'));

          $('.visualizar', nRow).off('click');
          $('.visualizar', nRow).on('click', () => {
            abrirModalDetalhesOcorrenciaRetroativa( aData );
          });

          $('.remover', nRow).off('click');
          $('.remover', nRow).on('click', () => remover(aData));

        }

      }

    }

    function abrirModalOcorrenciaRetroativa() {

      vm.modal = $uibModal.open({
        templateUrl: 'src/ocorrencia/ocorrencia-retroativa/ocorrencia-retroativa-form.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });
    
      iniciarForm();
    }

    function abrirModalDetalhesOcorrenciaRetroativa(dados) {

      vm.modal = $uibModal.open({
        templateUrl: 'src/ocorrencia/ocorrencia-retroativa/ocorrencia-retroativa-modal-detalhes.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });

      OcorrenciaRetroativaUtils.buscaDetalhesOcorrenciaRetroativa(dados.idOcorrenciaRetroativa).then(function (response) {
        vm.detalhesOcorrenciaRetroativa = response.data[0];
      }).catch(function() {
        controller.feed('error', 'Erro ao carregar os detalhes da ocorrência retroativa.');
      });

  
    }

    function fechaModalDetalhesOcorrenciaRetroativa() {
      vm.modal.close();
      delete vm.modal;
    }

    function fecharModalOcorrenciaRetroativa() {
      vm.modal.close();
      delete vm.modal;
    }

    function recarregarTabela() {
      tabela.recarregarDados(vm.instancia);
    }

    function remover(ocorrencia) {

      if ($rootScope.usuario.usuarioOrigem.codigo !== 'dre' && !$rootScope.usuario.flagFiscal) {
        return;
      }

      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Você não poderá desfazer essa ação!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3F51B5',
        cancelButtonColor: '#FF4081',
        confirmButtonText: "Remover",
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (isConfirm) {
          OcorrenciaRest.remover(ocorrencia.id).then(success).catch(error);
        }
      });

      function success(response) {
        controller.feed('success', 'Ocorrência removida com sucesso.');
        tabela.recarregarDados(vm.instancia);
      }

      function error(response) {
        controller.feedMessage(response);
      }

    }

    function iniciarForm() {
      carregarContratos();
      // Unidades escolares são carregadas dinamicamente após a seleção de um contrato.
      vm.model.unidadeEscolarList = [];
      vm.unidadeEscolarListFiltered = [];
    }

    function carregarContratos() {
      ContratoUtils.carregarCombo().then(function (response) {
        vm.contratoList = response.objeto;
      });
    }

    function evtChangeContrato() {
      vm.model.unidadeEscolarList = [];
      vm.unidadeEscolarListFiltered = [];

      if (!vm.model.contratoList || vm.model.contratoList.length === 0) {
        return;
      }

      var params = { idContratoList: vm.model.contratoList.map(function (c) { return c.id; }) };

      OcorrenciaRetroativaUtils.comboUesPorIdContrato(params).then(function (response) {
        vm.unidadeEscolarListFiltered = response.data || [];
      }).catch(function() {
        controller.feed('error', 'Erro ao carregar unidades escolares para o(s) contrato(s) selecionado(s).');
      });
    }


    function salvarOcorrenciaRetroativa(formulario) {
      if (formulario.$invalid) {
        return controller.feed('error', 'Verifique os campos obrigatórios.');
      }

      var start = moment(vm.model.dataInicial);
      var end = moment(vm.model.dataFinal);
      var now = moment();

      // Validação de Mês Atual
      if (!start.isSame(now, 'month') || !end.isSame(now, 'month')) {
        return controller.feed('error', 'O período deve estar dentro do mês atual.');
      }

      if (start.isAfter(end)) {
        return controller.feed('error', 'A data inicial deve ser anterior à data final.');
      }

      var dados = {
        contratoList: vm.model.contratoList.map(function (c) { return c.id; }),
        unidadeEscolarList: vm.model.unidadeEscolarList.map(function (u) { return {id:u.id, idContrato: u.idContrato}; }),
        dataInicial: moment(vm.model.dataInicial).format('YYYY-MM-DD HH:mm'),
        dataFinal: moment(vm.model.dataFinal).format('YYYY-MM-DD HH:mm'),
        motivo: vm.model.motivo
      };

      OcorrenciaRetroativaUtils.cadastrarOcorrenciaRetroativa(dados).then(success).catch(error);

      function success(response) {
        controller.feed('success', 'Ocorrência retroativa salva com sucesso.');
        recarregarTabela();
        fecharModalOcorrenciaRetroativa();
      }

      function error(response) {
        controller.feedMessage(response);
      }
    }

    function retornaStatusOcorrenciaRetroativa(status) {
      switch (status) {
        case 'A':
          return 'ATIVO';
        case 'I':
          return 'INATIVO';
      }
    }

  }

})();