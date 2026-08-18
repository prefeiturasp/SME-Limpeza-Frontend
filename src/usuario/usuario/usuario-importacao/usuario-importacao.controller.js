(function () {

  'use strict';

  angular
    .module('usuario.usuario-importacao')
    .controller('UsuarioImportacao', UsuarioImportacao);

  UsuarioImportacao.$inject = ['$rootScope', '$scope', 'controller', 'UsuarioRest', 'BotaoUploadArquivoUtils', '$uibModal', 'DTOptionsBuilder', 'datatables', '$sce'];

  function UsuarioImportacao($rootScope, $scope, controller, dataservice, BotaoUploadArquivoUtils, $uibModal, DTOptionsBuilder, datatables, $sce) {
    /* jshint validthis: true */

    let vm = this;

    vm.usuariosImportados = [];

    iniciar();

    function iniciar() {
      vm.uploadUtils = new BotaoUploadArquivoUtils(dataservice.urlImportacao);
      vm.uploader = vm.uploadUtils.uploader;


      vm.dtOptions = DTOptionsBuilder.newOptions()
        .withLanguage(datatables.ptbr)
        .withPaginationType('full_numbers')
        .withBootstrap()
        .withOption('lengthChange', false)
        .withOption('searching', false)
        .withOption('order', [[2, 'asc']]);
    }

    $scope.$watch('vm.uploadUtils.response', (newValue, oldValue) => {
      if (newValue && newValue !== oldValue) processarResultadoImportacao(newValue);
    });

    async function processarResultadoImportacao(response) {

      // Recupera erro de bloqueio salvo pela factory
      let erroBloqueio = localStorage.getItem('erroImportacaoBloqueada');
      if (erroBloqueio) {
        exibirModalErroImportacao(erroBloqueio);
        localStorage.removeItem('erroImportacaoBloqueada');
        vm.usuariosImportados = [];
        return;
      }

      if (!response.status) {
        controller.feed('error', 'Houve um erro ao processar a importação.');
        return;
      }

      controller.feed('success', 'Oba! A importação foi concluída com sucesso.');
      vm.usuariosImportados = response.data;

    }

    function exibirModalErroImportacao(conteudoHtml) {
      $uibModal.open({
        template: `
          <div class="modal-header bg-danger text-white">
            <h4 class="modal-title"><i class="icon-ban mr-2"></i> IMPORTAÇÃO BLOQUEADA</h4>
            <button type="button" class="close text-white" ng-click="$dismiss()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning mb-3">
              Existem entidades ativas que ficariam sem usuários associados. 
              A importação não pode prosseguir sem contemplar esses registros.
            </div>
            <div ng-bind-html="vm.corpo"></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" ng-click="$close()">Fechar</button>
          </div>
        `,
        controller: function() {
          this.corpo = $sce.trustAsHtml(conteudoHtml);
        },
        controllerAs: 'vm',
        size: 'lg'
      });
    }

    // 2. Função acionada pelo botão de Confirmação
    vm.confirmarImportacao = function() {
        vm.carregando = true;

        // Enviamos a lista de volta no corpo da requisição (JSON)
        let dados = {
            usuarios: vm.usuariosImportados,
            confirmar: true
        };

        dataservice.importar(dados).then(function(res) {
            controller.feed('success', 'Importação concluída com sucesso!');
            vm.usuariosImportados = []; // Limpa a tela após o sucesso
        }).catch(function(err) {
            let msg = (err.data && err.data.msg) ? err.data.msg : null;
            
            if (msg && msg.includes('Importação bloqueada:')) {
              exibirModalErroImportacao(msg);
              return;
            }

            controller.feedMessage(err);
        }).finally(function() {
            vm.carregando = false;
        });
    };


  }

})();