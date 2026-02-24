(() => {

  'use strict';

  angular
    .module('app')
    .config(routes);

  routes.$inject = ['$routeProvider'];

  function routes($routeProvider) {

    $routeProvider
      .when('/relatorio/equipe/', {
        templateUrl: 'src/relatorio/relatorio-equipe/relatorio-equipe-lista.html',
        controller: 'RelatorioEquipeController',
        controllerAs: 'vm',
        reloadOnSearch: false
      })
      .when('/relatorio/equipe/detalhe/:ano/:mes/:idequipe', {
        templateUrl: 'src/relatorio/relatorio-equipe/relatorio-equipe-detalhe/relatorio-equipe-detalhe.html',
        controller: 'RelatorioEquipeDetalheController',
        controllerAs: 'vm',
        reloadOnSearch: false
      });

  }

})();