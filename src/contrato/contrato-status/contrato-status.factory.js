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

      var dados = {
        idContrato: data.id,
        idStatusContrato: data.idStatusContrato,
        motivoStatusContrato: data.motivoStatusContrato
      };
      
      return $http.post(url, dados).then(function (response) {
        return response.data;
      });
    };

    this.buscaHistoricoStatusContrato = function (idContrato) {
      var url = base + '/historicoStatusContrato';
      console.log('[ContratoHistoricoStatusUtils] POST', url);
     
      var dados = {
        idContrato: idContrato
      };
      
      return $http.post(url, dados).then(function (response) {
        return response.data;
      });
    };


    this.buscarIdUsuPorEmail = function (emailUsu) {
      var url = base + '/buscarIdUsuPorEmail';
      console.log('[BuscarIdUsuPorEmailUtils] POST', url);

       var dados = {
        emailUsu: emailUsu
      };

      return $http.post(url, dados).then(function (response) {
        return response.data;
      });
    };

    this.salvaHistoricoStatusContrato = function (data) {
      var url = base + '/salvaHistoricoStatusContrato';
      console.log('[HistoricoStatusContratoUtils] POST', url);

      var dados = {
        idContrato: data.idContrato,
        statusAntigo: data.statusAntigo,
        statusNovo: data.statusNovo,
        motivoStatus: data.motivoStatus,
        idUsu: data.idUsu
      };
      
      return $http.post(url, dados).then(function (response) {
        return response.data;
      });
    };

  }
})();
