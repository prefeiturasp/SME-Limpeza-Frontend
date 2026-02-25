(function () {

  'use strict';

  angular
    .module('app.ocorrencia')
    .controller('OcorrenciaLista', OcorrenciaLista);

  OcorrenciaLista.$inject = ['$rootScope', '$window', '$location', 'controller', 'OcorrenciaRest', 'tabela', '$uibModal',
    'OcorrenciaTipoUtils', 'UnidadeEscolarUtils', 'PrestadorServicoUtils', 'SweetAlert', 'ContratoUtils'];

  function OcorrenciaLista($rootScope, $window, $location, controller, dataservice, tabela, $uibModal,
    OcorrenciaTipoUtils, UnidadeEscolarUtils, PrestadorServicoUtils, SweetAlert, ContratoUtils) {
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
    vm.abrirModal = abrirModal;
    vm.fecharModal = fecharModal;
    vm.exportar = exportar;

    iniciar();

    function iniciar() {
      vm.filtros.dataInicial = new Date(moment().subtract(7, 'days'));
      vm.filtros.dataFinal = new Date();
      vm.filtros.flagSomenteAtivos = 'true';
      carregarComboTipoOcorrencia();
      carregarComboPrestadorServico();
      carregarComboUnidadeEscolar();
      carregarComboContrato();
      montarTabela();
    }

    function carregarComboTipoOcorrencia() {

      OcorrenciaTipoUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.idOcorrenciaTipoList = response.objeto;
      }

      function error(response) {
        vm.idOcorrenciaTipoLista = [];
        controller.feed('error', 'Erro ao buscar combo de tipos de ocorrência.');
      }

    }

    function carregarComboPrestadorServico() {

      PrestadorServicoUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.prestadorServicoList = response.objeto;
      }

      function error(response) {
        controller.feed('error', 'Erro ao buscar combo de prestadores.');
        vm.prestadorServicoList = [];
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

        var colunas = [
          { data: 'id', title: 'ID', width: 4 },
        ];

        colunas.push({ data: 'dataHoraCadastro', title: 'Data/Hora Cadastro', width: 8, cssClass: 'text-right', renderWith: tabela.formatarDataHora });

        colunas.push({ data: 'contrato', title: 'Contrato', width: 8, renderWith: tabela.formatarContrato });

        if ($rootScope.usuario.usuarioOrigem.codigo !== 'ps') {
          colunas.push({
            data: 'prestadorServico', title: 'Prestador de Serviço', width: 13, renderWith: tabela.formatarPrestadorServico
          });
        }

        if ($rootScope.usuario.usuarioOrigem.codigo !== 'ue') {
          colunas.push({
            data: 'unidadeEscolar', title: 'Unidade Escolar', width: 13, renderWith: tabela.formatarUnidadeEscolar
          });
        }

        colunas.push( { data: 'data', title: 'Data/Hora Ocorrência', width: 8, renderWith: tabela.formatarDataHora });

        colunas.push( { data: 'tipo', title: 'Tipo da Ocorrência', width: 10 });

        colunas.push({
          data: 'flagEncerrado',
          title: 'Encerrado',
          width: 10,
          cssClass: 'text-right',
          renderWith: (data, type, full, meta) => {
            if (full && full.flagEncerramentoAutomatico) {
              return tabela.encerradoAutomaticamente;
            }
            return tabela.booleanParaBadgeSimNao(data);
          }
        });

        colunas.push({
          data: null,
          title: 'Atendido',
          width: 8,
          cssClass: 'text-right',
          renderWith: function (row /*, type, full, meta */) {
            const mostrarSim = row.flagEncerrado && !row.flagGerarDesconto;
            return tabela.booleanParaBadgeSimNao(mostrarSim);
          }
        });

        colunas.push({
          data: null,
          title: 'Respondido',
          width: 8,
          cssClass: 'text-right',
          renderWith: function (row /*, type, full, meta */) {
            const mostrarSim = !!row.ocorrenciaRespondida;
            return tabela.booleanParaBadgeSimNao(mostrarSim);
          }
        });

        colunas.push({
          data: 'id', title: 'Ações', width: 15, cssClass: 'text-right', renderWith: (var1, var2, data) => `
						${!data.flagEncerrado && $rootScope.usuario.flagFiscal ? '<button class="mr-1 btn btn-outline-danger btn-sm encerrar" title="Encerrar"><i class="icon-close"></i></button>' : ''}
						${($rootScope.usuario.flagFiscal || $rootScope.usuario.usuarioOrigem.codigo === 'dre') ? '<button class="mr-1 btn btn-outline-danger btn-sm remover" title="Remover"><i class="icon-trash"></i></button>' : ''}
						<button class="btn btn-outline-primary btn-sm visualizar" title="Visualizar"><i class="icon-eye"></i></button>
					`
        });

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

          $('.encerrar', nRow).off('click');
          $('.encerrar', nRow).on('click', () => $window.open(`ocorrencia/detalhe/${aData.id}?encerrar=true`, '_blank'));

          $('.visualizar', nRow).off('click');
          $('.visualizar', nRow).on('click', () => $window.open(`ocorrencia/detalhe/${aData.id}`, '_blank'));

          $('.remover', nRow).off('click');
          $('.remover', nRow).on('click', () => remover(aData));

        }

      }

    }

    function abrirModal(id, ocorrencia) {

      if (!$rootScope.usuario.flagFiscal) {
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
        a.download = `ocorrencias-${moment().format('DDMMyyyyHHmmss')}.csv`;
        a.click();
      }

      function error(response) {
        controller.feed('error', 'Houve um erro ao exportar o relatório.');
      }

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
          dataservice.remover(ocorrencia.id).then(success).catch(error);
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

  }

})();