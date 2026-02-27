/*jshint -W053 */
(function () {
  'use strict';

  angular
    .module('core.utils')
    .factory('mensagem', mensagem);

  mensagem.$inject = ['toastr'];

  function mensagem(toastr) {

    var service = {
      feedMessage: feedMessage,
      feed: feed,
      msgAttr: mensagemComAtributo,
      type: messageType
    };

    var defaultMessage = {
      EMPTY_DATA: 'Não foi possível se conectar ao serviço.',
      SUCCESS: 'Sucesso ao efetuar a operação.',
      ERROR: 'Ocorreu um erro ao efetuar a operação.'
    };

    var messageType = {
      INFO: 'info',
      SUCCESS: 'success',
      WARNING: 'warning',
      ERROR: 'error'
    };

    initToastr();

    return service;

    function getTitle(type) {
      switch (type) {
        case 'success': return 'Sucesso!';
        case 'info': return 'Informação!';
        case 'warning': return 'Atenção!';
        case 'error': return 'Erro!';
      }
    }

    function getLoader(type) {
      switch (type) {
        case 'success': return '#f96868';
        case 'info': return '#46c35f';
        case 'warning': return '#57c7d4';
        case 'error': return '#f2a654';
      }
    }

    function feed(type, message, tempo = 3000) {
      $.toast({
        heading: getTitle(type),
        text: message,
        showHideTransition: 'slide',
        icon: type,
        loaderBg: getLoader(type),
        position: 'bottom-right',
        hideAfter: tempo
      });
    }

    function feedDefault(executed) {
      if (executed) {
        toastr[messageType.SUCCESS](defaultMessage.SUCCESS);
      } else {
        toastr[messageType.ERROR](defaultMessage.ERROR);
      }
    }

    function feedMessage(response) {

      var data = response.data.msg || {};

      if (angular.equals({}, data)) {
        toastr[messageType.ERROR](defaultMessage.EMPTY_DATA);
        return;
      }

      feed(data.status ? 'success' : 'error', data);

    }

    function initToastr() {
      toastr.options.timeOut = 2000;
      toastr.options.progressBar = true;
      toastr.options.closeButton = true;
      toastr.options.positionClass = 'toast-bottom-right';
      toastr.options.preventDuplicates = true;
    }

    function mensagemComAtributo(mensagemAttr, array) {
      var retorno = new String(mensagemAttr);

      angular.forEach(array, function (value, index) {
        retorno = retorno.replace('{' + index + '}', value);
      });

      return retorno;

    }

  }

})();