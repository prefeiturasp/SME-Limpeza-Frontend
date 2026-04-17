(() => {

  'use strict';

  angular.module('ocorrencia.ocorrencia-retroativa').factory('OcorrenciaRetroativaUtils', OcorrenciaRetroativaUtils);

  OcorrenciaRetroativaUtils.$inject = ['$http', 'ConfigRest', 'OcorrenciaRest'];

  function OcorrenciaRetroativaUtils($http, ConfigRest) {

    var base = ConfigRest.url + 'ocorrencia/ocorrencia-retroativa';

    let service = {
      buscarPrestadoresComReincidencia: buscarPrestadoresComReincidencia,
      buscarUltimos: buscarUltimos,
      comboUesPorIdContrato: comboUesPorIdContrato,
      cadastrarOcorrenciaRetroativa: cadastrarOcorrenciaRetroativa,
      tabela: tabela,
      buscaDataOcorrenciaRetroativa: buscaDataOcorrenciaRetroativa,
      buscaDetalhesOcorrenciaRetroativa: buscaDetalhesOcorrenciaRetroativa,
      buscaOcorrenciaRetroativaAbertaUE: buscaOcorrenciaRetroativaAbertaUE,
      removerOcorrenciaRetroativa: removerOcorrenciaRetroativa,
      editarOcorrenciaRetroativa: editarOcorrenciaRetroativa
    };

    return service;

    function buscarPrestadoresComReincidencia() {

      return dataservice.buscarPrestadoresComReincidencia().then(success).catch(error);

      function success(response) {
        return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
      }

      function error(response) {
        return utils.criarRetornoPromise(false, []);
      }

    }

    function buscarUltimos() {

      return dataservice.buscarUltimos().then(success).catch(error);

      function success(response) {
        return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
      }

      function error(response) {
        return utils.criarRetornoPromise(false, []);
      }

    }

    function comboUesPorIdContrato(idsContratos){

      var url = base + '/comboTodasUesPorIdContrato';

      return $http.post(url, idsContratos).then(function (response) {
        return response.data;
      });

    }

    function cadastrarOcorrenciaRetroativa(dados){

      var url = base + '/cadastrarOcorrenciaRetroativa';

      return $http.post(url, dados).then(function (response) {
        return response.data;
      });

    }

    function editarOcorrenciaRetroativa(dados){

      var url = base + '/editarOcorrenciaRetroativa';

      return $http.post(url, dados).then(function (response) {
        return response.data;
      });

    }

    function tabela(params){

      var url = base + '/tabela?' + params;

      return $http.get(url);

    }

    function buscaDataOcorrenciaRetroativa(idUnidadeEscolar){

      var url = base + '/buscaDataOcorrenciaRetroativa';

      return $http.post(url, idUnidadeEscolar).then(function (response) {
        return response.data;
      });

    }

    function buscaDetalhesOcorrenciaRetroativa(idOcorrenciaRetroativa){
  
      var url = base + '/buscaDetalhesOcorrenciaRetroativa';

      return $http.post(url, { idOcorrenciaRetroativa: idOcorrenciaRetroativa }).then(function (response) {
        return response.data;
      });

    }

    function buscaOcorrenciaRetroativaAbertaUE(idsUnidadeEscolarList){
      
      var url = base + '/buscaOcorrenciaRetroativaAbertaUE';

      return $http.post(url, idsUnidadeEscolarList).then(function (response) {
        return response.data;
      });

    }

    function removerOcorrenciaRetroativa(idOcorrenciaRetroativa){
      var url = base + '/removerOcorrenciaRetroativa';

      return $http.post(url, {idOcorrenciaRetroativa: idOcorrenciaRetroativa}).then(function (response) {
        return response.data;
      });

    }


  }

})();