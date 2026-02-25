(() => {

  'use strict';

  angular
    .module('relatorio-contrato.relatorio-contrato-detalhe')
    .controller('RelatorioContratoDetalheController', RelatorioContratoDetalheController);

  RelatorioContratoDetalheController.$inject = ['$scope', '$rootScope', '$location', 'controller', 'RelatorioContratoRest',
    'RelatorioGerencialUtils', '$uibModal', 'SweetAlert', 'ContratoUtils'];

  function RelatorioContratoDetalheController($scope, $rootScope, $location, controller, dataservice,
    RelatorioGerencialUtils, $uibModal, SweetAlert, ContratoUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.abrirModalValorBruto = abrirModalValorBruto;
    vm.fecharModal = fecharModal;
    vm.salvarValorBruto = salvarValorBruto;
    vm.removerRelatorioGerencial = removerRelatorioGerencial;
    vm.exportar = exportar;
    vm.abrirModalUE = abrirModalUE;
    vm.salvarUE = salvarUE;
    vm.irParaImportacaoValores = irParaImportacaoValores;
    vm.formatarPercentual = formatarPercentual;
    vm.formatarDecimal = formatarDecimal;
    vm.abrirModalProfissionaisFaltantes = abrirModalProfissionaisFaltantes;

    iniciar();

    function iniciar() {

      vm.model = $location.search();

      if (!vm.model.ano || !vm.model.mes || !vm.model.idContrato || !vm.model.idPrestadorServico) {
        redirecionarListagem();
      }

      buscar();

    }

    function buscar() {

      dataservice.buscar(vm.model).then(success).catch(error);

      function success(response) {
        vm.dados = controller.ler(response, 'data');
      }

      function error(response) {
        controller.feedMessage(response);
        redirecionarListagem();
      }

    }

    function abrirModalValorBruto(relatorioGerencial) {

      if ($rootScope.usuario.usuarioOrigem.codigo !== 'sme') {
        return;
      }

      if (!relatorioGerencial?.idRelatorioGerencial) {
        return;
      }

      vm.modal = $uibModal.open({
        templateUrl: 'src/relatorio/relatorio-contrato/relatorio-contrato-detalhe/relatorio-contrato-detalhe-form-valor-bruto.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'md',
        keyboard: false,
      });

      vm.modal.model = angular.copy(relatorioGerencial);
      vm.modal.model.novoValorBruto = angular.copy(vm.modal.model.valorBruto);

    }

    function fecharModal() {
      vm.modal?.close();
      delete vm.modal;
    }

    function salvarValorBruto(formulario) {

      if (formulario.$invalid) {
        return;
      }

      if (vm.modal.model.novoValorBruto < 0) {
        controller.feed('error', 'O valor não pode ser menor que zero.');
        return;
      }

      const idRelatorioGerencial = vm.modal.model.idRelatorioGerencial;

      RelatorioGerencialUtils.atualizarValorBruto(idRelatorioGerencial, vm.modal.model).then(success).catch(error);

      function success(response) {
        controller.feed('success', 'Valor atualizado com sucesso.');
        buscar();
        fecharModal();
      }

      function error(response) {
        controller.feed('error', 'Desculpe, houve um erro ao atualizar o valor.');
      }

    }

    function removerRelatorioGerencial(relatorioGerencial) {

      if ($rootScope.usuario.usuarioOrigem.codigo !== 'sme') {
        return;
      }

      if (!relatorioGerencial?.idRelatorioGerencial) {
        return;
      }

      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Você não poderá desfazer essa ação!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3f51b5',
        cancelButtonColor: '#ff4081',
        confirmButtonText: "Remover",
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (!isConfirm) return;
        RelatorioGerencialUtils.remover(relatorioGerencial.idRelatorioGerencial).then((response) => {
          controller.feed('success', 'Relatório removido com sucesso.');
          buscar();
        }).catch((error) => {
          controller.feed('error', 'Erro ao remover relatório.');
        });
      });

    }

    function exportar() {

      dataservice.exportar(vm.model).then(success).catch(error);

      function success(response) {
        const data = controller.ler(response, 'data');
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        const file = new Blob([data], { type: 'application/csv' });
        const fileUrl = window.URL.createObjectURL(file);
        a.href = fileUrl;
        a.download = `relatorio-${moment().format('DDMMyyyyHHmmss')}.csv`;
        a.click();
      }

      function error(response) {
        controller.feed('error', 'Houve um erro ao exportar o relatório.');
      }

    }

    function abrirModalUE() {

      if ($rootScope.usuario.usuarioOrigem.codigo !== 'sme') {
        return;
      }

      ContratoUtils.buscar(vm.model.idContrato).then((response) => {

        vm.modal = $uibModal.open({
          templateUrl: 'src/relatorio/relatorio-contrato/relatorio-contrato-detalhe/relatorio-contrato-detalhe-form-ue.html?' + new Date(),
          backdrop: 'static',
          scope: $scope,
          size: 'md',
          keyboard: false,
        });

        vm.modal.contrato = response.objeto;
        vm.modal.unidadeEscolarList = response.objeto.unidadeEscolarLista.filter((ue) => !vm.dados.relatorioList.some(r => r.unidadeEscolar.id === ue.id));

        vm.modal.model = {
          ano: vm.model.ano,
          mes: vm.model.mes,
          idContrato: vm.model.idContrato,
          idPrestadorServico: vm.model.idPrestadorServico
        }

      })

    }

    function salvarUE(formulario) {

      if (formulario.$invalid) {
        return;
      }

      RelatorioGerencialUtils.inserir(vm.modal.model).then(success).catch(error);

      function success(response) {
        controller.feed('success', 'Relatório criado com sucesso.');
        fecharModal();
        buscar();
      }

      function error(response) {
        controller.feedMessage(response);
      }

    }

    function irParaImportacaoValores() {
      controller.$location.path(`/relatorio/contrato/importar`).search(vm.model);
    }

    function redirecionarListagem() {
      controller.$location.path(`/relatorio/contrato/`);
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

    function abrirModalProfissionaisFaltantes(dados) {
      vm.modal = $uibModal.open({
        templateUrl: 'src/relatorio/relatorio-contrato/relatorio-contrato-detalhe/relatorio-contrato-detalhe-profissionais-faltantes.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false,
        windowClass: 'modal-consolidado-glosa-rh',
      });

      vm.modal.lista = (dados) ? angular.copy(dados) : [];

      vm.modal.totalDesconto = (vm.modal.lista || []).reduce(function (sum, c) {
        var vd = (c && typeof c.valorDesconto === 'number')
          ? c.valorDesconto
          : (c && c.quantidadeAusente && c.valorMensal
            ? (c.quantidadeAusente * (c.valorMensal / 21.74))
            : 0);
        return sum + vd;
      }, 0);
    }

  }

})();