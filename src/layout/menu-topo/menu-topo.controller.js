(function () {
  'use strict';

  angular
    .module('layout.menu-topo')
    .controller('MenuTopoController', MenuTopoController);

  MenuTopoController.$inject = ['$rootScope', 'AuthService', '$scope', 'UsuarioUtils', '$uibModal'];

  function MenuTopoController($rootScope, AuthService, $scope, UsuarioUtils, $uibModal) {

    var vm = this;

    vm.menuActive = '';
    vm.menu = {};
    vm.isMenuMobileOpen = false;
    vm.submenuMobileActive = '';

    vm.logout = logout;

    vm.abrirMenuMobile = abrirMenuMobile;
    vm.abrirSubmenuMobile = abrirSubmenuMobile;

    vm.abrirModalAlterarSenha = abrirModalAlterarSenha;

    $scope.$on('$routeChangeSuccess', function ($event, next, current) {
      changeRouteSuccess(next);
    });

    iniciar();

    $rootScope.$on('$routeChangeStart', () => {
      vm.isMenuMobileOpen = false;
    });

    function iniciar() {

      if ($rootScope.logado) {
        buscarMenu();
        vm.nomeUsuarioLogado = $rootScope.usuario.nome.split(' ').slice(0, 2).join(' ');
      }

    }

    function buscarMenu() {

      UsuarioUtils.buscarMenu().then(success).catch(error);

      function success(response) {
        vm.menuList = response.objeto;
        changeRouteSuccess();
      }

      function error(response) {
        vm.menuList = [];
        controller.feed('error', 'Erro ao montar menu de programas permitidos.');
      }

    }

    function changeRouteSuccess(next) {

      var url = location.pathname;
      if (!angular.isUndefined(next)) {
        url = next.$$route.originalPath;
      }

      var urls = [];
      angular.forEach(vm.menuList, function (menu) {

        if (menu.itemList) {
          angular.forEach(menu.itemList, function (item) {
            urls.push(item.link);
          });
        } else {
          urls.push(menu.link);
        }

      });

      urls.forEach((value) => {
        vm.menuActive = verificaUrl(url, value) ? value : vm.menuActive;
      });

    }

    function verificaUrl(url1, constanteURL) {
      if (!constanteURL) return false;
      return url1.indexOf(constanteURL) > -1;
    }

    function logout() {
      AuthService.logout();
    }

    function abrirMenuMobile() {
      vm.isMenuMobileOpen = !vm.isMenuMobileOpen;
    }

    function abrirSubmenuMobile(indice) {
      if (!vm.isMenuMobileOpen) return;
      vm.submenuMobileActive = indice;
    }

    function abrirModalAlterarSenha() {
      $uibModal.open({
        templateUrl: 'src/usuario/alteracao-senha/alteracao-senha-modal.html',
        controller: 'AlteracaoSenhaController',
        controllerAs: 'vm',
        bindToController: true,
        size: 'sm',
        backdrop: 'static',
        keyboard: false,
      });
    }

  }

})();
