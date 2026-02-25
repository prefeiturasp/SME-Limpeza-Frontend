(() => {

	'use strict';

	angular
	.module('app')
	.config(routes);

	routes.$inject = ['$routeProvider'];

	function routes($routeProvider) {

		$routeProvider
		.when('/relatorio/agendamento-manual/', {
			templateUrl: 'src/relatorio/relatorio-agendamento-manual/relatorio-agendamento-manual-lista.html',
			controller: 'RelatorioAgendamentoManualController',
			controllerAs: 'vm',
			reloadOnSearch: false
		});

	}

})();