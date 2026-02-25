(function () {

	'use strict';

	angular
		.module('app')
		.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/ocorrencia/', {
			templateUrl: 'src/ocorrencia/ocorrencia-lista.html',
			controller: 'OcorrenciaLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		}).when('/ocorrencia/detalhe/:id', {
			templateUrl: 'src/ocorrencia/ocorrencia-detalhe/ocorrencia-detalhe.html',
			controller: 'OcorrenciaDetalheController',
			controllerAs: 'vm',
			reloadOnSearch: false
		}).when('/ocorrencia/mensagem', {
			templateUrl: 'src/ocorrencia/ocorrencia-mensagem/ocorrencia-mensagem-lista.html',
			controller: 'OcorrenciaMensagemLista',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();