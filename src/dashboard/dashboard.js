(function () {

    'use strict';

    angular
        .module('app.dashboard')
        .controller('Dashboard', Dashboard);

    Dashboard.$inject = ['controller', '$sce', '$rootScope', '$scope', '$uibModal', 'ContratoUtils', 'OcorrenciaUtils', 'OcorrenciaMensagemUtils', 'ConfiguracaoUtils'];

    function Dashboard(controller, $sce, $rootScope, $scope, $uibModal, ContratoUtils, OcorrenciaUtils, OcorrenciaMensagemUtils, ConfiguracaoUtils) {

        /* jshint validthis: true */
        var vm = this;

        vm.instancia = {};
        vm.tabela = {};

        vm.options = {
            minMode: 'day',
            maxDate: moment()
        };

        vm.abrirModalContrato = abrirModalContrato;
        vm.abrirModalPrestadores = abrirModalPrestadores;
        vm.fecharModal = fecharModal;

        iniciar();

        function iniciar() {

            if (!$rootScope.logado) {
                return;
            }

            if ($rootScope.usuario.usuarioOrigem.codigo === 'sme') {
                buscarContratosVencimentoProximo();
                buscarPrestadoresComReincidencia();
            }

            if (['ue', 'dre'].includes($rootScope.usuario.usuarioOrigem.codigo)) {
                buscarNoticias();
            }

            if (['ue', 'ps'].includes($rootScope.usuario.usuarioOrigem.codigo)) {
                buscarUltimasOcorrencias();
                buscarUltimasMensagens();
            }

        }

        function buscarContratosVencimentoProximo() {

            ContratoUtils.buscarVencimentoProximo(180).then((response) => {
                const contratoList = response.objeto;
                vm.contratoList90 = contratoList.filter(c => c.dias <= 90);
                vm.contratoList180 = contratoList.filter(c => (c.dias > 90 && c.dias <= 180));
            });

        }

        function buscarPrestadoresComReincidencia() {
            OcorrenciaUtils.buscarPrestadoresComReincidencia().then((response) => {
                vm.prestadorComReincidenciaList = response.objeto;
            });
        }

        function buscarUltimasOcorrencias() {
            OcorrenciaUtils.buscarUltimos().then((response) => {
                vm.ultimasOcorrencias = response.objeto;
            });
        }

        function buscarUltimasMensagens() {
            OcorrenciaMensagemUtils.buscarUltimos().then((response) => {
                vm.ultimasMensagens = response.objeto;
            });
        }

        function buscarNoticias() {

            ConfiguracaoUtils.buscar('TEXTO_NOTICIA').then(success).catch(error);

            function success(response) {
                vm.conteudoNoticia = $sce.trustAsHtml(response.objeto.descricao);
                if (vm.conteudoNoticia === '') {
                    vm.conteudoNoticia = 'Nenhuma informação disponível.'
                }
            }

            function error(response) {
                console.log(response)
                controller.feed('error', 'Hove um erro ao buscar o conteúdo de notícias.');
                vm.conteudoNoticia = null;
            }

        }

        function abrirModalContrato(contratoList) {

            if (!contratoList || contratoList.length == 0) {
                return;
            }

            vm.modal = $uibModal.open({
                templateUrl: 'src/dashboard/sections/modal-contratos-a-vencer.html?' + new Date(),
                backdrop: 'static',
                scope: $scope,
                size: 'lg',
                keyboard: true
            });

            vm.modal.contratoList = angular.copy(contratoList);

        }

        function abrirModalPrestadores() {

            if (!vm.prestadorComReincidenciaList || vm.prestadorComReincidenciaList.length == 0) {
                return;
            }

            vm.modal = $uibModal.open({
                templateUrl: 'src/dashboard/sections/modal-prestadores-reincidentes.html?' + new Date(),
                backdrop: 'static',
                scope: $scope,
                size: 'lg',
                keyboard: true
            });

        }

        function fecharModal() {
            vm.modal.close();
            delete vm.modal;
        }

    }

})();