(function () {

  'use strict';

  angular
    .module('usuario.usuario-importacao')
    .controller('UsuarioImportacao', UsuarioImportacao);

  UsuarioImportacao.$inject = ['$rootScope', '$scope', 'controller', 'UsuarioRest', 'BotaoUploadArquivoUtils', 'DTOptionsBuilder', 'datatables', '$sce'];

  function UsuarioImportacao($rootScope, $scope, controller, dataservice, BotaoUploadArquivoUtils, DTOptionsBuilder, datatables, $sce) {
    /* jshint validthis: true */

    let vm = this;

    vm.usuariosImportados = [];
    vm.erroImportacaoHtml = null;
    vm.podeConfirmar = true;

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
      console.log('processarResultadoImportacao', response);

      vm.erroImportacaoHtml = null;
      vm.podeConfirmar = true;

      let erroBloqueio = localStorage.getItem('erroImportacaoBloqueada');
      if (erroBloqueio) {
        exibirErroImportacao(erroBloqueio);
        vm.usuariosImportados = [];
        vm.podeConfirmar = false;
        localStorage.removeItem('erroImportacaoBloqueada');
        return;
      }

      if (response && response.msg && response.msg.includes('Importação bloqueada:')) {
        exibirErroImportacao(response.msg);
        vm.usuariosImportados = response.data || [];
        vm.podeConfirmar = false;
        return;
      }

      if (!response || !response.status) {
        controller.feed('error', 'Houve um erro ao processar a importação.');
        return;
      }

      controller.feed('success', 'Oba! A importação foi concluída com sucesso.');
      vm.usuariosImportados = response.data || [];

      const existeFalha = vm.usuariosImportados.some(usuario => usuario.classeResultado === 'danger');
      if (existeFalha) {
        vm.podeConfirmar = false;
      }
    }

    function exibirErroImportacao(conteudoHtml) {
      vm.erroImportacaoHtml = $sce.trustAsHtml(conteudoHtml);
    }

    vm.confirmarImportacao = function() {
      if (!vm.podeConfirmar) {
        return;
      }

      vm.carregando = true;

      let dados = {
        usuarios: vm.usuariosImportados,
        confirmar: true
      };

      dataservice.importar(dados)
        .then(function(res) {
          controller.feed('success', 'Importação concluída com sucesso!');
          vm.usuariosImportados = [];
          vm.erroImportacaoHtml = null;
          vm.podeConfirmar = true;
        })
        .catch(function(err) {
          let msg = (err.data && err.data.msg) ? err.data.msg : null;

          if (msg && msg.includes('Importação bloqueada:')) {
            exibirErroImportacao(msg);
            vm.usuariosImportados = [];
            vm.podeConfirmar = false;
            return;
          }

          controller.feedMessage(err);
        })
        .finally(function() {
          vm.carregando = false;
        });
    };
  }

})();