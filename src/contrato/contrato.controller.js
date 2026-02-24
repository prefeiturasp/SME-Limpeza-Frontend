(function () {

  'use strict';

  angular
    .module('app.contrato')
    .controller('ContratoLista', ContratoLista);

  ContratoLista.$inject = ['SweetAlert', '$scope', '$timeout', 'controller', 'ContratoRest', 'tabela',
    '$uibModal', 'PrestadorServicoUtils', 'UnidadeEscolarUtils', 'BotaoUploadArquivoUtils',
    'DiretoriaRegionalUtils', 'moment', 'CargoUtils'];

  function ContratoLista(SweetAlert, $scope, $timeout, controller, dataservice, tabela,
    $uibModal, PrestadorServicoUtils, UnidadeEscolarUtils, BotaoUploadArquivoUtils,
    DiretoriaRegionalUtils, moment, CargoUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.instancia = {};
    vm.tabela = {};

    vm.optionsDatePicker = { minMode: 'day' };

    vm.abrirModal = abrirModal;
    vm.fecharModal = fecharModal;
    vm.salvar = salvar;

    vm.recarregarTabela = recarregarTabela;
    vm.formatarPercentual = formatarPercentual;

    vm.abrirModalUnidadeEscolar = abrirModalUnidadeEscolar;
    vm.fecharModalUnidadeEscolar = fecharModalUnidadeEscolar;
    vm.salvarUnidadeEscolar = salvarUnidadeEscolar;
    vm.removerUnidadeEscolar = removerUnidadeEscolar;
    vm.abrirModalImportacaoUE = abrirModalImportacaoUE;
    vm.abrirModalImportacaoCargo = abrirModalImportacaoCargo;
    vm.fecharModalImportacao = fecharModalImportacao;

    vm.salvarUnidadeEscolarCarregada = salvarUnidadeEscolarCarregada;
    vm.salvarCargosCarregados = salvarCargosCarregados;
    vm.abrirModalReajuste = abrirModalReajuste;
    vm.fecharModalReajuste = fecharModalReajuste;
    vm.salvarReajuste = salvarReajuste;
    vm.removerReajuste = removerReajuste;

    vm.abrirModalCargo = abrirModalCargo;
    vm.salvarCargo = salvarCargo;
    vm.fecharModalCargo = fecharModalCargo;
    vm.removerCargo = removerCargo;

    vm.getTotalEquipe = getTotalEquipe;
    vm.persistirContrato = persistirContrato;

    vm.editarCargo = editarCargo;

    iniciar();

    function iniciar() {
      carregarComboPrestadorServico();
      montarTabela();
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

    function montarTabela() {

      criarOpcoesTabela();

      function carregarObjeto(aData) {
        dataservice.buscar(aData.id).then((response) => {
          abrirModal(aData.id, controller.ler(response, 'data'));
        });
      }

      function criarColunasTabela() {

        const colunas = [
          { data: 'codigo', title: 'Código' },
          { data: 'descricao', title: 'Descrição' },
          { data: 'prestadorServico', title: 'Prestador de Serviço', renderWith: tabela.formatarPrestadorServico },
          { data: 'dataInicial', title: 'Data Inicial', cssClass: 'text-right', renderWith: tabela.formatarData },
          { data: 'dataFinal', title: 'Data Final', cssClass: 'text-right', renderWith: tabela.formatarData },
          {
            data: 'quantidadeUnidadesEscolar', title: 'UE\'s', cssClass: 'text-right', width: 8, renderWith: function (total) {
              return `<div class="badge badge-pill badge-primary"> ${total} </div>`;
            }
          },
          { data: 'id', title: 'Ações', width: 15, cssClass: 'text-right', renderWith: tabela.criarBotaoPadrao }
        ];

        vm.tabela.colunas = tabela.adicionarColunas(colunas);

      }

      function criarOpcoesTabela() {

        vm.tabela.opcoes = tabela.criarTabela(ajax, vm, remover, 'data', carregarObjeto);
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

        function remover(id) {

          dataservice.remover(id).then(success).catch(error);

          function success(response) {
            controller.feed('success', 'Contrato removido com sucesso.');
            tabela.recarregarDados(vm.instancia);
          }

          function error(response) {
            controller.feedMessage(response);
          }

        }

      }

    }

    function salvar(formulario) {

      if (formulario.$invalid) {
        return;
      }

      if (vm.modal.isEditar) {
        dataservice.atualizar(vm.modal.model.id, vm.modal.model).then(success).catch(error);
      } else {
        dataservice.inserir(vm.modal.model).then(success).catch(error);
      }

      function success(response) {
        controller.feed('success', 'Contrato salvo com sucesso.');
        tabela.recarregarDados(vm.instancia);
        fecharModal();
      }

      function error(response) {
        controller.feedMessage(response);
      }

    }

    function abrirModal(id, contrato) {

      carregarComboTodosPrestadorServico();

      vm.modal = $uibModal.open({
        templateUrl: 'src/contrato/contrato-form.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });

      vm.modal.model = angular.isDefined(contrato) ? angular.copy(contrato) : {};
      vm.modal.model.unidadeEscolarLista = vm.modal.model.unidadeEscolarLista || [];
      vm.modal.model.id = id;
      vm.modal.isEditar = angular.isDefined(contrato);

    }

    function carregarComboTodosPrestadorServico() {

      PrestadorServicoUtils.carregarComboTodos().then(success).catch(error);

      function success(response) {
        vm.prestadorServicoTodosList = response.objeto;
      }

      function error(response) {
        controller.feed('error', 'Erro ao buscar combo de todos os prestadores.');
        vm.prestadorServicoTodosList = [];
      }

    }

    function fecharModal() {
      vm.modal.close();
      delete vm.modal;
    }

    function recarregarTabela() {
      tabela.recarregarDados(vm.instancia);
    }

    function abrirModalUnidadeEscolar(indice, unidadeEscolar) {

      carregarComboUnidadeEscolar();

      vm.modalUnidadeEscolar = $uibModal.open({
        templateUrl: 'src/contrato/contrato-form-unidade-escolar.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false,
      });

      vm.modalUnidadeEscolar.model = angular.isDefined(unidadeEscolar) ? angular.copy(unidadeEscolar) : {};
      vm.modalUnidadeEscolar.model.dataInicial = vm.modalUnidadeEscolar.model.dataInicial ? new Date(moment(vm.modalUnidadeEscolar.model.dataInicial).format('YYYY-MM-DD') + 'T00:00:00') : null;
      vm.modalUnidadeEscolar.model.dataFinal = vm.modalUnidadeEscolar.model.dataFinal ? new Date(moment(vm.modalUnidadeEscolar.model.dataFinal).format('YYYY-MM-DD') + 'T00:00:00') : null;
      vm.modalUnidadeEscolar.index = indice;
      vm.modalUnidadeEscolar.isEditar = angular.isDefined(unidadeEscolar) && angular.isDefined(indice);

    }

    function abrirModalCargo() {

      carregarComboCargo();

      vm.modalCargo = $uibModal.open({
        templateUrl: 'src/contrato/contrato-form-cargo.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'md',
        keyboard: false,
      });

    }

    function fecharModalUnidadeEscolar() {
      vm.modalUnidadeEscolar.close();
      delete vm.modalUnidadeEscolar;
    }

    function salvarUnidadeEscolar(formularioUnidadeEscolar) {

      if (formularioUnidadeEscolar.$invalid) {
        return;
      }

      if (moment(vm.modalUnidadeEscolar.model.dataInicial).isAfter(vm.modalUnidadeEscolar.model.dataFinal)) {
        controller.feed('error', 'A data final deve ser maior ou igual que a data inicial.');
        return;
      }

      if (vm.modalUnidadeEscolar.isEditar) {
        vm.modal.model.unidadeEscolarLista[vm.modalUnidadeEscolar.index] = angular.copy(vm.modalUnidadeEscolar.model);
      } else {
        vm.modal.model.unidadeEscolarLista = vm.modal.model.unidadeEscolarLista || [];
        vm.modal.model.unidadeEscolarLista.push(angular.copy(vm.modalUnidadeEscolar.model));
      }

      fecharModalUnidadeEscolar();
      calcularValorTotal();

      persistirContrato({ mensagemSucesso: 'Unidade escolar salva e contrato atualizado com sucesso.' });
    }

    function removerUnidadeEscolar(indice) {

      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Você não poderá desfazer essa ação!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3F51B5',
        cancelButtonColor: '#FF4081',
        confirmButtonText: "Remover UE",
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (!isConfirm) return;
        vm.modal.model.unidadeEscolarLista.splice(indice, 1);
        calcularValorTotal();
      });

    }

    function carregarComboUnidadeEscolar() {

      UnidadeEscolarUtils.carregarComboDetalhadoTodos().then(success).catch(error);

      function success(response) {
        var unidadeEscolarLista = response.objeto.filter(function (unidade) {
          return !vm.modal.model.unidadeEscolarLista.find(element => element.id == unidade.id);
        });
        vm.unidadeEscolarLista = unidadeEscolarLista;
      }

      function error(response) {
        vm.unidadeEscolarLista = [];
        controller.feed('error', 'Erro ao buscar combo de unidades escolares.');
      }

    }

    function carregarComboCargo() {

      CargoUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.cargoList = response.objeto.filter(cargo => !(vm.modalUnidadeEscolar.model.equipeLista || []).find(element => element.id === cargo.id));
      }

      function error(error) {
        vm.cargoList = [];
        controller.feed('error', 'Erro ao buscar combo de cargos.');
      }

    }

    function calcularValorTotal() {
      vm.modal.model.valorTotal = (vm.modal.model.unidadeEscolarLista).reduce((accumulator, unidadeEscolar) => accumulator + unidadeEscolar.valor, 0);
    }

    function abrirModalImportacaoUE() {

      $timeout(() => {
        let urlImportacao = dataservice.urlImportacaoUE;
        vm.uploadUtils = new BotaoUploadArquivoUtils(urlImportacao);
        vm.uploader = vm.uploadUtils.uploader;
      }, 50);

      $scope.$watch('vm.uploadUtils.response', (newValue, oldValue) => {
        if (newValue !== oldValue && newValue != undefined) processarResultadoImportacaoUE(newValue);
      });

      vm.modalImportacao = $uibModal.open({
        templateUrl: 'src/contrato/contrato-importacao-unidade-escolar.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });

      vm.modalImportacao.resultado = [];

    }

    async function processarResultadoImportacaoUE(response) {

      if (!response.status) {
        controller.feed('error', 'Houve um erro ao processar o arquivo.');
        return;
      }

      for (const ue of response.data) {

        if (ue.classeResultado !== 'success') {
          continue;
        }

        ue.classeResultado = 'success';
        ue.mensagemResultado = 'UE adicionada';

        const ueExiste = (vm.modal.model.unidadeEscolarLista || []).find(v => v.id === ue.id);

        if (ueExiste) {
          ue.mensagemResultado = 'UE atualizada';
        }

      }

      vm.modalImportacao.resultado = response.data;

    }

    function abrirModalImportacaoCargo() {

      if (!vm.modal.model.unidadeEscolarLista || vm.modal.model.unidadeEscolarLista.length === 0) {
        controller.feed('warning', 'Nenhuma Unidade Escolar vinculada ao Contrato.');
        return;
      }

      $timeout(() => {
        let urlImportacao = dataservice.urlImportacaoCargo;
        vm.uploadUtils = new BotaoUploadArquivoUtils(urlImportacao);
        vm.uploader = vm.uploadUtils.uploader;
      }, 50);

      $scope.$watch('vm.uploadUtils.response', (newValue, oldValue) => {
        if (newValue !== oldValue && newValue !== undefined) processarResultadoImportacaoCargo(newValue);
      });

      vm.modalImportacao = $uibModal.open({
        templateUrl: 'src/contrato/contrato-importacao-cargo.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });

      vm.modalImportacao.resultado = [];

    }

    function fecharModalImportacao() {
      vm.modalImportacao.close();
      delete vm.modalImportacao;
      delete vm.uploadUtils;
      delete vm.uploader;
    }

    async function processarResultadoImportacaoCargo(response) {

      if (!response.status) {
        controller.feed('error', 'Houve um erro ao processar o arquivo.');
        return;
      }

      for (const c of response.data) {

        if (!c.unidadeEscolar || !c.id) {
          continue;
        }

        const ueExiste = (vm.modal.model.unidadeEscolarLista || []).find(ue => ue.id === c.unidadeEscolar.id);

        if (!ueExiste) {
          c.classeResultado = 'warning';
          c.mensagemResultado = 'UE não vinculada';
          continue;
        }

        c.classeResultado = 'success';
        c.mensagemResultado = 'Cargo adicionado';

        const cargoExiste = (ueExiste.equipeLista || []).find(e => e.id === c.id);

        if (cargoExiste) {
          c.mensagemResultado = 'Cargo atualizado';
        }

      }

      vm.modalImportacao.resultado = response.data;

    }

    function salvarUnidadeEscolarCarregada() {

      const unidadeEscolarList = vm.modalImportacao.resultado.filter(ue => ue.classeResultado === 'success');
      console.log(vm.modal)
      for (const ue of unidadeEscolarList) {

        const ueExistente = vm.modal.model.unidadeEscolarLista.find(ueExistente => ueExistente.id === ue.id);

        if (!ueExistente) {
          vm.modal.model.unidadeEscolarLista.push(ue);
          continue;
        }

        ueExistente.valor = ue.valor;
        ueExistente.dataInicial = ue.dataInicial;
        ueExistente.dataFinal = ue.dataFinal;

      }

      calcularValorTotal();
      fecharModalImportacao();

      persistirContrato({ mensagemSucesso: 'Unidades escolares importadas e contrato salvo com sucesso.' });
    }

    function salvarCargosCarregados() {

      const cargoList = vm.modalImportacao.resultado.filter(c => c.classeResultado === 'success');

      for (const c of cargoList) {

        const unidadeEscolar = vm.modal.model.unidadeEscolarLista.find(ue => ue.id === c.unidadeEscolar.id);
        const cargoExiste = (unidadeEscolar.equipeLista || []).find(e => e.id === c.id);

        if (cargoExiste) {
          cargoExiste.quantidade = c.quantidade;
          cargoExiste.descricao = c.descricao;
          cargoExiste.valorMensal = c.valor_mensal;
          continue;
        }

        unidadeEscolar.equipeLista.push({
          id: c.id,
          descricao: c.descricao,
          quantidade: c.quantidade,
          valorMensal: c.valor_mensal
        });

      }

      fecharModalImportacao();

      persistirContrato({ mensagemSucesso: 'Cargos importados e contrato salvo com sucesso.' });
    }

    function abrirModalReajuste() {

      vm.modalReajuste = $uibModal.open({
        templateUrl: 'src/contrato/contrato-form-reajuste.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'sm',
        keyboard: false,
      });

    }

    function fecharModalReajuste() {
      vm.modalReajuste.close();
      delete vm.modalReajuste;
    }

    function fecharModalCargo() {
      vm.modalCargo.close();
      delete vm.modalCargo;
    }

    function salvarReajuste(formularioReajuste) {

      if (formularioReajuste.$invalid) {
        return;
      }

      const hasSameDate = vm.modal.model.reajusteLista.filter(v => v.flagAtivo == true).some(v => moment(v.dataInicial).isSame(vm.modalReajuste.model.dataInicial, 'day'));

      if (hasSameDate) {
        controller.feed('warning', 'Já existe um reajuste configurado para a data selecionada.');
        return;
      }

      vm.modalReajuste.model.flagAtivo = true;
      vm.modal.model.reajusteLista = vm.modal.model.reajusteLista || [];
      vm.modal.model.reajusteLista.push(angular.copy(vm.modalReajuste.model));
      fecharModalReajuste();

      persistirContrato({ mensagemSucesso: 'Reajuste salvo e contrato atualizado com sucesso.' });
    }

    function salvarCargo(formularioCargo) {
      if (formularioCargo.$invalid) {
        return;
      }

      vm.modalCargo.model.flagAtivo = (vm.modalCargo.model.flagAtivo !== false);

      vm.modalUnidadeEscolar.model.equipeLista = vm.modalUnidadeEscolar.model.equipeLista || [];

      if (vm.modalCargo.isEditar) {
        vm.modalUnidadeEscolar.model.equipeLista[vm.modalCargo.index] = angular.copy(vm.modalCargo.model);
      } else {
        vm.modalUnidadeEscolar.model.equipeLista.push(angular.copy(vm.modalCargo.model));
      }

      fecharModalCargo();
    }

    function removerReajuste(reajuste) {

      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Você não poderá desfazer essa ação.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3f51b5',
        cancelButtonColor: '#ff4081',
        confirmButtonText: "Remover Reajuste",
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (!isConfirm) return;
        reajuste.flagAtivo = false;
      });

    }

    function removerCargo(indice) {

      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Você não poderá desfazer essa ação.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3f51b5',
        cancelButtonColor: '#ff4081',
        confirmButtonText: "Remover Cargo",
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (!isConfirm) return;
        vm.modalUnidadeEscolar.model.equipeLista.splice(indice, 1);
      });

    }

    function formatarPercentual(value) {

      if (value === null || value === undefined) {
        return ' - ';
      }

      return parseFloat(value).toFixed(2) + '%';

    }

    function getTotalEquipe(unidade) {
      if (!unidade || !Array.isArray(unidade.equipeLista)) return 0;
      return unidade.equipeLista.reduce(function (total, e) {
        var q = parseFloat(e && e.quantidade) || 0;
        return total + q;
      }, 0);
    }

    function persistirContrato({ mensagemSucesso = 'Contrato salvo com sucesso.', fecharModalPrincipal = false } = {}) {
      const temId = !!(vm && vm.modal && vm.modal.model && vm.modal.model.id);

      console.log(vm.modal)

      if (!temId) {
        return Promise.resolve({ skipped: true });
      }

      return dataservice.atualizar(vm.modal.model.id, vm.modal.model)
        .then((response) => {
          controller.feed('success', mensagemSucesso);
          if (tabela && typeof tabela.recarregarDados === 'function') {
            tabela.recarregarDados(vm.instancia);
          }
          if (fecharModalPrincipal) {
            fecharModal();
          }
          return response;
        })
        .catch((err) => {
          controller.feedMessage(err);
          throw err;
        });
    }

    function editarCargo(indice, cargo) {
      vm.modalUnidadeEscolar.model.equipeLista = vm.modalUnidadeEscolar.model.equipeLista || [];

      carregarComboCargo();

      vm.modalCargo = $uibModal.open({
        templateUrl: 'src/contrato/contrato-form-cargo.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'md',
        keyboard: false,
      });

      vm.modalCargo.isEditar = true;
      vm.modalCargo.index = indice;

      vm.modalCargo.model = angular.copy(cargo);
    }
  }

})();