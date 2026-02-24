(function () {
	'use strict';

	angular
		.module('usuario.usuario')
		.factory('UsuarioUtils', UsuarioUtils);

	UsuarioUtils.$inject = ['controller', 'UsuarioRest'];

	function UsuarioUtils(utils, dataservice) {

		var service = {
			buscarMenu: buscarMenu,
			alterarSenha: alterarSenha
		};

		return service;

		function buscarMenu() {

			return dataservice.buscarMenu().then(success).catch(error);

			function success(response) {
				return utils.criarRetornoPromise(true, utils.ler(response, 'data'));
			}

			function error(response) {
				return utils.criarRetornoPromise(false, []);
			}

		}

		function alterarSenha(dados) {
            return dataservice.alterarSenha(dados);
        }
		
	}
	
})();