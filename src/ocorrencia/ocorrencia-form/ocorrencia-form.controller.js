(() => {

  'use strict';

  angular
    .module('ocorrencia.ocorrencia-form')
    .controller('OcorrenciaForm', OcorrenciaForm);

  OcorrenciaForm.$inject = ['$scope', '$rootScope', 'controller', '$uibModal', 'OcorrenciaRest', 'OcorrenciaVariavelUtils', 'ConfiguracaoUtils', 'ContratoUtils', 'RelatorioGerencialRest', 'OcorrenciaRetroativaUtils'];

  function OcorrenciaForm($scope, $rootScope, controller, $uibModal, dataservice, OcorrenciaVariavelUtils, ConfiguracaoUtils, ContratoUtils, RelatorioGerencialRest, OcorrenciaRetroativaUtils) {
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

    vm.dadosOcorrenciaRetroativa = {};

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
      const diasHabilitadosSet = new Set((params?.diasHabilitados || []).map(d => moment(d).format('YYYY-MM-DD')));
      const minDate = params?.minDate ? moment(params.minDate) : null;
      const maxDate = params?.maxDate ? moment(params.maxDate) : null;

      vm.optionsDatePicker.dateDisabled = function (data) {
        if (!data || data.mode !== 'day') return false;
        const m = moment(data.date);

        if (diasHabilitadosSet.has(m.format('YYYY-MM-DD'))) {
          return false;
        }

        // Bloqueia dias fora do intervalo original permitido (gap criado pela expansão do calendário)
        if (minDate && m.isBefore(minDate, 'day')) {
          return true;
        }
        if (maxDate && m.isAfter(maxDate, 'day')) {
          return true;
        }

        if (params?.mesEncerrado) {
          if (m.year() === params.mesEncerrado.ano && m.month() === params.mesEncerrado.mesIndex) {
            return true;
          }
        }

        return false;
      }
    }

    function habilitaDatasOcorrenciaRetroativa() {
      let dadosOcorrenciaRetroativa = JSON.parse(localStorage.getItem('datasOcorrenciasRetroativas'));

      if (dadosOcorrenciaRetroativa && dadosOcorrenciaRetroativa.length > 0) {
        return gerarIntervaloDatas(dadosOcorrenciaRetroativa[0].dataInicial, dadosOcorrenciaRetroativa[0].dataFinal);
      }
      return [];
    }

    function gerarIntervaloDatas(dataInicial, dataFinal) {
      var datas = [];
      var dataAtual = moment(dataInicial);
      var dataFim = moment(dataFinal);

      while (dataAtual.isSameOrBefore(dataFim)) {
        datas.push(dataAtual.format('YYYY-MM-DD'));
        dataAtual.add(1, 'days');
      }
      return datas;
    }

    function buscaIdOcorrenciaRetroativaLocalStorage(){
      let dadosOcorrenciaRetroativa = JSON.parse(localStorage.getItem('datasOcorrenciasRetroativas'));
      if (dadosOcorrenciaRetroativa && dadosOcorrenciaRetroativa.length > 0){
        return dadosOcorrenciaRetroativa[0].idOcorrenciaRetroativa;
      } else {
        return null;
      }
    }

    function filtraDataHoraOcorrenciaRetroativa(dadosFormulario) {

      let dadosOcorrenciaRetroativa = JSON.parse(localStorage.getItem('datasOcorrenciasRetroativas'));

      if (!dadosOcorrenciaRetroativa || dadosOcorrenciaRetroativa.length === 0) {
        return false;
      }

      var registro = dadosOcorrenciaRetroativa[0];
      var dataHoraInicial = moment(registro.dataInicial + ' ' + registro.horaInicial, 'YYYY-MM-DD HH:mm');
      var dataHoraFinal = moment(registro.dataFinal + ' ' + registro.horaFinal, 'YYYY-MM-DD HH:mm');
      var dataHoraSelecionada = moment(dadosFormulario.data);
        
      if (dataHoraSelecionada.isSameOrAfter(dataHoraInicial) && dataHoraSelecionada.isSameOrBefore(dataHoraFinal)) {
        localStorage.setItem('OcorrenciaRetroativa', 'true');
        return true;
      } else {
        if (dataHoraSelecionada.isAfter(dataHoraFinal)) {

          let dataFormSelecionada = moment(dadosFormulario.data).format('YYYY-MM-DD');
          let dataFinalPermitida = moment(registro.dataFinal).format('YYYY-MM-DD');

          let horaFinalPermitida = registro.horaFinal;
          
          if(dataFormSelecionada === dataFinalPermitida){
            if (moment(dadosFormulario.data).format('HH:mm') > horaFinalPermitida){
              controller.feed('warning', 'Selecione uma data e hora entre ' + dataHoraInicial.format('DD/MM/YYYY HH:mm') + ' e ' + dataHoraFinal.format('DD/MM/YYYY HH:mm') + ', para esta "Ocorrência Retroativa".');
              return false;
            } else {
              localStorage.setItem('OcorrenciaRetroativa', 'true');
              return true;
            }
          } else {
            return true;
          }

        } else {
          controller.feed('warning', 'Selecione uma data e hora entre ' + dataHoraInicial.format('DD/MM/YYYY HH:mm') + ' e ' + dataHoraFinal.format('DD/MM/YYYY HH:mm') + ', para esta "Ocorrência Retroativa".');
          return false;
        }
      }

    }
      

    function carregarConfiguracao() {
      
      let minDateByDiasRet = null;
      const diasHabilitados = habilitaDatasOcorrenciaRetroativa();

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
          const maxDateOriginal = vm.optionsDatePicker.maxDate.clone();

          configurarDateDisabled({ mesEncerrado: null, diasHabilitados: diasHabilitados, minDate: minDateByDiasRet, maxDate: maxDateOriginal });

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
                  diasHabilitados: diasHabilitados,
                  minDate: minDateByDiasRet,
                  maxDate: maxDateOriginal
                });
              }
            }
          });
        }).then(resCurr => {
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

          if (diasHabilitados && diasHabilitados.length > 0) {
            diasHabilitados.forEach(function (dia) {
              var mDia = moment(dia);
              if (mDia.isValid()) {
                if (vm.optionsDatePicker.minDate && mDia.isBefore(vm.optionsDatePicker.minDate, 'day')) {
                  vm.optionsDatePicker.minDate = mDia.clone();
                }
                if (vm.optionsDatePicker.maxDate && mDia.isAfter(vm.optionsDatePicker.maxDate, 'day')) {
                  vm.optionsDatePicker.maxDate = mDia.clone();
                }
              }
            });
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

      let retornoVerificacao = filtraDataHoraOcorrenciaRetroativa(vm.model);

      if(!retornoVerificacao){
        return;
      }

      let retroativa = localStorage.getItem('OcorrenciaRetroativa');
      if (retroativa) {
        let idOcorrenciaRetroativa = buscaIdOcorrenciaRetroativaLocalStorage();
        if (idOcorrenciaRetroativa) {
          vm.model.idOcorrenciaRetroativa = idOcorrenciaRetroativa;
        }
        vm.model.flagOcorrenciaRetroativa = true;
      } else {
        vm.model.flagOcorrenciaRetroativa = false;
      }

      dataservice.inserir(vm.model).then(success).catch(error);

      function success(response) {
        if(retroativa){
          deletaOcorrenciaRetroativaLocalStorage();
          $rootScope.verificaDatasOcorrenciasRetroativas();
        }
        controller.feed('success', 'Ocorrência salva com sucesso.');
        fecharModal();
      }

      function error(response) {
        console.log(response);
        controller.feedMessage(response);
      }

    }

    function deletaOcorrenciaRetroativaLocalStorage(){
      localStorage.removeItem('OcorrenciaRetroativa');
      localStorage.removeItem('datasOcorrenciasRetroativas');
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