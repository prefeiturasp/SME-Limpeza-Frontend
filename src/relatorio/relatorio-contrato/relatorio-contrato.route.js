(() => {

  'use strict';

  angular
    .module('app')
    .config(routes);

  routes.$inject = ['$routeProvider'];

  function routes($routeProvider) {

    $routeProvider
      .when('/relatorio/contrato/', {
        templateUrl: 'src/relatorio/relatorio-contrato/relatorio-contrato-lista.html',
        controller: 'RelatorioContratoController',
        controllerAs: 'vm',
      })
      .when('/relatorio/contrato/detalhe', {
        templateUrl: 'src/relatorio/relatorio-contrato/relatorio-contrato-detalhe/relatorio-contrato-detalhe.html',
        controller: 'RelatorioContratoDetalheController',
        controllerAs: 'vm',
      })
      .when('/relatorio/contrato/importar', {
        templateUrl: 'src/relatorio/relatorio-contrato/relatorio-contrato-importacao/relatorio-contrato-importacao.html',
        controller: 'RelatorioContratoImportacaoController',
        controllerAs: 'vm',
      });

  }

})();