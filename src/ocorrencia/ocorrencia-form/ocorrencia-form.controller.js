(() => {

  'use strict';

  angular
    .module('ocorrencia.ocorrencia-form')
    .controller('OcorrenciaForm', OcorrenciaForm);

  OcorrenciaForm.$inject = ['$scope', '$rootScope', 'controller', '$uibModal', 'OcorrenciaRest', 'OcorrenciaVariavelUtils', 'ConfiguracaoUtils', 'ContratoUtils', 'RelatorioGerencialRest'];

  function OcorrenciaForm($scope, $rootScope, controller, $uibModal, dataservice, OcorrenciaVariavelUtils, ConfiguracaoUtils, ContratoUtils, RelatorioGerencialRest) {
    /*jslint evil: true */

    var vm = this;

    vm.fecharModal = fecharModal;
    vm.expandirImagem = expandirImagem;
    vm.evtErroUpload = evtErroUpload;
    vm.evtUploadStart = evtUploadStart;
    vm.evtChangeTime = evtChangeTime;
    vm.evtChangeData = evtChangeData;
    vm.evtChangeOcorrenciaVariavel = evtChangeOcorrenciaVariavel;
    vm.verificarFormulario = verificarFormulario;

    vm.salvar = salvar;

    vm.optionsDatePicker = {
      minMode: 'day',
      maxDate: moment(),
      minDate: moment()
    };

    iniciar();

    function iniciar() {

      vm.model = {};
      vm.model.data = new Date();
      vm.model.dataOriginal = angular.copy(vm.model.data);

      if (vm.$resolve.modalOptions && vm.$resolve.modalOptions.monitoramento) {
        vm.model.monitoramento = vm.$resolve.modalOptions.monitoramento;
      }

      carregarConfiguracao();
      carregarComboOcorrenciaVariavel();

    }

    function extrairLinhasRelatorio(res) {
      if (res && res.datatables && Array.isArray(res.datatables.data)) {
        return res.datatables.data;
      }
      if (res && res.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      if (Array.isArray(res)) {
        return res;
      }
      return [];
    }

    function mesEncerradoPelaFlag(rows) {
      return rows.some(r => r && r.flagAprovadoFiscal === true);
    }

    function configurarDateDisabled(params) {
      vm.optionsDatePicker = vm.optionsDatePicker || {};

      const feriadosSet = new Set((params?.feriados || []).map(d => moment(d).format('YYYY-MM-DD')));

      vm.optionsDatePicker.dateDisabled = function (data) {
        if (!data || data.mode !== 'day') return false;
        const m = moment(data.date);

        if (params?.mesEncerrado) {
          if (m.year() === params.mesEncerrado.ano && m.month() === params.mesEncerrado.mesIndex) {
            return true;
          }
        }

        return false;
      };
    }

    function carregarConfiguracao() {
      let minDateByDiasRet = null;

      return ConfiguracaoUtils.buscar('DIAS_RET_OCORRENCIA')
        .then(response => {
          let minDate = moment();
          for (let d = 0; d < response.objeto.valor; d++) {
            minDate = minDate.subtract(1, 'days');
            while (minDate.isoWeekday() === 6 || minDate.isoWeekday() === 7) {
              minDate = minDate.subtract(1, 'days');
            }
          }
          minDateByDiasRet = minDate.clone();
          vm.optionsDatePicker.minDate = minDate.clone();
          vm.optionsDatePicker.maxDate = moment();

          configurarDateDisabled({ mesEncerrado: null });

          const hoje = moment();
          const mesAtual = parseInt(hoje.format('MM'), 10);
          const anoAtual = parseInt(hoje.format('YYYY'), 10);

          const mesAnteriorMoment = hoje.clone().subtract(1, 'month');
          const mesAnterior = parseInt(mesAnteriorMoment.format('MM'), 10);
          const anoMesAnterior = parseInt(mesAnteriorMoment.format('YYYY'), 10);

          const paramsPrev = [
            'draw=1',
            'filters=' + encodeURIComponent(JSON.stringify({ mes: mesAnterior, ano: anoMesAnterior })),
            'length=25',
            'start=0'
          ].join('&');

          return RelatorioGerencialRest.tabela(paramsPrev).then(resPrev => {
            const rowsPrev = extrairLinhasRelatorio(resPrev);
            const prevEncerrado = mesEncerradoPelaFlag(rowsPrev);

            if (prevEncerrado) {
              const fimMesAnterior = mesAnteriorMoment.clone().endOf('month');
              const rangeAlcancaPrevMonth = moment(minDateByDiasRet).isSameOrBefore(fimMesAnterior, 'day');

              if (rangeAlcancaPrevMonth) {
                configurarDateDisabled({
                  mesEncerrado: { ano: anoMesAnterior, mesIndex: mesAnteriorMoment.month() },
                });
              }
            }
          });
        })
        .then(resCurr => {
          const rowsCurr = extrairLinhasRelatorio(resCurr);

          if (rowsCurr.length > 0) {
            const primeiroDiaMesAtual = moment().startOf('month');
            vm.optionsDatePicker.minDate = primeiroDiaMesAtual;

            if (vm.model && vm.model.data && moment(vm.model.data).isBefore(primeiroDiaMesAtual, 'day')) {
              vm.model.data = primeiroDiaMesAtual.toDate();
              vm.model.dataOriginal = angular.copy(vm.model.data);
            }
          } else {
            vm.optionsDatePicker.minDate = minDateByDiasRet;
          }
        })
        .catch(err => {
          console.log(err);
          controller.feed('error', 'Houve um erro ao buscar as configurações ou o relatório gerencial.');
        });
    }

    function carregarComboOcorrenciaVariavel() {

      const flagApenasMonitoramento = angular.isDefined(vm.model.monitoramento);
      const data = moment(vm.model.data).format('YYYY-MM-DD');

      OcorrenciaVariavelUtils.carregarComboCadastro({ flagApenasMonitoramento, data }).then(success).catch(error);

      function success(response) {
        vm.ocorrenciaVariavelList = controller.ler(response, 'data');
      }

      function error(response) {
        vm.ocorrenciaVariavelList = [];
        controller.feedMessage(response);
      }

    }

    function carregarComboEquipe() {

      const data = moment(vm.model.data).format('YYYY-MM-DD')

      ContratoUtils.carregarComboEquipe({ data }).then(success).catch(error);

      function success(response) {
        vm.model.equipeList = controller.ler(response, 'data');
      }

      function error(response) {
        vm.model.equipeList = [];
        controller.feedMessage(response);
      }
    }

    function salvar(formulario) {

      if (formulario.$invalid) {
        return;
      }

      dataservice.inserir(vm.model).then(success).catch(error);

      function success(response) {
        controller.feed('success', 'Ocorrência salva com sucesso.');
        fecharModal();
      }

      function error(response) {
        console.log(response);
        controller.feedMessage(response);
      }

    }

    function expandirImagem(index) {

      vm.myInterval = 5000;
      vm.noWrapSlides = false;
      vm.active = index;

      $uibModal.open({
        animation: true,
        windowClass: 'modal-arquivos',
        template: `
          <div class="modal-body p-0">
            <div uib-carousel active="vm.active">
              <div uib-slide ng-repeat="arquivo in vm.model.arquivoList" index="$index">
                <img class="img-fluid" src="data:image/jpg;base64,{{arquivo.base64}}">
                <div class="carousel-caption">
                  <h4>{{arquivo.filename}}</h4>
                </div>
              </div>
            </div>
          </div>`,
        backdrop: true,
        scope: $scope,
        size: 'lg',
        keyboard: false,
      });

    }

    function fecharModal() {
      vm.$close();
    }

    function verificarFormulario(formulario) {

      if (formulario.$invalid) {
        return false;
      }

      if (vm.mostrarFormEquipe && (!vm.model.equipeList || vm.model.equipeList.length === 0)) {
        return false;
      }

      return true;

    }

    function evtUploadStart(event, reader, file, fileList, fileObjs, object) {
      var tiposAceitos = ['image/jpeg', 'image/png'];
      if (!tiposAceitos.includes(object.filetype)) {
        controller.feed('Tipo de arquivo não aceito.');
        reader.abort();
      }
    }

    function evtErroUpload(event, reader, file) {
      console.log('An error occurred while reading file: ' + file.name);
      reader.abort();
    }

    function evtChangeData() {
      vm.model.dataOriginal = angular.copy(vm.model.data);
      carregarComboOcorrenciaVariavel();
    }

    function evtChangeTime() {
      if (vm.model.data === null) {
        vm.model.data = angular.copy(vm.model.dataOriginal);
      } else {
        vm.model.dataOriginal = angular.copy(vm.model.data);
      }
    }

    function evtChangeOcorrenciaVariavel() {

      const ocorrenciaVariavel = vm.ocorrenciaVariavelList.find(ov => ov.id === vm.model.idOcorrenciaVariavel);

      vm.mostrarFormEquipe = ocorrenciaVariavel && ocorrenciaVariavel.flagEquipeAlocada === true;

      if (vm.mostrarFormEquipe) {
        carregarComboEquipe();
      }

    }

  }

})();