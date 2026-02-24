(function () {

  'use strict';

  angular
    .module('plano-trabalho-unidade-escolar.cadastro')
    .controller('CadastroController', CadastroController);

  CadastroController.$inject = ['$rootScope', 'controller', 'PlanoTrabalhoUnidadeEscolarRest', 'PeriodicidadeUtils',
    'AmbienteUnidadeEscolarUtils', 'PlanoTrabalhoMatrizUtils', 'TurnoUtils', 'AmbienteGeralUtils', 'UnidadeEscolarUtils', 'SweetAlert'];

  function CadastroController($rootScope, controller, dataservice, PeriodicidadeUtils,
    AmbienteUnidadeEscolarUtils, PlanoTrabalhoMatrizUtils, TurnoUtils, AmbienteGeralUtils, UnidadeEscolarUtils, SweetAlert) {

    var vm = this;

    vm.limit = 10;

    vm.salvar = salvar;
    vm.evtChangeAmbienteGeral = evtChangeAmbienteGeral;
    vm.evtChangePeriodicidade = evtChangePeriodicidade;
    vm.evtChangeTurno = evtChangeTurno;
    vm.fecharModal = fecharModal;
    vm.loadMore = loadMore;
    vm.getAmbientesSelecionados = getAmbientesSelecionados;
    vm.verificarFormulario = verificarFormulario;
    vm.aprovar = aprovar;

    vm.optionsSummernote = {
      height: 332,
      focus: true,
      toolbar: [
        ['edit', ['undo', 'redo']],
        ['alignment', ['ul', 'ol']]
      ]
    };

    vm.optionsDatePicker = {
      minMode: 'day',
      minDate: moment()
    };

    vm.diaSemanaList = [
      { id: 1, descricao: 'Segunda-feira' },
      { id: 2, descricao: 'Terça-feira' },
      { id: 3, descricao: 'Quarta-feira' },
      { id: 4, descricao: 'Quinta-feira' },
      { id: 5, descricao: 'Sexta-feira' },
    ];

    iniciar();

    async function iniciar() {

      vm.model = Object.assign({}, vm.$resolve.modalOptions);
      vm.isEditar = angular.isDefined(vm.model.idPlanoTrabalhoUnidadeEscolar);
      vm.model.dataInicial = vm.isEditar ? new Date(moment(vm.model.dataInicial).format('YYYY-MM-DD') + 'T00:00:00') : null;

      carregarComboUnidadeEscolar();
      carregarComboAmbienteGeral();
      carregarComboTurno();
      carregarComboPeriodicidade();

    }

    async function carregarComboUnidadeEscolar() {

      UnidadeEscolarUtils.carregarComboTodos().then(success).catch(error);

      function success(response) {
        vm.unidadeEscolarList = response.objeto;

      }

      function error(response) {
        vm.unidadeEscolarList = [];
        controller.feed('error', 'Houve um erro ao carregar as unidades escolares.');
      }

    }

    async function carregarComboAmbienteGeral() {

      AmbienteGeralUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.ambienteGeralList = response.objeto;
      }

      function error(response) {
        vm.ambienteGeralList = [];
        controller.feed('error', 'Erro ao buscar lista de ambientes.');
      }

    }

    function carregarComboTurno() {

      TurnoUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.turnoList = response.objeto;
      }

      function error(response) {
        vm.turnoList = [];
        controller.feed('error', 'Erro ao buscar turnos.');
      }

    }

    function carregarComboPeriodicidade() {

      PeriodicidadeUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.periodicidadeList = response.objeto;
      }

      function error(response) {
        vm.periodicidadeList = [];
        controller.feed('error', 'Erro ao buscar periodicidades.');
      }

    }

    function evtChangeAmbienteGeral() {

      carregarPlanoTrabalhoMatriz();

      AmbienteUnidadeEscolarUtils.carregarComboPorAmbienteGeral(vm.model.unidadeEscolar?.id, vm.model.idAmbienteGeral).then(success).catch(error);

      function success(response) {
        vm.ambienteUnidadeEscolarList = response.objeto;
      }

      function error(response) {
        vm.ambienteUnidadeEscolarList = [];
        controller.feed('error', 'Erro ao buscar a lista de ambientes da unidade escolar.');
      }

    }

    function evtChangePeriodicidade() {
      vm.model.dataInicial = null;
      vm.model.diaSemana = null;
      carregarPlanoTrabalhoMatriz();
    }

    function evtChangeTurno() {
      carregarPlanoTrabalhoMatriz();
    }

    function carregarPlanoTrabalhoMatriz() {

      if (!vm.model.idAmbienteGeral || !vm.model.idPeriodicidade || !vm.model.idTurno) {
        return;
      }

      PlanoTrabalhoMatrizUtils.buscarPorAmbienteGeralPeriodicidadeTurno(
        vm.model.idAmbienteGeral, vm.model.idPeriodicidade, vm.model.idTurno
      ).then(success).catch(error);

      function success(response) {
        vm.model.descricao = response.objeto?.descricao;
      }

      function error(response) {
        vm.model.descricao = null;
        controller.feed('error', 'Erro ao buscar o plano de trabalho.');
      }

    }

    function salvar(formulario) {

      if (!verificarFormulario(formulario)) {
        return;
      }

      vm.model.idAmbienteUnidadeEscolarList = getAmbientesSelecionados().map(a => a.id);

      if (vm.isEditar) {
        dataservice.atualizar(vm.model.idPlanoTrabalhoUnidadeEscolar, vm.model).then(success).catch(error);
      } else {
        dataservice.inserir(vm.model).then(success).catch(error);
      }

      function success(response) {
        controller.feed('success', 'Plano de trabalho salvo com sucesso.');
        fecharModal(true);
      }

      function error(response) {
        controller.feed('error', 'Erro ao salvar o plano de trabalho.');
      }

    }

    function fecharModal(result = false) {
      vm.$close({ DataSend: result });
    }

    function loadMore(last, inview) {
      if (last && inview) {
        vm.limit += 10;
      }
    }

    function getAmbientesSelecionados() {

      if (!vm.ambienteUnidadeEscolarList) {
        return [];
      }

      return vm.ambienteUnidadeEscolarList.filter((ambiente) => {
        return ambiente.isSelected;
      });

    }

    function verificarFormulario(formulario) {

      if (formulario.$invalid) {
        return false;
      }

      if (!vm.isEditar && getAmbientesSelecionados().length == 0) {
        return false;
      }

      if (calcularCaracteresDescricao() < 3) {
        return false;
      }

      return true;

    }

    function calcularCaracteresDescricao() {

      if (!vm.model || !vm.model.descricao) {
        return 0;
      }

      let plainText = vm.model.descricao
        .replace(/<\/p>/gi, "\n")
        .replace(/<br\/?>/gi, "\n")
        .replace(/&nbsp;/gi, "")
        .replace(/<\/?[^>]+(>|$)/g, "");

      return plainText.length;

    }

    function aprovar() {

      if ($rootScope.usuario.usuarioOrigem.codigo !== 'ue' && $rootScope.usuario.usuarioCargo.id !== 2) {
        return;
      }

      SweetAlert.swal({
        title: "Tem certeza?",
        text: "Após aprovar, não será possível reverter essa ação!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: '#3F51B5',
        cancelButtonColor: '#FF4081',
        confirmButtonText: 'Aprovar',
        cancelButtonText: 'Cancelar',
        closeOnConfirm: true,
      }, (isConfirm) => {
        if (isConfirm) {
          dataservice.aprovar(vm.model.idPlanoTrabalhoUnidadeEscolar).then(() => {
            controller.feed('success', 'Plano de trabalho aprovado com sucesso.');
            fecharModal(true);
          }).catch(() => {
            controller.feed('error', 'Erro ao aprovar o plano de trabalho.');
          });
        }
      });

    }

  }

})();