(function () {

  'use strict';

  angular
    .module('auth.recuperacao-senha')
    .controller('RecuperacaoSenhaCtlr', RecuperacaoSenhaCtlr);

  RecuperacaoSenhaCtlr.$inject = ['controller', '$rootScope', '$routeParams', 'RecuperacaoSenhaRest'];

  function RecuperacaoSenhaCtlr(controller, $rootScope, $routeParams, dataservice) {
    /* jshint validthis: true */

    var vm = this;

    vm.salvar = salvar;

    iniciar();

    function iniciar() {

      $rootScope.logado = false;
      vm.model = {};

      if ($routeParams.token) {
        vm.tokenRecuperacao = $routeParams.token;
        return buscarTokenRecuperacao();
      }

    }

    function salvar(formulario) {

      if (formulario.$invalid) {
        return;
      }

      if (vm.tokenRecuperacao) {
        return alterarSenha();
      }

      if (!vm.tokenRecuperacao) {
        return enviarEmailRecuperacao();
      }

    }

    function enviarEmailRecuperacao() {

      dataservice.inserir(vm.model).then(success).catch(error);

      function success(response) {
        vm.model.flagEnviado = true;
        vm.model.flagSucesso = true;
      }

      function error(response) {
        vm.model.flagEnviado = true;
        vm.model.flagSucesso = false;
        controller.feedMessage(response);
      }

    }

    function buscarTokenRecuperacao() {

      dataservice.buscar(vm.tokenRecuperacao).then(success).catch(error);

      function success(response) {
        vm.model = controller.ler(response, 'data');
      }

      function error(response) {
        vm.model = {};
        controller.feedMessage(response);
        controller.$location.path('/recuperacao-senha');
      }

    }

    function alterarSenha() {

      var model = {
        idUsuario: vm.model.id,
        senha: vm.model.senha,
        token: vm.tokenRecuperacao
      };

      dataservice.atualizar(vm.model.id, model).then(success).catch(error);

      function success(response) {
        controller.feed('success', 'Senha alterada com sucesso.');
        controller.$location.path('/login');
      }

      function error(response) {
        controller.feedMessage(response);
      }

    }

  }

})();