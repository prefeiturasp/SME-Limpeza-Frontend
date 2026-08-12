(function () {

  'use strict';

  angular.module('core.auth')
    .controller('Login', Login);

  Login.$inject = ['$rootScope', '$scope', 'controller', 'AuthToken', 'LoginRest', '$location', 'ConfiguracaoRest', '$uibModal'];

  function Login($rootScope, $scope, controller, AuthToken, dataservice, $location, ConfiguracaoRest, $uibModal) {
    /* jshint validthis: true */

    var vm = this;

    vm.entrar = entrar;
    vm.abrirModalLoginAdmin = abrirModalLoginAdmin;
    vm.fechaModalLoginAdmin = fechaModalLoginAdmin;

    iniciar();

    function iniciar() {
      $rootScope.logado = false;
      vm.model = {};
      verificarManutencaoSistema();
      vm.exibeFormLogin = false;
      vm.exibeMsgManutencao = false;
    }

    function entrar() {

      dataservice.entrar(vm.model).then(success).catch(error);

      function success(response) {

       if(vm.exibeMsgManutencao){
          let dados = controller.ler(response, 'data');
          if(dados.usuario.usuarioOrigem.codigo !== 'sme'){
            controller.feed('warning', 'Usuário sem permissão para acessar o sistema no momento.');
            fechaModalLoginAdmin();
            return;
          } else {
            autenticaUsuario(response);
          }
        } else {
          autenticaUsuario(response);
        }

      }

      function error(response) {
        controller.feedMessage(response);
      }

    }

    function autenticaUsuario(response){

      var response = controller.ler(response, 'data');
        AuthToken.setToken(response.token, 'accessToken');
        AuthToken.setToken(response.usuario, 'usuario');
        $rootScope.usuario = AuthToken.getToken('usuario');
        $rootScope.logado = true;
        $rootScope.$evalAsync(() => {
          $location.path('/painel-inicial');
        });
        controller.feed('success', 'Usuário autenticado com sucesso, redirecionando.');

      }

      function verificarManutencaoSistema() {

      ConfiguracaoRest.buscaManutencaoSistema().then(success).catch(error);

        function success(response) {
          const valor = response.data.data.valor;
          if (valor === 1) {
            vm.exibeFormLogin = false;
            vm.exibeMsgManutencao = true;
          } else {
            vm.exibeFormLogin = true;
            vm.exibeMsgManutencao = false;
          }
        }
        function error(response) {
          controller.feedMessage(response);
          console.log(response.data);
        }
      }

      function abrirModalLoginAdmin() {

        vm.modal = $uibModal.open({
          templateUrl: 'src/core/auth/modal-login.html?',
          backdrop: 'static',
          scope: $scope,
          size: 'md',
          keyboard: false
        });

      }

      function fechaModalLoginAdmin() {
        if (vm.modal) {
          vm.modal.close();
          delete vm.modal;
        }
      }

    }


})();