(function () {

  'use strict';

  angular
    .module('monitoramento.monitoramento-detalhe')
    .controller('MonitoramentoDetalheController', MonitoramentoDetalheController);

  MonitoramentoDetalheController.$inject = ['$rootScope', '$timeout', 'controller', '$routeParams', '$location',
    'MonitoramentoRest', '$uibModal', 'MapaUtils'];

  function MonitoramentoDetalheController($rootScope, $timeout, controller, $routeParams, $location,
    dataservice, $uibModal, MapaUtils) {
    /* jshint validthis: true */

    var vm = this;
    var locationList = [];

    vm.optionsSummernote = {
      contenteditable: false,
      height: 250,
      focus: true,
      toolbar: []
    };

    vm.adicionarOcorrencia = adicionarOcorrencia;

    iniciar();

    function iniciar() {
      removeJavaScriptFile();

    }

    function buscarMonitoramento(idMonitoramento) {

      dataservice.buscar(idMonitoramento).then(success).catch(error);

      function success(response) {

        vm.monitoramento = controller.ler(response, 'data');


        $timeout(() => {
          inicializarMapa(vm.monitoramento);
          angular.element('.note-editable').attr('contenteditable', false);
          angular.element('.note-control-selection').remove();
        }, 500);

      }

      function error(response) {
        controller.feed('error', 'Erro ao buscar o monitoramento.');
        $rootScope.$evalAsync(() => {
          $location.path('monitoramento');
        });
      }

    }

    function adicionarOcorrencia() {

      if (!vm.monitoramento.flagPodeFiscalizar || vm.monitoramento.idOcorrencia) {
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
        resolve: {
          modalOptions: [() => {
            return {
              monitoramento: angular.copy(vm.monitoramento)
            };
          }]
        }
      }).result.then(() => {
        buscarMonitoramento($routeParams.id);
      });

    }

    function inicializarMapa(monitoramento) {

      locationList = [];

      MapaUtils.initMapWithDelay(200, 'mapa', '-23.57', '-46.6318', function (mapa) {
        montarMarkerUnidadeEscolar(mapa, monitoramento.unidadeEscolar);
        if (agruparMarkers(monitoramento) && calcularDistancia(monitoramento) < 0.02) {
          montarMarkerInicioTermino(mapa, monitoramento);
        } else {
          montarMarkerInicio(mapa, monitoramento);
          montarMarkerTermino(mapa, monitoramento);
        }

        MapaUtils.centerMapToLocationList(mapa, locationList);

      });

    }

    function agruparMarkers(monitoramento) {
      return Boolean(monitoramento.latitudeInicio && monitoramento.latitudeTermino && monitoramento.longitudeInicio && monitoramento.longitudeTermino);
    }

    function calcularDistancia(monitoramento) {
      return MapaUtils.calculateDistance(monitoramento.latitudeInicio, monitoramento.longitudeInicio, monitoramento.latitudeTermino, monitoramento.longitudeTermino);
    }

    function montarMarkerUnidadeEscolar(mapa, unidadeEscolar) {

      inserirLocationList(unidadeEscolar.latitude, unidadeEscolar.longitude);
      MapaUtils.newLocationAndAddMarker(mapa, unidadeEscolar.latitude, unidadeEscolar.longitude, false, 'src/layout/maps/escola.png',
        {
          hooverTooltip: `
				<div class="card">
					<div class="card-body d-flex flex-column justify-content-between">
						<div>
							<p class="mb-1"><span class="h4 mb-0 mr-2">${unidadeEscolar.descricao}</span></p>
							<p class="mb-0 text-muted font-weight-light">${unidadeEscolar.endereco}</p>                        
						</div>
					</div>
				</div>`
        }
      );

    }

    function montarMarkerInicio(mapa, monitoramento) {

      if (monitoramento.latitudeInicio && monitoramento.longitudeInicio) {
        montarMarkerOperacao(mapa, monitoramento.latitudeInicio, monitoramento.longitudeInicio, 'Início das atividades', monitoramento.dataHoraInicio);
      }

    }

    function montarMarkerTermino(mapa, monitoramento) {

      if (monitoramento.latitudeTermino && monitoramento.longitudeTermino) {
        montarMarkerOperacao(mapa, monitoramento.latitudeTermino, monitoramento.longitudeTermino, 'Término das atividades', monitoramento.dataHoraTermino);
      }

    }

    function montarMarkerOperacao(mapa, latitude, longitude, descricao, dataHora) {

      inserirLocationList(latitude, longitude);
      MapaUtils.newLocationAndAddMarker(mapa,
        latitude, longitude, false, null, {
        hooverTooltip: `
					<div class="card">
						<div class="card-body d-flex flex-column justify-content-between">
							<div>
								<p class="mb-1"><span class="h4 mb-0 mr-2">${descricao}</span></p>
								<p class="mb-0 text-muted font-weight-light">Data Hora: ${dataHora}</p>                        
							</div>
						</div>
					</div>
				`}
      );

    }

    function montarMarkerInicioTermino(mapa, monitoramento) {

      inserirLocationList(monitoramento.latitudeInicio, monitoramento.longitudeInicio);
      MapaUtils.newLocationAndAddMarker(mapa,
        monitoramento.latitudeInicio, monitoramento.longitudeInicio, false, null, {
        hooverTooltip: `
					<div class="card">
						<div class="card-body d-flex flex-column justify-content-between">
							<div>
								<p class="mb-3"><span class="h4 mr-2">Realização das atividades</span></p>
								<p class="mb-0 text-muted font-weight-light">Data Hora Início: ${moment(monitoramento.dataHoraInicio).format('DD/MM/YYYY HH:mm:ss')}</p>
								<p class="mb-0 text-muted font-weight-light">Data Hora Término: ${moment(monitoramento.dataHoraTermino).format('DD/MM/YYYY HH:mm:ss')}</p>
							</div>
						</div>
					</div>
				`}
      );

    }

    async function inserirLocationList(latitude, longitude) {

      locationList.push({
        lat: latitude,
        lon: longitude
      });

    }

    function removeJavaScriptFile() {
      let targetelement = 'script';
      let targetattr = 'src';
      let allsuspects = document.getElementsByTagName(targetelement);
      for (let i = allsuspects.length; i >= 0; i--) {
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr) != null && allsuspects[i].getAttribute(targetattr).indexOf('jsqrcode-combined.min.js') != -1) {
          console.log(allsuspects[i])
          allsuspects[i].parentNode.removeChild(allsuspects[i]);
        }
      }
      buscarMonitoramento($routeParams.id);
    }

  }

})();