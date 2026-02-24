(function () {

  'use strict';

  angular
    .module('usuario.alteracao-senha')
    .controller('AlteracaoSenhaController', controller);

  controller.$inject = ['controller', 'UsuarioUtils'];

  function controller(controller, UsuarioUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.salvar = salvar;
    vm.fecharModal = fecharModal;

    function salvar(formulario) {

      if (formulario.$invalid || !validarValores()) return;

      UsuarioUtils.alterarSenha(vm.model).then(success).catch(error);

      function success(response) {
        controller.feed('success', 'Senha alterada com sucesso.');
        fecharModal();
      }

      function error(response) {
        controller.feedMessage(response);
      }

    }

    function validarValores() {
      if (vm.model.novaSenha !== vm.model.confirmacaoNovaSenha) {
        controller.feed('error', 'A nova senha e confirmação da senha devem ser iguais.');
        return false;
      }

      if (vm.model.senhaAtual == vm.model.novaSenha) {
        controller.feed('error', 'A nova senha deve ser diferente da senha atual.');
        return false;
      }

      return true;
    }

    function fecharModal() {
      vm.$close();
    }

  }

})();