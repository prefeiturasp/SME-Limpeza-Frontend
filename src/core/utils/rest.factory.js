(function () {

  'use strict';

  angular
    .module('core.utils')
    .factory('RestUtils', dataservice);

  dataservice.$inject = ['$http', 'ConfigRest'];

  function dataservice($http, ConfigRest) {

    function RestUtilsFactory(urlFuncionalidade) {

      var service = {
        tabela: tabela,
        atualizar: atualizar,
        inserir: inserir,
        buscar: buscar,
        carregarCombo: carregarCombo,
        carregarComboTodos: carregarComboTodos,
        carregarComboDetalhado: carregarComboDetalhado,
        carregarComboDetalhadoTodos: carregarComboDetalhadoTodos,
        remover: remover,
        url: ConfigRest.url + urlFuncionalidade
      };

      return service;

      function tabela(data) {
        return $http.get(service.url + '/tabela?' + data);
      }

      function atualizar(id, data) {
        return $http.patch(service.url + '/' + id, data);
      }

      function inserir(data) {
        return $http.post(service.url + '/', data);
      }

      function buscar(id) {

        if (angular.isDefined(id)) {
          return $http.get(service.url + '/' + id);
        }

        return $http.get(service.url + '/');

      }

      function carregarCombo(id) {

        if (angular.isDefined(id)) {
          return $http.get(service.url + '/combo/' + id);
        }

        return $http.get(service.url + '/combo');

      }

      function carregarComboTodos() {
        return $http.get(service.url + '/combo-todos');
      }

      function carregarComboDetalhado() {
        return $http.get(service.url + '/combo-detalhado');
      }

      function carregarComboDetalhadoTodos() {
        return $http.get(service.url + '/combo-detalhado-todos');
      }

      function remover(id) {
        return $http.delete(service.url + '/' + id);
      }

    }

    return RestUtilsFactory;

  }

})();