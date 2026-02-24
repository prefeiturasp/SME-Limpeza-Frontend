(function () {

  'use strict';

  angular
    .module('app.monitoramento')
    .controller('MonitoramentoController', MonitoramentoController);

  MonitoramentoController.$inject = ['$rootScope', '$scope', '$window', 'controller', 'MonitoramentoRest',
    'tabela', '$uibModal', 'SweetAlert', 'UnidadeEscolarUtils', 'PrestadorServicoUtils', 'AmbienteUnidadeEscolarUtils', 'ContratoUtils'];

  function MonitoramentoController($rootScope, $scope, $window, controller, dataservice,
    tabela, $uibModal, SweetAlert, UnidadeEscolarUtils, PrestadorServicoUtils, AmbienteUnidadeEscolarUtils, ContratoUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.instancia = {};
    vm.tabela = {};
    vm.filtros = {};

    vm.optionsDatePicker = { minMode: 'day', minDate: moment() };
    vm.optionsDatePickerFiltro = { minMode: 'day' };

    vm.transferirData = transferirData;
    vm.fecharModalTransferencia = fecharModalTransferencia;

    vm.recarregarTabela = recarregarTabela;

    vm.abrirModalAgendamento = abrirModalAgendamento;
    vm.abrirModalLeituraQrCode = abrirModalLeituraQrCode;
    vm.fecharModalLeituraQrCode = fecharModalLeituraQrCode;

    vm.filtros.datasSelecionadas = vm.filtros.datasSelecionadas || [];

    vm.formatarData = function (d) {
      var dd = ('0' + d.getDate()).slice(-2);
      var mm = ('0' + (d.getMonth() + 1)).slice(-2);
      var yyyy = d.getFullYear();
      return dd + '/' + mm + '/' + yyyy;
    };

    vm.datasParaApi = function () {
      return (vm.filtros.datasSelecionadas || []).map(vm.formatarData);
    };

    iniciar();

    function iniciar() {
      vm.isMobile = checkIsMobile();
      includeJavaScriptFile();
      carregarComboUnidadeEscolar();
      carregarComboPrestadorServico();
      carregarComboAmbiente();
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
        controller.feed('error', 'Houve um erro ao carregar as unidades escolares.');
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

    async function carregarComboAmbiente() {

      AmbienteUnidadeEscolarUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.ambienteUnidadeEscolarList = response.objeto;
      }

      function error(response) {
        vm.ambienteUnidadeEscolarList = [];
        controller.feed('error', 'Erro ao buscar lista de ambientes da unidade escolar.');
      }

    }

    function montarTabela() {

      criarOpcoesTabela();

      function criarColunasTabela() {

        var colunas = [
          {
            data: '', title: 'Data', renderWith: (var1, var2, data) => {
              return `
							<h5>${moment(data.data).format('DD/MM/YYYY')}</h5>
							<small>${data.periodicidade.descricao} - ${data.turno.descricao}</small>
						`;
            }
          },
          {
            data: '', title: 'Ambiente', renderWith: (var1, var2, data) => {
              return `
							<h5 style="font-weight: 100">${data.ambiente.descricao}</h5>
							<small>${data.ambiente.tipo}</small>
						`;
            }
          }
        ];

        if ($rootScope.usuario.usuarioOrigem.codigo !== 'ps') {

          if ($rootScope.usuario.usuarioOrigem.codigo === 'ue' && !vm.isMobile) {
            colunas.push({
              data: 'prestadorServico', width: 20, title: 'Prestador de Serviço', renderWith: tabela.formatarPrestadorServico
            });
          }

          if ($rootScope.usuario.usuarioOrigem.codigo !== 'ue') {
            colunas.push({
              data: 'prestadorServico', width: 20, title: 'Prestador de Serviço', renderWith: tabela.formatarPrestadorServico
            });
          }

        }

        if ($rootScope.usuario.usuarioOrigem.codigo != 'ue') {
          colunas.push({
            data: 'unidadeEscolar', title: 'Unidade Escolar', width: 20, renderWith: tabela.formatarUnidadeEscolar
          });
        }

        colunas.push({ data: 'flagRealizado', title: (vm.isMobile ? 'Rlzd' : 'Realizado'), width: 10, cssClass: 'text-right', renderWith: tabela.booleanParaBadgeSimNao });

        if ($rootScope.usuario.usuarioOrigem.codigo == 'ue' && !vm.isMobile) {
          colunas.push({ data: 'flagPossuiOcorrencia', title: (vm.isMobile ? 'Ocor.' : 'Ocorrência'), width: 10, cssClass: 'text-right', renderWith: tabela.booleanParaBadgeSimNao });
        }

        colunas.push({
          data: 'id', title: (vm.isMobile ? '' : 'Ações'), width: 15, cssClass: 'text-right', renderWith: (var1, var2, data) => {
            var html = '';
            if ($rootScope.usuario.usuarioOrigem.codigo == 'ue' && $rootScope.usuario.usuarioCargo.id == 2) {
              html += `
							<button class="mr-1 btn btn-outline-info btn-sm transferir" title="Reagendar">
								<i class="icon-calendar"></i>
							</button>
							<button class="mr-1 btn btn-outline-danger btn-sm remover" title="Remover">
								<i class="icon-trash"></i>
							</button>
						`;
            }
            html += `<button class="btn btn-outline-primary btn-sm visualizar" title="Visualizar"><i class="icon-eye"></i></button>`;
            return html;
          }
        });

        vm.tabela.colunas = tabela.adicionarColunas(colunas);

      }

      function criarOpcoesTabela() {

        vm.tabela.opcoes = tabela.criarTabela(ajax, vm, null, 'data');
        vm.tabela.opcoes.withOption('rowCallback', rowCallback);
        criarColunasTabela();

        function toIsoDate(dmy) {
          if (!dmy) return null;
          if (dmy instanceof Date) {
            var dd = ('0' + dmy.getDate()).slice(-2);
            var mm = ('0' + (dmy.getMonth() + 1)).slice(-2);
            var yyyy = dmy.getFullYear();
            return `${yyyy}-${mm}-${dd}`;
          }
          if (typeof dmy === 'string') {
            const [dd, mm, yyyy] = dmy.split('/');
            if (!dd || !mm || !yyyy) return null;
            return `${yyyy}-${mm}-${dd}`;
          }
          return null;
        }

        function normalizeDates(input) {
          if (!input) return [];

          const asArray = Array.isArray(input) ? input : [input];

          const flattened = asArray.flatMap(item => {
            if (item instanceof Date) return [item];
            if (typeof item === 'string') {
              return item
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);
            }
            return [];
          });

          return flattened;
        }

        function ajax(data, callback) {
          var filtrosParaApi = angular.copy(vm.filtros) || {};
          const normalized = normalizeDates(vm.filtros.datasSelecionadas);
          const datasISO = normalized.map(toIsoDate).filter(Boolean);

          if (datasISO.length > 0) {
            filtrosParaApi.datas = datasISO;
          } else {
            delete filtrosParaApi.datas;
          }

          delete filtrosParaApi.data;
          delete filtrosParaApi.datasSelecionadas;

          dataservice.tabela(tabela.criarParametros(data, filtrosParaApi))
            .then(success).catch(error);

          function success(response) { callback(controller.lerRetornoDatatable(response)); }
          function error() { callback(tabela.vazia()); }
        }

        function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {

          $('.transferir', nRow).off('click');
          $('.transferir', nRow).on('click', () => abrirModalTransferencia(aData));

          $('.visualizar', nRow).off('click');
          $('.visualizar', nRow).on('click', () => $rootScope.$evalAsync(() => window.open('monitoramento/detalhe/' + aData.id, '_blank')));

          $('.remover', nRow).off('click');
          $('.remover', nRow).on('click', () => remover(aData));

        }

      }

    }

    function abrirModalTransferencia(monitoramento) {

      if ($rootScope.usuario.usuarioOrigem.codigo != 'ue' || $rootScope.usuario.usuarioCargo.id != 2) {
        return;
      }

      if (monitoramento.flagRealizado) {
        return SweetAlert.swal({
          title: "Opss!",
          text: "Você não pode alterar a data deste monitoramento pois ele já foi realizado!",
          type: "error",
          showCancelButton: false,
          confirmButtonColor: '#3F51B5',
          confirmButtonText: 'Certo, entendi!',
          closeOnConfirm: true,
        });
      }

      if (!monitoramento.flagAtivo) {
        return SweetAlert.swal({
          title: "Opss!",
          text: "Você não pode reagendar um monitoramento que já foi removido!",
          type: "error",
          showCancelButton: false,
          confirmButtonColor: '#3F51B5',
          confirmButtonText: 'Certo, entendi!',
          closeOnConfirm: true,
        });
      }

      vm.modalTransferencia = $uibModal.open({
        templateUrl: 'src/monitoramento/monitoramento-transferencia-modal.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'md',
        keyboard: false,
      });

      vm.optionsDatePicker.minDate = moment(monitoramento.data).add(1, 'days');
      vm.modalTransferencia.model = angular.copy(monitoramento);
      vm.modalTransferencia.model.id = monitoramento.id;

    }

    function transferirData() {

      if ($rootScope.usuario.usuarioOrigem.codigo != 'ue' || $rootScope.usuario.usuarioCargo.id != 2) {
        return;
      }

      var novaData = vm.modalTransferencia.model.novaData;

      if (!novaData) {
        return controller.feed('error', 'Informe a nova data.');
      }

      if (moment(novaData).isSame(vm.modalTransferencia.model.data, 'day')) {
        return controller.feed('error', 'Informe uma data diferente da data atual do plano de trabalho.');
      }

      dataservice.atualizar(vm.modalTransferencia.model.id, vm.modalTransferencia.model).then(success).catch(error);

      function success(response) {
        controller.feed('success', 'Monitoramento reagendado com sucesso');
        tabela.recarregarDados(vm.instancia);
        fecharModalTransferencia();
      }

      function error(response) {
        controller.feed('error', 'Erro ao reagendar o monitoramento.');
      }

    }

    function remover(monitoramento) {

      if ($rootScope.usuario.usuarioOrigem.codigo != 'ue' || $rootScope.usuario.usuarioCargo.id != 2) {
        return;
      }

      if (monitoramento.flagRealizado) {
        return SweetAlert.swal({
          title: "Opss!",
          text: "Você não pode remover um monitoramento que já foi realizado!",
          type: "error",
          showCancelButton: false,
          confirmButtonColor: '#3F51B5',
          confirmButtonText: 'Certo, entendi!',
          closeOnConfirm: true,
        });
      }

      if (!monitoramento.flagAtivo) {
        return SweetAlert.swal({
          title: "Opss!",
          text: "Você não pode remover um monitoramento que já foi removido!",
          type: "error",
          showCancelButton: false,
          confirmButtonColor: '#3F51B5',
          confirmButtonText: 'Certo, entendi!',
          closeOnConfirm: true,
        });
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
          dataservice.remover(monitoramento.id).then(success).catch(error);
        }
      });

      function success(response) {
        controller.feed('success', 'Monitoramento removido com sucesso.');
        tabela.recarregarDados(vm.instancia);
      }

      function error(response) {
        controller.feed('error', 'Erro ao remover o monitoramento.');
      }

    }

    function fecharModalTransferencia() {
      vm.modalTransferencia.close();
      delete vm.modalTransferencia;
    }

    function recarregarTabela() {
      tabela.recarregarDados(vm.instancia);
    }

    function abrirModalAgendamento() {

      vm.modalAgendamento = $uibModal.open({
        templateUrl: 'src/monitoramento/monitoramento-agendamento/monitoramento-agendamento.html?' + new Date(),
        bindToController: true,
        controller: 'MonitoramentoAgendamento',
        controllerAs: 'vm',
        backdrop: 'static',
        size: 'lg',
        keyboard: false,
      }).result.then((retorno) => {
        if (retorno.DataSend) {
          recarregarTabela();
        }
      });

    }

    function checkIsMobile() {
      return $window.innerWidth < 575;
    }

    function abrirModalLeituraQrCode() {

      if (!checkIsMobile()) {
        return;
      }

      vm.modalLeitura = $uibModal.open({
        templateUrl: 'src/monitoramento/monitoramento-leitura-qrcode.html?' + new Date(),
        backdrop: 'static',
        windowTopClass: 'modal-qrcode-scan',
        scope: $scope,
        size: 'md',
        keyboard: false,
      });

    }

    vm.onSuccess = function onSuccess(hash) {

      AmbienteUnidadeEscolarUtils.buscarPorHash(hash).then((response) => {
        const ambiente = controller.ler(response, 'data');
        vm.filtros.idAmbienteUnidadeEscolar = ambiente.id;
        recarregarTabela();
        fecharModalLeituraQrCode();
      }).catch((error) => {
        //controller.feed('error', 'Tente novamente, ambiente não identificado.');
      });

    }

    function fecharModalLeituraQrCode() {
      vm.modalLeitura.close();
      delete vm.modalLeitura;
    }

    vm.onError = function (onError) {
      console.log({ onError });
    };

    vm.onVideoError = function (onVideoError) {
      console.log({ onVideoError });
    };

    function includeJavaScriptFile() {
      const node = document.createElement('script');
      node.src = 'vendor/jsqrcode-combined.min.js'
      node.type = 'text/javascript';
      document.getElementsByTagName('head')[0].appendChild(node);

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
  }

})();