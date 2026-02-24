(() => {

  'use strict';

  angular
    .module('app.contrato')
    .factory('ContratoRest', dataservice);

  dataservice.$inject = ['$http', '$httpParamSerializer', 'RestUtils', 'ConfigRest'];

  function dataservice($http, $httpParamSerializer, RestUtils, ConfigRest) {

    let service = new RestUtils(ConfigRest.contrato);

    service.buscarVencimentoProximo = buscarVencimentoProximo;
    service.carregarComboEquipe = carregarComboEquipe;

    service.urlImportacaoUE = service.url + '/carregar-arquivo-unidade-escolar';
    service.urlImportacaoCargo = service.url + '/carregar-arquivo-cargo';


    return service;

    function buscarVencimentoProximo(quantidadeDias) {
      return $http.get(service.url + '/vencimento-proximo/' + quantidadeDias);
    }

    function carregarComboEquipe(data) {
      return $http.get(service.url + '/combo-equipe?' + $httpParamSerializer(data));
    }

  }

})();