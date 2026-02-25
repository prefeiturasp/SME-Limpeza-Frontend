(function () {
	
	'use strict';
	
	angular
	.module('configuracao.configuracao-variavel-gerencial')
	.controller('ConfiguracaoVariavelGerencial', ConfiguracaoVariavelGerencial);
	
	ConfiguracaoVariavelGerencial.$inject = ['$rootScope', 'SweetAlert', '$scope', '$routeParams', 'controller', 
	'$location', '$uibModal', 'OcorrenciaTipoUtils'];
	
	function ConfiguracaoVariavelGerencial($rootScope, SweetAlert, $scope, $routeParams, controller, 
		$location, $uibModal, OcorrenciaTipoUtils) {
		/* jshint validthis: true */

		var vm = this;

		vm.abrirModalOcorrencia = abrirModalOcorrencia;
		vm.fecharModalOcorrencia = fecharModalOcorrencia;
		vm.salvarOcorrencia = salvarOcorrencia;
		vm.removerOcorrencia = removerOcorrencia;
		vm.salvar = salvar;
		vm.remover = remover;
		vm.redirecionarConfiguracao = redirecionarConfiguracao;

		iniciar();
		
		function iniciar() {
			buscar($routeParams.id);
		}

		function buscar(idOcorrenciaTipo) {

			OcorrenciaTipoUtils.buscar(idOcorrenciaTipo).then(success).catch(error);

			function success(response) {
				vm.ocorrenciaTipo = response.objeto;
			}

			function error(response) {
				controller.feed('error', 'Erro ao buscar as variáveis.');
				vm.ocorrenciaTipo = [];
			}

		}

		function abrirModalOcorrencia(index, ocorrencia) {

			vm.modal = $uibModal.open({
				templateUrl: 'src/configuracao/configuracao-variavel-gerencial/configuracao-variavel-gerencial-form.html?' + new Date(),
				backdrop: 'static',
				scope: $scope,
				size: 'lg',
				keyboard: false
			});

			vm.modal.model = angular.isDefined(ocorrencia) ? angular.copy(ocorrencia) : {};
			vm.modal.index = index;
			vm.modal.isEditar = angular.isDefined(ocorrencia);
			
		}

		function fecharModalOcorrencia() {
			vm.modal.close();
			delete vm.modal;
		}

		function salvarOcorrencia(formulario) {

			if(formulario.$invalid) {
				return;
			}

			if(parseInt(vm.modal.model.peso) <= 0 || parseInt(vm.modal.model.peso) > 100) {
				controller.feed('warning', 'O peso deve ser entre 1 e 100.');
				return;
			}

			if(vm.modal.isEditar) {
				let item = vm.ocorrenciaTipo.variaveis[vm.modal.index];
				item.descricao = vm.modal.model.descricao;
				item.peso = vm.modal.model.peso;
				item.descricaoConforme = vm.modal.model.descricaoConforme;
				item.descricaoConformeComRessalva = vm.modal.model.descricaoConformeComRessalva;
				item.descricaoNaoConforme = vm.modal.model.descricaoNaoConforme;
			} else {
				vm.ocorrenciaTipo.variaveis.push(angular.copy(vm.modal.model));
			}
			
			fecharModalOcorrencia();

		}

		function removerOcorrencia(index) {

			SweetAlert.swal({
                title: "Tem certeza?",	
                text: "Você não poderá desfazer essa ação!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3f51b5',
                cancelButtonColor: '#ff4081',
                confirmButtonText: "Remover",
                cancelButtonText: 'Cancelar',
                closeOnConfirm: true,
            }, (isConfirm) => { 
				if(!isConfirm) return;
				vm.ocorrenciaTipo.variaveis.splice(index, 1);
			});

		}

		function salvar(formulario) {

			if(formulario.$invalid) {
				return;
			}

			if(parseInt(vm.ocorrenciaTipo.peso) <= 0 || parseInt(vm.ocorrenciaTipo.peso) > 100) {
				controller.feed('warning', 'O peso deve ser entre 1 e 100.');
				return;
			}

			if(vm.ocorrenciaTipo.variaveis?.length === 0) {
				controller.feed('warning', 'Nenhuma variável cadastrada.');
				return;
			}

			const pesoTotal = (vm.ocorrenciaTipo.variaveis).reduce((accumulator, ov) => accumulator + parseInt(ov.peso), 0 );
			if(pesoTotal !== 100) {
				controller.feed('warning', `A soma dos pesos é ${pesoTotal}, mas deve ser igual a 100.`);
				return;
			}

			OcorrenciaTipoUtils.inserir(vm.ocorrenciaTipo).then((response) => {
				controller.feed('success', 'A variável gerencial foi cadastrada com sucesso.');
				redirecionarConfiguracao();
			}).catch((error) => {
				controller.feed('error', 'Houve um erro ao cadastrar a variável gerencial.');	
			});

		}

		function remover() {

			SweetAlert.swal({
                title: "Tem certeza?",	
                text: "Você não poderá desfazer essa ação!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3f51b5',
                cancelButtonColor: '#ff4081',
                confirmButtonText: "Remover",
                cancelButtonText: 'Cancelar',
                closeOnConfirm: true,
            }, (isConfirm) => { 
				if(!isConfirm) return;
				OcorrenciaTipoUtils.remover(vm.ocorrenciaTipo.id).then((response) => {
					controller.feed('success', 'Registro removido com sucesso.');
					redirecionarConfiguracao();
				}).catch((error) => {
					controller.feed('error', 'Erro ao remover registro.');	
				});
			});

		}

		function redirecionarConfiguracao() {
			$rootScope.$evalAsync(() => $location.path('configuracao'));
		}

	}
	
})();