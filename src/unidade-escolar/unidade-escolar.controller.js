(function () {

  'use strict';

  angular
    .module('app.unidade-escolar')
    .controller('UnidadeEscolarLista', UnidadeEscolarLista);

  UnidadeEscolarLista.$inject = ['$window', '$rootScope', '$scope', '$location', 'controller', 'UnidadeEscolarRest', 'tabela', '$uibModal', 
    'DiretoriaRegionalUtils', 'EnderecoUtils', 'UsuarioRest', 'UsuarioOrigemUtils', 'UsuarioCargoUtils', 'UsuarioStatusUtils', 
    'PrestadorServicoUtils', 'ContratoUtils', 'UnidadeEscolarUtils'];

  function UnidadeEscolarLista($window, $rootScope, $scope, $location, controller, dataservice, tabela, $uibModal, 
    DiretoriaRegionalUtils, EnderecoUtils, UsuarioRest, UsuarioOrigemUtils, UsuarioCargoUtils, UsuarioStatusUtils, PrestadorServicoUtils, ContratoUtils, UnidadeEscolarUtils) {
    /* jshint validthis: true */

    var vm = this;

    vm.instancia = {};
    vm.tabela = {};
    vm.listaUsuariosUE = [];

    vm.abrirModal = abrirModal;
    vm.fecharModal = fecharModal;
    vm.salvar = salvar;

    vm.evtChangeCEP = evtChangeCEP;
    vm.evtChangeEndereco = evtChangeEndereco;
    vm.verificarLatitudeLongitude = verificarLatitudeLongitude;
    vm.verificarLatitude = verificarLatitude;
    vm.verificarLongitude = verificarLongitude;
    vm.recarregarTabela = recarregarTabela;

    vm.abrirModalResponsavelLegal = abrirModalResponsavelLegal;
    vm.fecharModalResponsavelLegal = fecharModalResponsavelLegal;
    vm.salvarResponsavelLegal = salvarResponsavelLegal;
    vm.removerResponsavelLegal = removerResponsavelLegal;
    vm.abrirModalEditUsuario = abrirModalEditUsuario;

    vm.tipoStatus = '';
    vm.statusUe = '';

    vm.abrirMapa = abrirMapa;

    vm.irParaImportacao = irParaImportacao;
    vm.evtChangeUsuarioOrigem = evtChangeUsuarioOrigem;
    
    iniciar();

    function iniciar() {
      carregarComboTipoEscola();
      carregarComboDiretoriaRegional();
      carregarComboUsuarioOrigem();
      carregarComboUsuarioStatus();
      montarTabela();
    }

    function montarTabela() {

      criarOpcoesTabela();

      function carregarObjeto(aData) {
        dataservice.buscar(aData.id).then((response) => {
          abrirModal(aData.id, controller.ler(response, 'data'));
        });
      }

      function criarColunasTabela() {

        var colunas = [
          { data: 'descricao', title: 'Nome da Unidade Escolar' },
          { data: 'codigo', title: 'Código' },
          { data: 'tipo', title: 'Tipo' },
          { data: 'dre', title: 'Nome da DRE' },
          { data: 'id', title: 'Ações', width: 15, cssClass: 'text-right', renderWith: tabela.criarBotaoPadrao }
        ];

        vm.tabela.colunas = tabela.adicionarColunas(colunas);

      }

      function criarOpcoesTabela() {

        vm.tabela.opcoes = tabela.criarTabela(ajax, vm, remover, 'data', carregarObjeto);
        criarColunasTabela();

        function ajax(data, callback, settings) {

          dataservice.tabela(tabela.criarParametros(data, vm.filtros)).then(success).catch(error);

          function success(response) {
            const datatable = controller.lerRetornoDatatable(response);
            callback(datatable);
          }

          function error(response) {
            callback(tabela.vazia());
          }

        }

        function remover(id) {

          dataservice.remover(id).then(success).catch(error);

          function success(response) {
            controller.feed('success', 'Registro removido com sucesso.');
            tabela.recarregarDados(vm.instancia);
          }

          function error(response) {
            controller.feed('error', 'Erro ao remover registro.');
          }

        }

      }

    }

    function salvar(formulario) {
      if (formulario.$invalid) {
        return;
      }

      if (vm.modal && vm.modal.isUsuario) {
        salvarUsuario();
        return;
      }

      if (!verificarLatitudeLongitude()) return;

      if (vm.modal.isEditar) {
        dataservice.atualizar(vm.modal.model.id, vm.modal.model).then(success).catch(error);
      } else {
        dataservice.inserir(vm.modal.model).then(success).catch(error);
      }

      function success(response) {
        controller.feed('success', 'Registro salvo com sucesso.');
        tabela.recarregarDados(vm.instancia);
        fecharModal();
      }

      function error(response) {
        controller.feedMessage(response);
        tabela.recarregarDados(vm.instancia);
      }

    }

    function abrirModal(id, unidadeEscolar) {

      vm.modal = $uibModal.open({
        templateUrl: 'src/unidade-escolar/unidade-escolar-form.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'lg',
        keyboard: false
      });

      buscaUsuariosUe(id);

      vm.modal.model = angular.isDefined(unidadeEscolar) ? angular.copy(unidadeEscolar) : {};
      buscaStatusUePorId(id, vm.modal.model.idStatusUnidadeEscolar);
      vm.modal.model.id = id;
      vm.modal.isEditar = angular.isDefined(unidadeEscolar);

    }

    function fecharModalUsuario() {
      var idUnidadeEscolar = vm.modalUE.model.id;
      vm.modalEditUsu.close();
      delete vm.modalEditUsu;
      vm.modal = vm.modalUE; // Restore vm.modal to the UE modal instance
      delete vm.modalUE;
      buscaUsuariosUe(idUnidadeEscolar);
    }

    function fecharModal() {
      if (vm.modal && vm.modal.isUsuario) {
        fecharModalUsuario();
      } else if (vm.modal) {
        vm.modal.close();
        delete vm.modal;
      }
    }

    function carregarComboTipoEscola() {

      dataservice.carregarComboTipoEscola().then(success).catch(error);

      function success(response) {
        vm.tipoEscolaList = controller.ler(response, 'data');
      }

      function error(response) {
        vm.tipoEscolaList = [];
      }

    }

    function carregarComboDiretoriaRegional() {

      DiretoriaRegionalUtils.carregarCombo().then(success).catch(error);

      function success(response) {
        vm.diretoriaRegionalList = response.objeto;
      }

      function error(response) {
        vm.diretoriaRegionalList = [];
      }

    }

    function evtChangeCEP(formulario) {

      if (formulario.cep.$invalid) {
        return;
      }

      EnderecoUtils.buscarEnderecoPorCep(vm.modal.model.cep).then(success).catch(error);

      function success(response) {
        vm.modal.model.endereco = response.objeto.endereco;
        vm.modal.model.bairro = response.objeto.bairro;
        vm.modal.model.municipio = response.objeto.municipio;
        vm.modal.model.uf = response.objeto.uf;
        evtChangeEndereco(formulario);
      }

      function error(response) {
        vm.modal.model.endereco = '';
        vm.modal.model.bairro = '';
        evtChangeEndereco(formulario);
        controller.feed('error', 'Erro ao consultar CEP.');
      }

    }

    function evtChangeEndereco() {

      vm.modal.model.latitude = '';
      vm.modal.model.longitude = '';

      if (formulario.endereco.$invalid || formulario.numero.$invalid || formulario.cep.$invalid) {
        return;
      }

      if (angular.isUndefined(vm.modal.model.cep)) {
        return;
      }

      const endereco =
        vm.modal.model.endereco + ',' +
        vm.modal.model.numero + ',' +
        vm.modal.model.bairro + ',' +
        vm.modal.model.municipio + ',' +
        vm.modal.model.uf + ',Brasil';

      EnderecoUtils.buscarCoordenadasPorEndereco(endereco).then(success).catch(error);

      function success(response) {

        if (response.objeto.lat && response.objeto.lng) {
          vm.flagErroCoordenadas = false;
          vm.modal.model.latitude = response.objeto.lat;
          vm.modal.model.longitude = response.objeto.lng;
        } else {
          buscarCoordenadasPorCep(vm.modal.model.cep);
        }

      }

      function error(response) {
        vm.flagErroCoordenadas = true;
        controller.feed('error', 'Erro ao consultar coordenadas por endereço.');
      }

    }

    function buscarCoordenadasPorCep(cep) {

      EnderecoUtils.buscarCoordenadasPorCep(cep).then(success).catch(error);

      function success(response) {
        if (response.objeto.lat && response.objeto.lng) {
          vm.modal.model.latitude = response.objeto.lat;
          vm.modal.model.longitude = response.objeto.lng;
        }
      }

      function error(response) {
        controller.feed('error', 'Erro ao consultar coordenadas por CEP.');
      }

    }

    function recarregarTabela() {
      tabela.recarregarDados(vm.instancia);
    }

    function abrirModalResponsavelLegal(indice, responsavelLegal) {

      vm.modalResponsavelLegal = $uibModal.open({
        templateUrl: 'src/unidade-escolar/unidade-escolar-form-responsavel-legal.html?' + new Date(),
        backdrop: 'static',
        scope: $scope,
        size: 'md',
        keyboard: false
      });

      vm.modalResponsavelLegal.model = angular.isDefined(responsavelLegal) ? angular.copy(responsavelLegal) : {};
      vm.modalResponsavelLegal.index = indice;
      vm.modalResponsavelLegal.isEditar = angular.isDefined(responsavelLegal) && angular.isDefined(indice);

    }

    function fecharModalResponsavelLegal() {
      vm.modalResponsavelLegal.close();
      delete vm.modalResponsavelLegal;
    }

    function salvarResponsavelLegal(formularioResponsavelLegal) {

      if (formularioResponsavelLegal.$invalid) {
        return;
      }

      if (vm.modalResponsavelLegal.isEditar) {
        vm.modal.model.responsavelLegalLista[vm.modalResponsavelLegal.index] = angular.copy(vm.modalResponsavelLegal.model);
      } else {
        vm.modal.model.responsavelLegalLista = vm.modal.model.responsavelLegalLista || [];
        vm.modal.model.responsavelLegalLista.push(angular.copy(vm.modalResponsavelLegal.model));
      }

      fecharModalResponsavelLegal();

    }

    function removerResponsavelLegal(indice) {
      vm.modal.model.responsavelLegalLista.splice(indice, 1);
    }

    function abrirMapa() {

      if (!vm.modal.model.latitude || !vm.modal.model.longitude) {
        controller.feed('warning', 'Sem coordenadas para visualizar no mapa.');
        return;
      }

      vm.linkMapa = 'http://www.google.com/maps/place/' + vm.modal.model.latitude + ',' + vm.modal.model.longitude;
      $window.open(vm.linkMapa, '_blank');

    }

    function verificarLatitudeLongitude() {
      return verificarLatitude() && verificarLongitude();
    }

    function verificarLatitude() {
      const regex = /^-?[0-9]{1,3}(?:\.[0-9]{1,10})?$/;
      return regex.test(vm.modal.model.latitude);
    }

    function verificarLongitude() {
      const regex = /^-?[0-9]{1,3}(?:\.[0-9]{1,10})?$/;
      return regex.test(vm.modal.model.longitude);
    }

    function irParaImportacao() {
      $rootScope.$evalAsync(() => {
        $location.path('unidade-escolar/importar');
      });
    }

    function buscaUsuariosUe(idUnidadeEscolar){
      dataservice.buscaUsuariosUe(idUnidadeEscolar).then(success).catch(error);
      function success(response) { 
        vm.listaUsuariosUE = controller.ler(response, 'data'); 
      }
      function error(response) { 
        vm.listaUsuariosUE = []; 
      }
    }

    function abrirModalEditUsuario(idUsuario) {
      UsuarioRest.buscar(idUsuario).then((response) => {
        const usuario = controller.ler(response, 'data');
        vm.modalUE = vm.modal;
        vm.modalEditUsu = $uibModal.open({
          templateUrl: 'src/usuario/usuario/usuario-form.html?' + new Date(),
          backdrop: 'static',
          scope: $scope,
          size: 'lg',
          keyboard: false
        });

        vm.modal = vm.modalEditUsu;
        vm.modal.model = usuario;
        vm.modal.isEditar = true;
        vm.modal.isUsuario = true;

        // Encadeia os carregamentos para garantir que a lógica dependente espere pelos dados
        carregarComboUsuarioOrigem().then(() => {
          evtChangeUsuarioOrigem();
          carregarComboUsuarioStatus();
          carregarComboUnidadeEscolarParaUsuario();
          carregarComboContratoParaUsuario();
        });
      });
    }

    function carregarComboUsuarioOrigem() {
      return UsuarioOrigemUtils.carregarCombo().then(success).catch(error);
      function success(response) {
        vm.usuarioOrigemList = response.objeto;
        return response.objeto;
      }
      function error(err) {
        vm.usuarioOrigemList = [];
        return [];
      }
    }

    function carregarComboUsuarioStatus() {
      return UsuarioStatusUtils.carregarCombo().then(success).catch(error);
      function success(response) {
        vm.usuarioStatusList = response.objeto;
        return response.objeto;
      }
      function error(response) {
        vm.usuarioStatusList = [];
        return [];
      }
    }

    function evtChangeUsuarioOrigem() {
      vm.origemSelecionada = (vm.usuarioOrigemList || []).find(origem => origem.id == vm.modal.model.idUsuarioOrigem);
      carregarComboUsuarioCargo();
      carregarComboOrigemDetalhe();
      if (vm.modal && vm.modal.model) {
        vm.modal.model.unidadeEscolarList = vm.modal.model.unidadeEscolarList || [];
        vm.modal.model.contratoList = vm.modal.model.contratoList || [];
      }
    }

    function carregarComboUsuarioCargo() {
      const idUsuarioOrigem = vm.modal.model.idUsuarioOrigem;
      if (!idUsuarioOrigem) return;
      UsuarioCargoUtils.carregarCombo(idUsuarioOrigem).then(success).catch(error);
      function success(response) { vm.usuarioCargoList = response.objeto; }
      function error(response) { vm.usuarioCargoList = []; }
    }

    function carregarComboOrigemDetalhe() {
      const promessa = (function () {
        switch (vm.origemSelecionada?.codigo) {
          case 'dre': return DiretoriaRegionalUtils.carregarComboTodos();
          case 'ue': return UnidadeEscolarUtils.carregarComboTodos();
          case 'ps': return PrestadorServicoUtils.carregarComboTodos();
          default: return null;
        }
      })();
      if (!promessa) return;
      promessa.then(success).catch(error);
      function success(response) {
        vm.origemDetalheList = response.objeto;
        if (vm.modal && vm.modal.model) {
          const id = vm.modal.model.idOrigemDetalhe?.id || vm.modal.model.idOrigemDetalhe;
          vm.modal.model.idOrigemDetalhe = angular.copy(vm.origemDetalheList.find(od => od.id == id));
        }
      }
      function error(response) { vm.origemDetalheList = []; }
    }

    function carregarComboUnidadeEscolarParaUsuario() {
      return UnidadeEscolarUtils.carregarComboDetalhadoTodos().then(success).catch(error);
      function success(response) {
        vm.unidadeEscolarLista = response.objeto;
        if (vm.modal && vm.modal.model) {
          vm.modal.model.unidadeEscolarList = vm.unidadeEscolarLista.filter(ue => vm.modal.model.unidadeEscolarPermissao?.includes(ue.id));
        }
      }
      function error(response) { vm.unidadeEscolarLista = []; }
    }

    function carregarComboContratoParaUsuario() {
      return ContratoUtils.carregarComboTodos().then(success).catch(error);
      function success(response) {
        vm.contratoLista = response.objeto;
        if (vm.modal && vm.modal.model) {
          vm.modal.model.contratoList = vm.contratoLista.filter(c => vm.modal.model.contratoPermissao?.includes(c.id));
        }
      }
      function error(response) { vm.contratoLista = []; }
    }

    function salvarUsuario() {
      vm.modal.model.idOrigemDetalhe = vm.modal.model.idOrigemDetalhe?.id || vm.modal.model.idOrigemDetalhe;
      UsuarioRest.atualizar(vm.modal.model.id, vm.modal.model).then(success).catch(error);
      function success(response) {
        controller.feed('success', 'Usuário salvo com sucesso.');
        fecharModalUsuario();
      }
      function error(response) { controller.feedMessage(response); }
    }

    function buscaStatusUePorId(idUe, idStatusUe) {

      dataservice.buscaStatusUePorId(idUe, idStatusUe).then(success).catch(error);

      function success(response){
        vm.statusUe = response.data.data.descricao;
        switch(vm.statusUe){
          case 'Ativa': vm.tipoStatus = 'success'; break;
          case 'Inativa': vm.tipoStatus = 'Warning'; break;
          case 'Suspensa': vm.tipoStatus = 'primary'; break;
          case 'Encerrada': vm.tipoStatus = 'danger'; break;
          default: vm.tipoStatus = 'light text-black';
        }
      }

      function error(response) {
        controller.feed('error', 'Erro ao consultar o status da UE.');
      }

    }

  }

})();