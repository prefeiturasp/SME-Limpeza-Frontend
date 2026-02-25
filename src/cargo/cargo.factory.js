(function () {
  'use strict';

  angular
    .module('app.cargo')
    .factory('CargoUtils', CargoUtils);

  CargoUtils.$inject = ['controller', 'CargoRest'];

  function CargoUtils(utils, dataservice) {

    let service = {
      carregarCombo: carregarCombo,
      carregarComboTodos: carregarComboTodos
    };

    return service;

    function carregarCombo() {

      return dataservice.carregarCombo().then(success).catch(error);

      function success(response) {
        return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
      }

      function error(response) {
        return utils.criarRetornoPromise(false, []);
      }

    }

    function carregarComboTodos() {

      return dataservice.carregarComboTodos().then(success).catch(error);

      function success(response) {
        return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
      }

      function error(response) {
        return utils.criarRetornoPromise(false, []);
      }

    }

  }
})();