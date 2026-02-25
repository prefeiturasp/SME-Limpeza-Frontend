(function () {

  'use strict';

  angular
    .module('app')
    .config(routes);

  routes.$inject = ['$routeProvider'];

  function routes($routeProvider) {

    $routeProvider
      .when('/plano-trabalho/unidade-escolar', {
        templateUrl: 'src/plano-trabalho/plano-trabalho-unidade-escolar/plano-trabalho-unidade-escolar-lista.html',
        controller: 'PlanoTrabalhoUnidadeEscolarController',
        controllerAs: 'vm',
        reloadOnSearch: false
      });

  }

})();