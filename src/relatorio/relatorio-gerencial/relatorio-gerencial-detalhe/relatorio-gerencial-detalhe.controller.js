(function () {

  'use strict';

  angular
    .module('relatorio-gerencial.relatorio-gerencial-detalhe')
    .controller('RelatorioGerencialDetalheController', RelatorioGerencialDetalheController);

  RelatorioGerencialDetalheController.$inject = ['$rootScope', '$scope', 'controller', '$routeParams', '$uibModal', 'RelatorioGerencialRest',
    'SweetAlert', '$location'];

  function RelatorioGerencialDetalheController($rootScope, $scope, controller, $routeParams, $uibModal, dataservice,
    SweetAlert, $location) {
    /* jshint validthis: true */

    var vm = this;

    vm.abrirModalAvaliacao = abrirModalAvaliacao;
    vm.fecharModalAvaliacao = fecharModalAvaliacao;
    vm.avaliar = avaliar;
    vm.formatarPercentual = formatarPercentual;
    vm.formatarDecimal = formatarDecimal;
    vm.abrirModalOcorrencias = abrirModalOcorrencias;
    vm.fecharModalOcorrencias = fecharModalOcorrencias;
    vm.consolidar = consolidar;
    vm.desconsolidar = desconsolidar;
    vm.aprovar = aprovar;
    vm.reverterAprovacao = reverterAprovacao;

    iniciar();

    function iniciar() {

      vm.idRelatorioGerencial = $routeParams.id;

      if (!vm.idRelatorioGerencial) {
        redirecionarListagem();
      }

      buscar();

    }

    function buscar() {

      dataservice.buscar(vm.idRelatorioGerencial).then(success).catch(error);

      function success(response) {
        vm.dados = controller.ler(response, 'data');
      }

      function error(response) {
        controller.feedMessage(response);
        redirecionarListagem();
      }

    }

    function abrirModalAvaliacao(tipo, variavel) {

      if ($rootScope.usuario.usuarioOrigem.codigo !== 'sme' && !vm.dados.flagPodeFiscalizar) return;

      vm.modalAvaliacao = $uibModal.open({
        templateUrl: 'src/relatorio/relatorio-gerencial/relatorio-gerencial-detalhe/relatorio-gerencial-detalhe-form.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });

      vm.modalAvaliacao.variavel = variavel;

      vm.modalAvaliacao.model = {
        idOcorrenciaSituacao: variavel.situacao ? variavel.situacao.idOcorrenciaSituacao : null,
        idRelatorioGerencial: vm.idRelatorioGerencial,
        idOcorrenciaVariavel: variavel.idOcorrenciaVariavel,
        quantidadeOcorrencias: variavel.ocorrencias.length
      };
    }

    function fecharModalAvaliacao() {
      vm.modalAvaliacao.close();
      delete vm.modalAvaliacao;
    }

    function avaliar(idOcorrenciaSituacao) {

      vm.modalAvaliacao.model.idOcorrenciaSituacao = idOcorrenciaSituacao;

      dataservice.avaliar(vm.idRelatorioGerencial, vm.modalAvaliacao.model).then(success).catch(error);

      function success(response) {
        controller.feed('success', 'Relatório atualizado com sucesso.');
        buscar();
        fecharModalAvaliacao();
      }

      function error(response) {
        controller.feed('error', 'Erro ao atualizar relatório.');
        buscar();
      }

    }

    function consolidar() {

      if (!verificarPodeConsolidar()) {

        return SweetAlert.swal({
          title: "Oops!",
          text: "O relatório só pode ser consolidado após todas os itens serem avaliados.",
          type: "error",
          showCancelButton: false,
          confirmButtonColor: '#3F51B5',
          confirmButtonText: "Certo, entendi!",
          closeOnConfirm: true
        });

      }

      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Após consolidar, não será possível alterar as avaliações.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3F51B5',
        cancelButtonColor: '#FF4081',
        confirmButtonText: "Consolidar",
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (isConfirm) {
          dataservice.consolidar(vm.idRelatorioGerencial).then(() => {
            controller.feed('success', 'Relatório consolidado com sucesso.');
            buscar();
          }).catch((response) => {
            controller.feedMessage(response);
            buscar();
          });
        }
      });

    }

    function desconsolidar() {
      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Após desconsolidar, o relatório irá retornar para a Unidade Escolar para ajustes e nova consolidação!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3F51B5',
        cancelButtonColor: '#FF4081',
        confirmButtonText: 'Desconsolidar',
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (isConfirm) {
          dataservice.desconsolidar(vm.idRelatorioGerencial).then(() => {
            controller.feed('success', 'Relatório desconsolidado com sucesso.');
            buscar();
          }).catch(() => {
            controller.feedMessage(response);
            buscar();
          });
        }
      });
    }

    function verificarPodeConsolidar() {

      if (!vm.dados.flagPodeFiscalizar) return;

      if (vm.dados.contratoModelo === 2) {
        return true;
      }

      let podeConsolidar = true;
      angular.forEach(vm.dados.detalhe, function (tipo) {
        if (tipo.pontuacaoParcial == null || tipo.peso == null || tipo.pontuacaoFinal == null) {
          podeConsolidar = false;
        }
      });

      return podeConsolidar;

    }

    function aprovar() {

      if (!vm.dados.flagPodeAprovar) {
        return;
      }

      SweetAlert.swal({
        title: "Atenção!",
        text: "Tem certeza que deseja aprovar o relatório?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3F51B5',
        cancelButtonColor: '#FF4081',
        confirmButtonText: 'Aprovar',
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (isConfirm) {
          dataservice.aprovar(vm.idRelatorioGerencial).then(() => {
            controller.feed('success', 'Relatório aprovado com sucesso.');
            buscar();
          }).catch(() => {
            controller.feedMessage(response);
            buscar();
          });
        }
      });

    }

    function reverterAprovacao() {

      if (!vm.dados.flagPodeAprovar) {
        return;
      }

      SweetAlert.swal({
        title: "Atenção!",
        text: "Tem certeza que deseja prosseguir com a reversão da aprovação? O relatório ficará disponível para aprovação novamente.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3F51B5',
        cancelButtonColor: '#FF4081',
        confirmButtonText: 'Reverter Aprovação',
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (isConfirm) {
          dataservice.reverterAprovacao(vm.idRelatorioGerencial).then(() => {
            controller.feed('success', 'Aprovação revertida com sucesso.');
            buscar();
          }).catch(() => {
            controller.feedMessage(response);
            buscar();
          });
        }
      });

    }

    function redirecionarListagem() {
      $rootScope.$evalAsync(() => $location.path('relatorio/gerencial'));
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

    function abrirModalOcorrencias(ocorrencias) {

      if (!ocorrencias || ocorrencias.length == 0) return;

      vm.modalOcorrencias = $uibModal.open({
        templateUrl: 'src/relatorio/relatorio-gerencial/relatorio-gerencial-detalhe/relatorio-gerencial-detalhe-ocorrencia.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });

      vm.modalOcorrencias.ocorrencias = angular.copy(ocorrencias);

    }

    function fecharModalOcorrencias() {
      vm.modalOcorrencias.close();
      delete vm.modalOcorrencias;
    }

  }

})();