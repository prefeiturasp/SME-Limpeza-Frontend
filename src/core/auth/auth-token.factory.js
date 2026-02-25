(function () {
  'use strict';

  angular
    .module('core.auth')
    .factory('AuthToken', AuthToken);

  AuthToken.$inject = ['$localStorage'];

  /* @ngInject */
  function AuthToken($localStorage) {

    var service = {
      deleteToken: deleteToken,
      getToken: getToken,
      setToken: setToken,
      ler: ler
    };

    return service;
    //////////////

    function ler() {

      if ($localStorage.accessToken) {
        return $localStorage.accessToken == 'notAuth' ? false : $localStorage.accessToken;
      }

      return false;
    }

    function deleteToken(id) {
      delete $localStorage[id];
    }

    function getToken(id) {
      return $localStorage[id];
    }

    function setToken(token, id) {
      $localStorage[id] = token;
    }

  }

})();	