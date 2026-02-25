(() => {

  'use strict';

  angular
    .module('relatorio.relatorio-gerencial')
    .factory('RelatorioGerencialUtils', RelatorioGerencialUtils);

  RelatorioGerencialUtils.$inject = ['controller', 'RelatorioGerencialRest'];

  function RelatorioGerencialUtils(utils, dataservice) {

    let service = {
      atualizarValorBruto: atualizarValorBruto,
      remover: remover,
      inserir: inserir
    };

    return service;

    function atualizarValorBruto(idRelatorioGerencial, data) {
      return dataservice.atualizarValorBruto(idRelatorioGerencial, data);
    }

    function remover(idRelatorioGerencial) {
      return dataservice.remover(idRelatorioGerencial);
    }

    function inserir(model) {
      return dataservice.inserir(model);
    }

  }

})();