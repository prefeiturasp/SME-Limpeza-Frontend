(function () {

  'use strict';

  angular
    .module('app.contrato')
    .controller('ContratoLista', ContratoLista);

  ContratoLista.$inject = ['SweetAlert', '$scope', '$timeout', 'controller', 'ContratoRest', 'tabela',
    '$uibModal', 'PrestadorServicoUtils', 'UnidadeEscolarUtils', 'BotaoUploadArquivoUtils',
    'DiretoriaRegionalUtils', 'moment', 'CargoUtils', 'UnidadeEscolarStatusUtils','ContratoStatusUtils','moment'];

  function ContratoLista(SweetAlert, $scope, $timeout, controller, dataservice, tabela,
    $uibModal, PrestadorServicoUtils, UnidadeEscolarUtils, BotaoUploadArquivoUtils,
    DiretoriaRegionalUtils, moment, CargoUtils, UnidadeEscolarStatusUtils, ContratoStatusUtils) {
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
    vm.editarCargo = editarCargo;

    vm.getTotalEquipe = getTotalEquipe;
    vm.persistirContrato = persistirContrato;

    // Unidade Escolar Status
    vm.editarStatusUE = editarStatusUE;
    vm.fecharModalStatusUE = fecharModalStatusUE;
    vm.salvarStatusUE = salvarStatusUE;
    vm.carregarComboStatus = carregarComboStatus;
    vm.reconciliarStatusComLista = reconciliarStatusComLista;

    // Contrato Status
    vm.editarStatusContrato = editarStatusContrato;
    vm.fecharModalStatusContrato = fecharModalStatusContrato;
    vm.salvarStatusContrato = salvarStatusContrato;
    vm.carregarComboStatusContrato = carregarComboStatusContrato;
    vm.reconciliarStatusComListaContrato = reconciliarStatusComListaContrato;

    //Histórico de Status
    vm.abrirModalHistoricoEU = abrirModalHistoricoEU;
    vm.abrirModalHistoricoContrato = abrirModalHistoricoContrato;
    vm.fecharModalHistoricoStatusUE = fecharModalHistoricoStatusUE;
    vm.fecharModalHistoricoStatusContrato = fecharModalHistoricoStatusContrato;

    vm.retornaDataFormatada = retornaDataFormatada;

    iniciar();

    function iniciar() {
      getEmailUsu();
      carregarComboPrestadorServico();
      carregarComboStatusContrato();
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
          { data: 'descricaostatuscontrato', title: 'Status', renderWith: tabela.formatarStatusContrato },
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

      function filtraStatusContrato(arrDT, filtro){
        let i=0;
        let arrFiltrado = [];
        angular.forEach(arrDT.data, function(value, key){
            if(value.idstatuscontrato == filtro.id){
              arrFiltrado.push(value);
            }
            i++;
        });
        return {
          datatables: { 
            recordsFiltered: i, 
            recordsTotal: i, 
            data:arrFiltrado 
          }
        }
      }

      function criarOpcoesTabela() {

        vm.tabela.opcoes = tabela.criarTabela(ajax, vm, remover, 'data', carregarObjeto);
        criarColunasTabela();

        function ajax(data, callback, settings) {
          dataservice.tabela(tabela.criarParametros(data, vm.filtros)).then(success).catch(error);

          function success(response) {
            let arrDadosDT = response.data.datatables;
            if(vm.filtros){
              if(vm.filtros.descricaostatuscontrato){
                response.data = filtraStatusContrato(arrDadosDT, vm.filtros.descricaostatuscontrato);
              } 
            }
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

    function fecharModalStatusUE() {
      vm.modalStatusUE.close();
      delete vm.modalStatusUE;

      delete vm.idUeStatus;
      delete vm.ueStatusAntigo;
      delete vm.ueStatusNovo;
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

      if (!temId) {
        return Promise.resolve({ skipped: true });
      }

      return dataservice.atualizar(vm.modal.model.id, vm.modal.model).then((response) => {
        controller.feed('success', mensagemSucesso);
        if (tabela && typeof tabela.recarregarDados === 'function') {
          tabela.recarregarDados(vm.instancia);
        }
        if (fecharModalPrincipal) {
          fecharModal();
        }
        return response;
      }).catch((err) => {
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

    function carregarComboStatus() {
      return UnidadeEscolarStatusUtils.carregarCombo()
        .then(function success(response) {
          vm.statusList = response && (response.objeto || response.data) ? (response.objeto || response.data) : (response || []);
          if (!Array.isArray(vm.statusList)) vm.statusList = [];
          return vm.statusList;
        })
        .catch(function error(err) {
          vm.statusList = [];
          controller.feed('error', 'Erro ao buscar combo de status.');
          throw err;
        });
    }

    function reconciliarStatusComLista() {
      if (!vm.modalStatusUE || !vm.modalStatusUE.model) return;
      if (!Array.isArray(vm.statusList) || vm.statusList.length === 0) return;

      var m = vm.modalStatusUE.model;
      var statusId = null;
      if (m.idStatusUnidadeEscolar != null) statusId = m.idStatusUnidadeEscolar;
      else if (m.status && m.status.id != null) statusId = m.status.id;
      else if (typeof m.status === 'number' || typeof m.status === 'string') statusId = m.status;

      if (statusId == null) {
        m.status = null;
        return;
      }

      var encontrado = vm.statusList.find(function (s) {
        var sid = s && (s.id != null ? s.id : s.Id);
        return sid != null && String(sid) === String(statusId);
      });

      if (encontrado) {
        try {
          if (!('descricao' in encontrado) && ('nome' in encontrado)) encontrado.descricao = encontrado.nome;
        } catch (e) { }

        $timeout(function () {
          m.status = encontrado;
          m.idStatusUnidadeEscolar = encontrado.id != null ? encontrado.id : (encontrado.Id || null);
        }, 0);
      } else {
        console.warn('reconciliarStatusComLista: não encontrou statusList para id', statusId, '— statusList:', vm.statusList);
        m.status = null;
      }
    }

    function editarStatusUE(indice, unidadeEscolar) {
      if (angular.isObject(indice) && !unidadeEscolar) {
        unidadeEscolar = indice;
        indice = null;
      }

      if (!unidadeEscolar && (indice !== null && indice !== undefined)) {
        if (vm.modal && vm.modal.model && Array.isArray(vm.modal.model.unidadeEscolarLista)) {
          unidadeEscolar = vm.modal.model.unidadeEscolarLista[indice];
        } else {
          console.warn('editarStatusUE: indice fornecido mas vm.modal.model.unidadeEscolarLista não disponível.');
        }
      }

      vm.modalStatusUE = $uibModal.open({
        templateUrl: 'src/contrato/contrato-form-status-unidade-escolar.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'md',
        keyboard: false,
      });

      vm.modalStatusUE.index = (indice || null);

      if (!unidadeEscolar) {
        console.warn('editarStatusUE: nenhum objeto unidadeEscolar foi passado/buscado — abrindo modal com model vazio.');
      }

      vm.ueStatusAntigo = unidadeEscolar.idStatusUnidadeEscolar;
      vm.idUeStatus = unidadeEscolar.id;

      vm.modalStatusUE.model = {
        id: unidadeEscolar.id,
        idStatusUnidadeEscolar: unidadeEscolar.idStatusUnidadeEscolar,
        motivoStatus: unidadeEscolar.motivoStatus
      };

      var carregar = (vm.statusList && vm.statusList.length) ? Promise.resolve(vm.statusList) : carregarComboStatus();

      carregar.then(function () {
        reconciliarStatusComLista();
      }).catch(function (err) {
        console.error('Erro ao carregar statusList no editarStatusUE:', err);
        reconciliarStatusComLista();
      });
    }

    function salvarStatusUE(formularioStatusUE) {

      if (formularioStatusUE.$invalid) {
        return;
      }

      let unidade = null;
      let unidadeIndex = vm.modalStatusUE.index;

      if (vm.modal &&
        vm.modal.model &&
        Array.isArray(vm.modal.model.unidadeEscolarLista) &&
        unidadeIndex != null) {

        unidade = vm.modal.model.unidadeEscolarLista[unidadeIndex];
      }

      if (!unidade && vm.modalUnidadeEscolar && vm.modalUnidadeEscolar.model) {
        unidade = vm.modalUnidadeEscolar.model;
        if (vm.modal && vm.modal.model && Array.isArray(vm.modal.model.unidadeEscolarLista)) {
          const idx = vm.modal.model.unidadeEscolarLista.findIndex(u => String(u.id) === String(unidade.id));
          if (idx >= 0) {
            unidadeIndex = idx;
            vm.modal.model.unidadeEscolarLista[idx] = unidade;
          }
        }
      }

      if (!unidade) {
        console.error("salvarStatusUE: unidade não encontrada.");
        controller.feed("error", "Não foi possível localizar a unidade escolar.");
        return;
      }

      unidade.idStatusUnidadeEscolar = vm.modalStatusUE.model.idStatusUnidadeEscolar || null;
      unidade.motivoStatus = vm.modalStatusUE.model.motivoStatus || null;

      const statusObj = vm.statusList.find(s => s.id === unidade.idStatusUnidadeEscolar);
      unidade.statusDescricao = statusObj ? statusObj.descricao : null;

      vm.ueStatusNovo = vm.modalStatusUE.model.idStatusUnidadeEscolar;

      persistirContrato({mensagemSucesso: 'Status da unidade escolar atualizado com sucesso.'}).then(() => {
    
        let idContrato = vm.modal.model.id;
        let motivoSta = vm.modalStatusUE.model.motivoStatus;
        if(vm.ueStatusNovo == 1){
          motivoSta = null;
        }
    
        salvaHistoricoStatusUe(idContrato, vm.idUeStatus, vm.ueStatusAntigo, vm.ueStatusNovo, motivoSta);

          fecharModalStatusUE();
          if (vm.modalUnidadeEscolar && unidadeIndex != null) {
            vm.modalUnidadeEscolar.model = vm.modal.model.unidadeEscolarLista[unidadeIndex];
          }
      }).catch((err) => {
        console.error("Erro ao persistir contrato:", err);
        controller.feedMessage(err);
      });
    }

    // STATUS CONTRATO
    function fecharModalStatusContrato() {
      vm.modalStatusContrato.close();
      delete vm.modalStatusContrato;
      delete vm.contratoStatusAntigo;
    }

    function editarStatusContrato(indice, contrato) {
      
      if (angular.isObject(indice) && !contrato) {
        contrato = indice;
        indice = null;
      }

      if (!contrato && (indice !== null && indice !== undefined)) {
        if (vm.modal && vm.modal.model && Array.isArray(vm.modal.model.contratoLista)) {
          contrato = vm.modal.model.contratoLista[indice];
        } else {
          console.warn('editarStatusContrato: indice fornecido mas vm.modal.model.contratoLista não disponível.');
        }
      }

      vm.modalStatusContrato = $uibModal.open({
        templateUrl: 'src/contrato/contrato-form-status.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'md',
        keyboard: false,
      });

      vm.modalStatusContrato.index = (indice || null);

      if (!contrato) {
        console.warn('editarStatusContrato: nenhum objeto contrato foi passado/buscado — abrindo modal com model vazio.');
      }

      vm.modalStatusContrato.model = {
        id: contrato.id,
        idStatusContrato: contrato.idStatusContrato,
        motivoStatusContrato: contrato.motivostatuscontrato
      };

      var carregar = (vm.statusListContrato && vm.statusListContrato.length) ? Promise.resolve(vm.statusListContrato) : carregarComboStatusContrato();

      carregar.then(function () {
        reconciliarStatusComListaContrato();
      }).catch(function (err) {
        console.error('Erro ao carregar statusListContrato no editarStatusContrato:', err);
        reconciliarStatusComListaContrato();
      });
    }

    function salvarStatusContrato(formularioStatusContrato) {

      if (formularioStatusContrato.$invalid) {
        return;
      }

      let contrato = vm.modal.model;
      vm.contratoStatusAntigo = contrato.idstatuscontrato;
      contrato.idStatusContrato = vm.modalStatusContrato.model.idStatusContrato;
      contrato.motivoStatusContrato = vm.modalStatusContrato.model.motivoStatusContrato || null;

      let nomeStatus = '';
      angular.forEach(vm.statusListContrato, function(value, key){
          if(value.id == contrato.idStatusContrato)
            nomeStatus = value.descricao;
      });

      persistirStatusContrato({mensagemSucesso: 'Status do contrato atualizado com sucesso.'}).then(function success(response) {
        fecharModalStatusContrato();
          vm.modal.model.idstatuscontrato = vm.modal.model.idStatusContrato;
          vm.modal.model.descricaostatuscontrato = nomeStatus;
          vm.modal.model.motivostatuscontrato = vm.modal.model.motivoStatusContrato;
        }).catch((err) => {
          console.error("Erro ao persistir contrato:", err);
          controller.feedMessage(err);
        });
    }

    function carregarComboStatusContrato() {
      return ContratoStatusUtils.carregarComboStatusContrato().then(function success(response) {
          vm.statusListContrato = response && (response.objeto || response.data) ? (response.objeto || response.data) : (response || []);
          if (!Array.isArray(vm.statusListContrato)) vm.statusListContrato = [];
          return vm.statusListContrato;
        }).catch(function error(err) {
          vm.statusListContrato = [];
          controller.feed('error', 'Erro ao buscar combo de status do contrato.');
          throw err;
        });
    }

    function reconciliarStatusComListaContrato() {
      if (!vm.modalStatusContrato || !vm.modalStatusContrato.model) return;
      if (!Array.isArray(vm.statusListContrato) || vm.statusListContrato.length === 0) return;
      var m = vm.modal.model;
      vm.modalStatusContrato.model.idStatusContrato = m.idstatuscontrato;
      vm.modalStatusContrato.model.motivoStatusContrato = m.motivostatuscontrato;
    }

    function persistirStatusContrato({ mensagemSucesso = 'Status do contrato salvo com sucesso.' } = {}) {
      const temId = !!(vm && vm.modal && vm.modal.model && vm.modal.model.id);
    
      if (!temId) {
        return Promise.resolve({ skipped: true });
      }

      return ContratoStatusUtils.atualizarStatusContrato(vm.modal.model).then((response) => {
        let staNovo = vm.modal.model.idStatusContrato;
        let motivoSta = vm.modal.model.motivoStatusContrato;
        if(staNovo != 4){
          motivoSta = null;
        }
        salvaHistoricoStatusContrato(vm.modal.model.id, vm.contratoStatusAntigo, vm.modal.model.idStatusContrato, motivoSta);

        controller.feed('success', mensagemSucesso);
        if (tabela && typeof tabela.recarregarDados === 'function') {
          recarregarTabela();
        }
        return response;
      }).catch((err) => {
        controller.feedMessage(err);
        throw err;
      });
    }

    // HISTÓRICO DE STATUS
    function buscaListaHistoricoStatusUE(){
      let idUe = vm.modalUnidadeEscolar.model.id;
      let idContrato = vm.modal.model.id;

      return UnidadeEscolarStatusUtils.buscaHistoricoStatusUE(idContrato, idUe).then(function success(response) {
        vm.historicoStatusUEList = response && (response.objeto || response.data) ? (response.objeto || response.data) : (response || []);
        if (!Array.isArray(vm.historicoStatusUEList)) vm.historicoStatusUEList = [];
        return vm.historicoStatusUEList;
      }).catch(function error(err) {
        vm.historicoStatusUEList = [];
        controller.feed('error', 'Erro ao buscar historico de status da unidade escolar.');
        throw err;
      });

    }

    function abrirModalHistoricoEU() {

      var historicoStatusUEList = (vm.historicoStatusUEList && vm.historicoStatusUEList.length) ? Promise.resolve(vm.historicoStatusUEList) : buscaListaHistoricoStatusUE();

      historicoStatusUEList.then(function () {
        if(vm.historicoStatusUEList.length > 0){
          $timeout(function() {
            $('#historicoStatusUE').DataTable({
            language: {
                "sEmptyTable": "Nenhum registro encontrado",
                "sInfo": "Mostrando _START_ até _END_ de _TOTAL_ registros",
                "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
                "oPaginate": {
                    "sNext": "Próximo",
                    "sPrevious": "Anterior",
                    "sFirst": "Primeiro",
                    "sLast": "Último"
                }
            },
            pageLength: 10,
            order: [[0, 'desc']],
            searching: false,
            bLengthChange: false
          });
          }, 100);
        }
      }).catch(function (err) {
        console.error('Erro ao carregar historico dos status:', err);
      });

      vm.nomeUE = vm.modalUnidadeEscolar.model.codigo +' - '+vm.modalUnidadeEscolar.model.descricao;

      vm.modalHistoricoStatusUE = $uibModal.open({
        templateUrl: 'src/unidade-escolar/unidade-escolar-historico/unidade-escolar-historico-status.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false,
      });

    }

    function fecharModalHistoricoStatusUE() {
      vm.modalHistoricoStatusUE.close();
      delete vm.modalHistoricoStatusUE;
    }
    
    function buscaListaHistoricoStatusContrato(){
      let idContrato = vm.modal.model.id;
      
      return ContratoStatusUtils.buscaHistoricoStatusContrato(idContrato).then(function success(response) {
        vm.historicoStatusContratoList = response && (response.objeto || response.data) ? (response.objeto || response.data) : (response || []);
        if (!Array.isArray(vm.historicoStatusContratoList)) vm.historicoStatusContratoList = [];
        return vm.historicoStatusContratoList;
      }).catch(function error(err) {
        vm.historicoStatusContratoList = [];
        controller.feed('error', 'Erro ao buscar historico de status da unidade escolar.');
        throw err;
      });

    }

    function abrirModalHistoricoContrato() {

      var historicoStatusContratoList = (vm.historicoStatusContratoList && vm.historicoStatusContratoList.length) ? Promise.resolve(vm.historicoStatusContratoList) : buscaListaHistoricoStatusContrato();

      historicoStatusContratoList.then(function () {
        if(vm.historicoStatusContratoList.length > 0){
          $timeout(function() {
            $('#historicoStatusContrato').DataTable({
            language: {
                "sEmptyTable": "Nenhum registro encontrado",
                "sInfo": "Mostrando _START_ até _END_ de _TOTAL_ registros",
                "sInfoEmpty": "Mostrando 0 até 0 de 0 registros",
                "oPaginate": {
                    "sNext": "Próximo",
                    "sPrevious": "Anterior",
                    "sFirst": "Primeiro",
                    "sLast": "Último"
                }
            },
            pageLength: 10,
            order: [[0, 'desc']],
            searching: false,
            bLengthChange: false
          });
          }, 100);
        }
      }).catch(function (err) {
        console.error('Erro ao carregar historico dos status:', err);
      });

      vm.modalHistoricoStatusContrato = $uibModal.open({
        templateUrl: 'src/contrato/contrato-historico/contrato-historico-status.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false,
      });
    }

    function fecharModalHistoricoStatusContrato() {
      vm.modalHistoricoStatusContrato.close();
      delete vm.modalHistoricoStatusContrato;
    }

    function retornaDataFormatada(dataHora){
      return moment(dataHora).format('DD/MM/YYYY - HH:mm');
    }

    function getEmailUsu(){
      let idUsu = sessionStorage.getItem('idUsu');
      if(!idUsu){
        let usu = JSON.parse(localStorage.getItem('ngStorage-usuario'));
        ContratoStatusUtils.buscarIdUsuPorEmail(usu.email).then(success).catch(error);
        function success(response) {
          idUsu = response.data.idUsuario;
          sessionStorage.setItem('idUsu', idUsu);
        }
        function error(response) {
          controller.feed('error', 'Erro ao buscar id do usuario.');
        }
      } 

    }

    function salvaHistoricoStatusContrato(idContrato, statusAntigo, statusNovo, motivoStatus){
      let idUsu = sessionStorage.getItem('idUsu');
      if(idUsu){
        let dados = {
          idContrato: idContrato,
          statusAntigo: statusAntigo,
          statusNovo: statusNovo,
          motivoStatus: motivoStatus,
          idUsu: idUsu
        }

        ContratoStatusUtils.salvaHistoricoStatusContrato(dados).then(success).catch(error);
        function success(response) {
          buscaListaHistoricoStatusContrato();
        }
        function error(response) {
          controller.feed('error', 'Erro ao salvar o histórico de status do contrato.');
        }
      }
    }

    function salvaHistoricoStatusUe(idContrato, idUe, statusAntigo, statusNovo, motivoStatus){
      let idUsu = sessionStorage.getItem('idUsu');
      if(idUsu){
        let dados = {
          idContrato: idContrato,
          idUe: idUe,
          statusAntigo: statusAntigo,
          statusNovo: statusNovo,
          motivoStatus: motivoStatus,
          idUsu: idUsu
        }

        UnidadeEscolarStatusUtils.salvaHistoricoStatusUE(dados).then(success).catch(error);
        function success(response) {
          buscaListaHistoricoStatusUE();
        }
        function error(response) {
          controller.feed('error', 'Erro ao salvar o histórico de status da unidade.');
        }
      }
    }

  }

})();