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
  }
})();
