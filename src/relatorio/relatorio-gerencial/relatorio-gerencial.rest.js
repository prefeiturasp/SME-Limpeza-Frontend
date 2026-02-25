(() => {

  'use strict';

  angular
    .module('relatorio.relatorio-gerencial')
    .factory('RelatorioGerencialRest', dataservice);

  dataservice.$inject = ['$http', 'RestUtils', 'ConfigRest'];

  function dataservice($http, RestUtils, ConfigRest) {

    const service = new RestUtils(ConfigRest.relatorioGerencial);

    service.avaliar = avaliar;
    service.consolidar = consolidar;
    service.desconsolidar = desconsolidar;
    service.aprovar = aprovar;
    service.reverterAprovacao = reverterAprovacao;
    service.atualizarValorBruto = atualizarValorBruto;

    return service;

    function avaliar(idRelatorioGerencial, data) {
      return $http.post(service.url + '/avaliar/' + idRelatorioGerencial, data);
    }

    function consolidar(idRelatorioGerencial) {
      return $http.post(service.url + '/consolidar/' + idRelatorioGerencial);
    }

    function desconsolidar(idRelatorioGerencial) {
      return $http.post(service.url + '/desconsolidar/' + idRelatorioGerencial);
    }

    function aprovar(idRelatorioGerencial) {
      return $http.post(service.url + '/aprovar/' + idRelatorioGerencial);
    }

    function reverterAprovacao(idRelatorioGerencial) {
      return $http.post(service.url + '/reverter-aprovacao/' + idRelatorioGerencial);
    }

    function atualizarValorBruto(idRelatorioGerencial, data) {
      return $http.patch(service.url + '/valor-bruto/' + idRelatorioGerencial, data);
    }

  }

})();