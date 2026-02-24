(function () {

  'use strict';

  angular.module('core.auth')
    .controller('Login', Login);

  Login.$inject = ['$rootScope', 'controller', 'AuthToken', 'LoginRest', '$location'];

  function Login($rootScope, controller, AuthToken, dataservice, $location) {
    /* jshint validthis: true */

    var vm = this;

    vm.entrar = entrar;

    iniciar();

    function iniciar() {
      $rootScope.logado = false;
      vm.model = {};
    }

    function entrar() {

      dataservice.entrar(vm.model).then(success).catch(error);

      function success(response) {

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

      function error(response) {
        controller.feedMessage(response);
      }

    }

  }

})();