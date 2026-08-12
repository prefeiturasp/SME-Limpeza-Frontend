(function () {
  'use strict';

  angular.module('app.contrato-status').service('ContratoStatusUtils', ContratoStatusUtils);

  ContratoStatusUtils.$inject = ['$http', 'ConfigRest'];

  function ContratoStatusUtils($http, ConfigRest) {
    var base = ConfigRest.url + '/contrato-status';

    this.carregarComboStatusContrato = function () {
      var url = base + '/comboStaContrato';
      // console.log('[ContratoStatusUtils] GET', url);
      return $http.get(url).then(function (response) {
        return response.data;
      });
    };

    this.atualizarStatusContrato = function (data) {
      var url = base + '/atualizarStatusContrato';
      console.log('[ContratoStatusUtils] POST', url);

      let idContrato = data.id;
      let idStatusContrato = data.idStatusContrato;
      let motivoStatusContrato = data.motivoStatusContrato;

      var dados = {
        idContrato: idContrato,
        idStatusContrato: idStatusContrato,
        motivoStatusContrato: motivoStatusContrato
      };
      
      return $http.post(url, dados).then(function (response) {
        return response.data;
      });
    };
  }
})();