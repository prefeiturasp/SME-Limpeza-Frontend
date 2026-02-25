(function () {

  'use strict';

  angular
    .module('app.contrato')
    .factory('ContratoUtils', ContratoUtils);

  ContratoUtils.$inject = ['controller', 'ContratoRest'];

  function ContratoUtils(utils, dataservice) {

    let service = {
      buscar: buscar,
      buscarVencimentoProximo: buscarVencimentoProximo,
      carregarCombo: carregarCombo,
      carregarComboTodos: carregarComboTodos,
      carregarComboEquipe: carregarComboEquipe
    };

    return service;

    function buscar(id) {

      return dataservice.buscar(id).then(success).catch(error);

      function success(response) {
        return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
      }

      function error(response) {
        return utils.criarRetornoPromise(false, {});
      }

    }

    function buscarVencimentoProximo(quantidadeDias) {

      return dataservice.buscarVencimentoProximo(quantidadeDias).then(success).catch(error);

      function success(response) {
        return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
      }

      function error(response) {
        return utils.criarRetornoPromise(false, []);
      }

    }

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

    function carregarComboEquipe(data) {
      return dataservice.carregarComboEquipe(data);
    }

  }

})();