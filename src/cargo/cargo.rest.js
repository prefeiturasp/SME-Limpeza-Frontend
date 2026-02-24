(function () {
  'use strict';

  angular
    .module('app.cargo')
    .factory('CargoRest', dataservice);

  dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];

  function dataservice($http, RestUtils, ConfigRest) {

    let service = new RestUtils(ConfigRest.cargo);

    return service;

  }

})();