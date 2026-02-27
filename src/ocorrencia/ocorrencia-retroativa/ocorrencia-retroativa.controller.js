(function () {

  'use strict';
  
  angular.module('ocorrencia.ocorrencia-retroativa').controller('OcorrenciaRetroativa', OcorrenciaRetroativa);

  OcorrenciaRetroativa.$inject = ['$rootScope', '$scope', '$window', '$location', 'controller', 'OcorrenciaRest', 'tabela', '$uibModal', 
    'UnidadeEscolarUtils', 'PrestadorServicoUtils', 'SweetAlert', 'ContratoUtils',  'OcorrenciaRetroativaUtils', 'ConfiguracaoUtils'];

  function OcorrenciaRetroativa($rootScope, $scope, $window, $location, controller, OcorrenciaRest, tabela, $uibModal, UnidadeEscolarUtils, 
    PrestadorServicoUtils, SweetAlert, ContratoUtils,  OcorrenciaRetroativaUtils, ConfiguracaoUtils) {
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

    vm.abrirModalFormEdicaoOcorrenciaRetroativa = abrirModalFormEdicaoOcorrenciaRetroativa;
    vm.fecharModalFormEdicaoOcorrenciaRetroativa = fecharModalFormEdicaoOcorrenciaRetroativa;

    vm.edicaoOcorrenciaRetroativa = edicaoOcorrenciaRetroativa;

    iniciar();

    vm.qtdDiasRetOcorrencia = 0;

    vm.contratoList = [];
    vm.unidadeEscolarList = [];
    vm.unidadeEscolarListFiltered = [];
    vm.evtChangeContrato = evtChangeContrato;
    vm.salvarOcorrenciaRetroativa = salvarOcorrenciaRetroativa;

    vm.retornaStatusOcorrenciaRetroativa = retornaStatusOcorrenciaRetroativa;


    function iniciar() {
      retornaQtdRetOcorrencia();
      carregarComboUnidadeEscolar();
      carregarComboContrato();
      montarTabela();
    }

    setTimeout(function(){
      iniciaVerificacaoDatas();
    }, 1000);

    function iniciaVerificacaoDatas() {

      // Restringe datas ao mês atual
      vm.datepickerOptions = {
        minMode: 'day',
        minDate: moment().startOf('month').toDate(),
        maxDate: retornaDataDatePicker(moment().format('DD/MM/YYYY 00:00'))
      };

      var dataInicial = retornaDataDatePicker(moment().format('DD/MM/YYYY 08:00'));
      var dataFinal = retornaDataDatePicker(moment().format('DD/MM/YYYY 18:00'));
      //FORMULÁRIO DE OCORRÊNCIA RETROATIVA
      vm.model = {
        contratoList: [],
        unidadeEscolarList: [],
        dataInicial: dataInicial,
        dataFinal: dataFinal,
        motivo: ''
      };
    }

    function retornaQtdRetOcorrencia() {
      // Busca a quantidade de dias permitidos para o cadastro de ocorrência não retroativa
      ConfiguracaoUtils.buscar('DIAS_RET_OCORRENCIA').then(success).catch(error);
      function success(response) { 
        vm.qtdDiasRetOcorrencia = response.objeto.valor;
       }
      function error(response) { 
        console.log(response);
      }
    }

    function retornaDataDatePicker(strData) {
      let qtdDias = vm.qtdDiasRetOcorrencia;
      const [data, hora] = strData.split(' ');
      const [dia, mes, ano] = data.split('/');
      const [horas, minutos] = hora.split(':');
      const dataObj = new Date(ano, mes - 1, dia - (qtdDias+1), horas, minutos);
      return dataObj;
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

        colunas.push( { data: 'dataHoraCriacao', title: 'Data/Hora Ocorrência', width: 4, renderWith: tabela.formatarDataHora});

        colunas.push( { data: 'codigo', title: 'Contrato', width: 4 });

        colunas.push( { data: 'descricao', title: 'Unidade Escolar', width: 10});

        colunas.push( { data: 'dataInicial', title: 'Data Inicial', width: 8, renderWith: tabela.formatarDataHora });

        colunas.push( { data: 'dataFinal', title: 'Data Final', width: 8, renderWith: tabela.formatarDataHora });

        colunas.push( { data: 'statusOcorrenciaRetroativa', title: 'Status', width: 4, renderWith: tabela.formatarStatusContratoRetroativo });

        colunas.push( { data: 'id', title: 'Ações', width: 6, renderWith: tabela.criarBotoesTabOcorrenciaRetroativa});

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
      
          if(aData.statusOcorrenciaRetroativa == 'A'){
            $('.editar', nRow).off('click');
            $('.editar', nRow).on('click', () => {
              abrirModalFormEdicaoOcorrenciaRetroativa(aData);
            });
          } else {
            $('.editar', nRow).hide();
          }

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
        vm.detalhesOcorrenciaRetroativa = response.data;
      }).catch(function() {
        controller.feed('error', 'Erro ao carregar os detalhes da ocorrência retroativa.');
      });

    }

    function abrirModalFormEdicaoOcorrenciaRetroativa(dados) {

      vm.modal = $uibModal.open({
        templateUrl: 'src/ocorrencia/ocorrencia-retroativa/ocorrencia-retroativa-form-edit.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });

      OcorrenciaRetroativaUtils.buscaDetalhesOcorrenciaRetroativa(dados.idOcorrenciaRetroativa).then(function (response) {
        var resp = response.data;
        vm.modelEdit = {
          dre: resp[0].dre,
          codigo: resp[0].codigo,
          descricao: resp[0].descricao,
          dataInicial: new Date(resp[0].dataInicial),
          dataFinal: new Date(resp[0].dataFinal),
          quantidadeOcorrencias: resp[0].qtdOcorrenciasPermitidas,
          motivo: resp[0].motivo,
          idOcorrenciaRetroativa: dados.idOcorrenciaRetroativa
        };
      }).catch(function() {
        controller.feed('error', 'Erro ao carregar os dados da ocorrência retroativa para a edição.');
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

    function fecharModalFormEdicaoOcorrenciaRetroativa() {
      vm.modal.close();
      delete vm.modal;
    }

    function recarregarTabela() {
      tabela.recarregarDados(vm.instancia);
    }

    function remover(ocorrenciaRetroativa) {
      
      if ($rootScope.usuario.usuarioOrigem.codigo !== 'sme' && !$rootScope.usuario.flagFiscal) {
        return;
      }
   
      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Você irá excluir a ocorrência retroativa da unidade\n"+ocorrenciaRetroativa.descricao+"!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3F51B5',
        cancelButtonColor: '#FF4081',
        confirmButtonText: "Remover",
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (isConfirm) {
          OcorrenciaRetroativaUtils.removerOcorrenciaRetroativa(ocorrenciaRetroativa.idOcorrenciaRetroativa).then(success).catch(error);
        }
      });

      function success(response) {
        controller.feed('success', 'Ocorrência Retroativa removida com sucesso.');
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
        let newArrUes = [];
        vm.unidadeEscolarListFiltered.forEach(function (ue) {
          vm.contratoList.forEach(function (c) {
            if (c.id === ue.idContrato) {
                newArrUes.push({
                  id: ue.id,
                  idContrato: ue.idContrato,
                  descricao: ue.descricao,
                  contrato: c.descricao,
                  codigo: ue.codigo,
                  tipo: ue.tipo
                });
            }
          });
        });
        vm.unidadeEscolarListFiltered = newArrUes;
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
        motivo: vm.model.motivo,
        quantidadeOcorrencias: vm.model.quantidadeOcorrencias
      };

      var idsUes = { idsUnidadeEscolarList: vm.model.unidadeEscolarList.map(function (c) { return c.id; }) };

      OcorrenciaRetroativaUtils.buscaOcorrenciaRetroativaAbertaUE(idsUes).then(function (response) {
        let arrIds = response.data;
        
        arrIds.forEach(element => {
            dados.unidadeEscolarList.forEach(ue => {
                if (element.idUnidadeEscolar === ue.id) {
                  dados.unidadeEscolarList.splice(ue, 1);
                  return controller.feed('warning', 'Já existe uma ocorrência retroativa aberta para a unidade escolar: <strong>'+element.descricao+'</strong>. Por favor, edite-a ou remova para cadastrar uma nova.', 10000);
                } 
            });
        });

        if (dados.unidadeEscolarList.length >= 1) {
          
          OcorrenciaRetroativaUtils.cadastrarOcorrenciaRetroativa(dados).then(success).catch(error);

          function success(response) {
            controller.feed('success', 'Ocorrência(s) retroativa(s) salva(s) com sucesso.');
            recarregarTabela();
            fecharModalOcorrenciaRetroativa();
          }

          function error(response) {
            controller.feedMessage(response);
          }

        } else {
          fecharModalOcorrenciaRetroativa();
        }
        
      }).catch(()=>{
        console.log('erro');
      });
      
    }

    function edicaoOcorrenciaRetroativa(formulario) {
      
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
        idOcorrenciaRetroativa: vm.modelEdit.idOcorrenciaRetroativa,
        dataInicial: moment(vm.modelEdit.dataInicial).format('YYYY-MM-DD HH:mm'),
        dataFinal: moment(vm.modelEdit.dataFinal).format('YYYY-MM-DD HH:mm'),
        motivo: vm.modelEdit.motivo,
        quantidadeOcorrencias: vm.modelEdit.quantidadeOcorrencias
      };
      
      OcorrenciaRetroativaUtils.editarOcorrenciaRetroativa(dados).then(success).catch(error);

      function success(response) {
        controller.feed('success', 'Ocorrência(s) retroativa(s) salva(s) com sucesso.');
        recarregarTabela();
        fecharModalFormEdicaoOcorrenciaRetroativa();
      }

      function error(response) {
        controller.feedMessage(response);
      }
        
    }

    function retornaStatusOcorrenciaRetroativa(status) {
      return tabela.formatarStatusContratoRetroativo(status);
    }

  }

})();