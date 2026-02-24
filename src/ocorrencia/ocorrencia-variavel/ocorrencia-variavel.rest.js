(function () {
  'use strict';

  angular
    .module('ocorrencia.ocorrencia-variavel')
    .factory('OcorrenciaVariavelRest', dataservice);

  dataservice.$inject = ['$http', '$httpParamSerializer', 'RestUtils', 'ConfigRest'];

  function dataservice($http, $httpParamSerializer, RestUtils, ConfigRest) {

    var service = new RestUtils(ConfigRest.ocorrenciaVariavel);
    service.carregarComboCadastro = carregarComboCadastro;
    return service;

    function carregarComboCadastro(data) {
      return $http.get(service.url + '/combo-cadastro/?' + $httpParamSerializer(data));
    }

  }

})();