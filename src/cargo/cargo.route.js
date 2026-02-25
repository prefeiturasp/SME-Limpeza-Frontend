(function () {

  'use strict';

  angular
    .module('app')
    .config(routes);

  routes.$inject = ['$routeProvider'];

  function routes($routeProvider) {

    $routeProvider
      .when('/cargo/', {
        templateUrl: 'src/cargo/cargo-lista.html',
        controller: 'CargoLista',
        controllerAs: 'vm',
        reloadOnSearch: false
      });

  }

})();