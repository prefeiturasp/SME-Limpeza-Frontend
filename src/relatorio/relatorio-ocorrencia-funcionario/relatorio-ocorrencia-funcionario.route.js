(() => {

  'use strict';

  angular
    .module('app')
    .config(routes);

  routes.$inject = ['$routeProvider'];

  function routes($routeProvider) {

    $routeProvider
      .when('/relatorio/ocorrencia-funcionario/', {
        templateUrl: 'src/relatorio/relatorio-ocorrencia-funcionario/relatorio-ocorrencia-funcionario-lista.html',
        controller: 'RelatorioOcorrenciaFuncionarioController',
        controllerAs: 'vm',
        reloadOnSearch: false
      });

  }

})();