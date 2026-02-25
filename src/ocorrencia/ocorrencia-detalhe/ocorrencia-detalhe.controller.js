(function () {

  'use strict';

  angular
    .module('ocorrencia.ocorrencia-detalhe')
    .controller('OcorrenciaDetalheController', OcorrenciaDetalheController);

  OcorrenciaDetalheController.$inject = ['$rootScope', '$scope', '$interval', 'controller', '$routeParams', '$uibModal', '$location',
    'OcorrenciaRest', 'OcorrenciaMensagemUtils', 'SweetAlert', '$window'];

  function OcorrenciaDetalheController($rootScope, $scope, $interval, controller, $routeParams, $uibModal, $location,
    dataservice, OcorrenciaMensagemUtils, SweetAlert, $window) {
    /* jshint validthis: true */

    var vm = this;

    vm.mensagemList = [];
    vm.encerrar = encerrar;
    vm.reabrir = reabrir;
    vm.visualizarImagens = visualizarImagens;
    vm.enviarMensagem = enviarMensagem;
    vm.interval;
    vm.abrirModalMotivoNaoAtendido = abrirModalMotivoNaoAtendido;

    iniciar();

    function iniciar() {

      vm.idOcorrencia = $routeParams.id;
      if (!vm.idOcorrencia) {
        redirecionarListagem();
      }

      buscarOcorrencia();
      buscarMensagens();
      iniciarInterval();

    }

    function buscarOcorrencia() {

      dataservice.buscar(vm.idOcorrencia).then(success).catch(error);

      function success(response) {
        vm.ocorrencia = controller.ler(response, 'data');

        if ($routeParams.encerrar === 'true') {
          const bodyHeight = $window.document.body.scrollHeight;
          const windowHeight = $window.innerHeight;
          $window.scrollTo(0, bodyHeight - windowHeight);
        }

      }

      function error(response) {
        controller.feed('error', 'Erro ao buscar ocorrência.');
        redirecionarListagem();
      }

    }

    function buscarMensagens(ignoreLoadingBar) {

      OcorrenciaMensagemUtils.buscarPorOcorrencia(vm.idOcorrencia, ignoreLoadingBar).then(success).catch(error);

      function success(response) {
        if (vm.mensagemList.length !== response.objeto.length) {
          vm.mensagemList = response.objeto;
        }
      }

      function error(response) {
        controller.feed('error', 'Erro ao carregar mensagens.');
        redirecionarListagem();
      }

    }

    function enviarMensagem() {

      if (!vm.mensagem) {
        controller.feed('error', 'Erro ao enviar mensagem.');
        return;
      }

      var model = {
        idOcorrencia: vm.idOcorrencia,
        mensagem: vm.mensagem
      };

      OcorrenciaMensagemUtils.inserir(model).then(success).catch(error);

      function success(response) {
        vm.mensagem = null;
        buscarMensagens(true);
      }

      function error(response) {
        controller.feed('error', 'Erro ao enviar mensagem.');
        buscarMensagens();
      }

    }

    function visualizarImagens() {

      vm.myInterval = 5000;
      vm.noWrapSlides = false;

      $uibModal.open({
        animation: true,
        windowClass: 'modal-arquivos',
        template: `
          <div class="modal-body p-0">
            <div uib-carousel active="vm.active">
              <div uib-slide ng-repeat="arquivo in vm.ocorrencia.arquivos" index="$index">
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

    function encerrar(flagGerarDesconto, motivoNaoAtendido) {

      if (vm.ocorrencia.flagEncerrado || $rootScope.usuario.usuarioOrigem.codigo !== 'ue') {
        return;
      }

      vm.ocorrencia.flagGerarDesconto = flagGerarDesconto;

      if (flagGerarDesconto) {
        vm.ocorrencia.motivoNaoAtendido = motivoNaoAtendido;
      }

      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Após encerrar, não será possível reverter essa ação.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: vm.ocorrencia.flagGerarDesconto ? '#DD3544' : '#198459',
        cancelButtonColor: '#5F5F5F',
        confirmButtonText: 'Sim, encerrar',
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (isConfirm)
          dataservice.encerrar(
            vm.idOcorrencia,
            vm.ocorrencia
          ).then(success).catch(error);
      });


      function success(response) {
        controller.feed('success', 'Ocorrência encerrada com sucesso.');
        buscarOcorrencia();
        buscarMensagens();
      }

      function error(response) {
        console.log(response);
        controller.feedMessage(response);
      }

    }

    function reabrir() {

      if (!vm.ocorrencia.flagEncerrado || $rootScope.usuario.usuarioOrigem.codigo !== 'dre') {
        return;
      }

      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Após reabrir a ocorrência, não será possível reverter essa ação.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3F51B5',
        cancelButtonColor: '#FF4081',
        confirmButtonText: "Ok, reabrir",
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => { if (isConfirm) dataservice.reabrir(vm.idOcorrencia).then(success).catch(error); });


      function success(response) {
        controller.feed('success', 'Ocorrência reaberta com sucesso.');
        buscarOcorrencia();
        buscarMensagens();
      }

      function error(response) {
        controller.feed('error', 'Erro ao reabrir ocorrência.');
      }

    }

    function redirecionarListagem() {
      $rootScope.$evalAsync(() => $location.path('ocorrencia'));
    }

    function iniciarInterval() {
      vm.interval = $interval(() => {
        if (!vm.mensagem) {
          buscarMensagens(true);
        }
      }, 5000);
    }

    function abrirModalMotivoNaoAtendido() {
      $uibModal.open({
        animation: true,
        backdrop: 'static',
        keyboard: false,
        windowClass: 'modal-motivo-nao-atendido',
        template: `
      <div class="modal-header">
        <h4 class="modal-title">Informe o motivo</h4>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="motivo">Por que a solicitação não foi atendida?</label>
          <textarea id="motivo" class="form-control" ng-model="vm.modalMotivo" rows="4" placeholder="Descreva o motivo..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" ng-click="$dismiss()">Cancelar</button>
        <button class="btn btn-danger" ng-disabled="!vm.modalMotivo || !vm.modalMotivo.trim()" ng-click="$close(vm.modalMotivo)">Confirmar</button>
      </div>
    `,
        scope: $scope,
        size: 'md'
      }).result.then(function (motivo) {
        vm.encerrar(true, motivo);
      });
    }

    $scope.$on('$destroy', function () {
      $interval.cancel(vm.interval);
    });

  }

})();