(function () {
  'use strict';

  angular
    .module('app.unidade-escolar-status')
    .service('UnidadeEscolarStatusUtils', UnidadeEscolarStatusUtils);

  UnidadeEscolarStatusUtils.$inject = ['$http', 'ConfigRest'];

  function UnidadeEscolarStatusUtils($http, ConfigRest) {
    var base = ConfigRest.url + '/unidade-escolar-status';

    this.carregarCombo = function () {
      var url = base + '/combo';
      console.log('[UnidadeEscolarStatusUtils] GET', url);
      return $http.get(url)
        .then(function (response) {
          return response.data;
        });
    };

    this.buscaHistoricoStatusUE = function (idContrato, idUe) {
      var url = base + '/historicoStatusUE';
      console.log('[UnidadeEscolarHistoricoStatusUtils] POST', url);
     
      var dados = {
        idContrato: idContrato,
        idUe: idUe
      };
      
      return $http.post(url, dados).then(function (response) {
        return response.data;
      });
    };

    this.salvaHistoricoStatusUE = function (data) {
      var url = base + '/salvaHistoricoStatusUE';
      console.log('[HistoricoStatusUEUtils] POST', url);

      var dados = {
        idContrato: data.idContrato,
        idUe: data.idUe,
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
