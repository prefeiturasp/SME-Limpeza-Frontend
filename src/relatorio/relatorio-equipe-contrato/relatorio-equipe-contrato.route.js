(() => {

  'use strict';

  angular
    .module('app')
    .config(routes);

  routes.$inject = ['$routeProvider'];

  function routes($routeProvider) {

    $routeProvider
      .when('/relatorio/equipe-contrato/', {
        templateUrl: 'src/relatorio/relatorio-equipe-contrato/relatorio-equipe-contrato-lista.html',
        controller: 'RelatorioEquipeContratoController',
        controllerAs: 'vm',
        reloadOnSearch: false
      });

  }

})();