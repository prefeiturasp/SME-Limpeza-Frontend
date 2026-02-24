(function () {
  'use strict';

  angular
    .module('core.auth')
    .factory('AuthService', AuthService);

  AuthService.$inject = ['controller', '$rootScope', 'AuthToken'];

  /* @ngInject */
  function AuthService(controller, $rootScope, AuthToken) {

    var service = {
      logout: logout,
    };

    return service;

    function logout() {
      $rootScope.logado = false;
      AuthToken.deleteToken('accessToken');
      controller.$location.path('/login');
    }

  }

})();
