/*jshint sub:true*/
(function () {
  'use strict';

  angular
    .module('core.utils')
    .factory('tabela', tabela);

  tabela.$inject = [
    'controller',
    '$compile',
    'DTColumnBuilder',
    'DTOptionsBuilder',
    '$httpParamSerializer',
    'datatables',
    '$q',
    'moment',
    'SweetAlert'];

  function tabela(
    controller,
    $compile,
    DTColumnBuilder,
    DTOptionsBuilder,
    $httpParamSerializer,
    datatables,
    $q,
    moment,
    SweetAlert) {

    var service = {
      adicionarColunas: adicionarColunas,
      booleanParaBadgeSimNao: booleanParaBadgeSimNao,
      encerradoAutomaticamente: encerradoAutomaticamente,
      inteiroParaPercentual: inteiroParaPercentual,
      criarBotaoPadrao: criarBotaoPadrao,
      criarBotaoRemocao: criarBotaoRemocao,
      criarColunas: criarColunas,
      criarTabela: criarTabela,
      criarParametros: criarParametros,
      recarregarDados: recarregarDados,
      substituirValorNulo: substituirValorNulo,
      vazia: vazia,
      formatarData: formatarData,
      formatarHora: formatarHora,
      formatarDataHora: formatarDataHora,
      formatarCnpj: formatarCnpj,
      formatarTelefone: formatarTelefone,
      formatarValorMonetario: formatarValorMonetario,
      formatarNumero: formatarNumero,
      formatarPrestadorServico: formatarPrestadorServico,
      formatarUnidadeEscolar: formatarUnidadeEscolar,
      evtRemover: evtRemover,
      booleanParaBadgeAtivoEncerrado: booleanParaBadgeAtivoEncerrado,
      formatarContrato: formatarContrato,
      formatarStatusContrato: formatarStatusContrato,
      formatarStatusContratoRetroativo: formatarStatusContratoRetroativo,
      criarBotoesTabOcorrenciaRetroativa: criarBotoesTabOcorrenciaRetroativa
    };

    return service;

    function adicionarColunas(colunas) {
     
      var dtColumns = [];

      angular.forEach(colunas, function (value, key) {
        criarColuna(value, { lista: dtColumns });
      });

      return dtColumns;

    }

    function criarColuna(value, obj, data) {
     
      var column = DTColumnBuilder
        .newColumn(value.data)
        .withTitle(value.title)
        .withOption('name', value.name ? value.name : value.data);

      adicionarHtml(value, { col: column });

      adicionarClasseCss(value, { col: column });

      adicionarLargura(value, { col: column });

      adicionarOrdenacao(value, { col: column });

      adicionarSearchable(value, { col: column });

      removerVisibilidade(value, { col: column });

      obj.lista.push(column);

    }

    function adicionarHtml(value, obj) {
      if (value.renderWith) {
        obj.col.renderWith(value.renderWith);
      }
    }

    function adicionarClasseCss(value, obj) {
      if (value.cssClass) {
        obj.col.withClass(value.cssClass);
      }
    }

    function adicionarLargura(value, obj) {
      if (value.width) {
        obj.col.withOption('width', value.width + '%');
      }
    }

    function adicionarOrdenacao(value, obj) {
      if (!value.sortable || value.sortable == false) {
        obj.col.notSortable();
      }
    }

    function adicionarSearchable(value, obj) {
      obj.col.withOption('searchable', value.searchable);
    }

    function removerVisibilidade(value, obj) {
      if (value.visible === false) {
        obj.col.notVisible();
      }
    }

    function booleanParaBadgeSimNao(valor) {
      return valor === null ? '-' : valor === true ? '<div class="badge bg-success text-white">Sim</div>' : '<div class="badge bg-danger text-white">Não</div>';
    }

    function encerradoAutomaticamente() {
      return '<div class="badge text-white" style="background-color: #4496cd;">Automaticamente</div>';
    }

    function inteiroParaPercentual(valor) {
      if (valor === null) return '-';
      return parseInt(valor) + '%';
    }

    function criarBotaoPadrao() {
      return `<button class="mr-1 btn btn-outline-primary btn-sm editar"><i class="icon-pencil"></i></button><button class="btn btn-outline-danger btn-sm remover"><i class="icon-trash"></i></button>`;
    }

    function criarBotaoRemocao() {
      return `<button class="btn btn-outline-danger btn-sm remover"><i class="icon-trash"></i></button>`;
    }

    function criarColunas(colunas) {

      var dtColumns = [];

      angular.forEach(colunas, function (value, key) {

        var column = DTColumnBuilder.newColumn(value[0]).withTitle(value[1]);
        
        if (value.length >= 3) {
          if (value[2] !== null) {
            column.renderWith(value[2]);
          }
        }

        column.withOption('name', value.length === 4 ? value[3] : value[0]);
        dtColumns.push(column);
        
      });

      return dtColumns;

    }

    function criarParametros(request, filters) {

      const data = {
        draw: request?.draw,
        start: request?.start,
        length: request?.length,
        filters: Object.assign({}, filters)
      };

      return $httpParamSerializer(data);

    }

    function criarTabela(ajax, vm, remover, nomeArrayRetorno, carregarObjeto, newCallback, paginacao, info, scroll) {

      return DTOptionsBuilder.newOptions()
        .withOption('ajax', ajax)
        .withDataProp(nomeArrayRetorno)
        .withPaginationType('first_last_numbers')
        .withOption('createdRow', createdRow)
        .withOption('rowCallback', rowCallback)
        .withOption('processing', true)
        .withOption('serverSide', true)
        .withOption('searching', false)
        .withOption('pageLength', 25)
        .withOption('info', info === undefined ? true : info)
        .withOption('paging', paginacao === undefined ? true : paginacao)
        .withOption('order', [])
        .withOption('autoWidth', true)
        .withOption('searchHighlight', true)
        .withOption('dom', "<'row'<'col-lg-12'tr>><'row m-3'<'col-lg-6'i><'col-lg-6'p>>")
        // .withOption('dom', "<'row m-3'<'col-lg-12'<'float-right'l>><'col-lg-12'f>><'row'<'col-lg-12'tr>><'row m-3'<'col-lg-6'i><'col-lg-6'p>>")
        .withLanguage(datatables.ptbr)
        .withBootstrap();

      function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())(vm);
      }

      function rowCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {

        $('.remover', nRow).off('click');
        $('.remover', nRow).on('click', function () {
          evtRemover(aData, remover);
        });

        $('.editar', nRow).off('click');
        $('.editar', nRow).on('click', function () {
          carregarObjeto(aData);
        });

        if (newCallback) {
          /*jshint validthis: true */
          newCallback.apply(this, arguments);
        }
      }

    }

    function evtRemover(aData, remover) {

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
      }, function (isConfirm) { if (isConfirm) remover(aData.id); });

    }

    function recarregarDados(dtInstance) {
      dtInstance.reloadData(null, true);
    }

    function substituirValorNulo(valor) {
      return valor == null ? '-' : valor;
    }

    function vazia() {
      return { draw: 1, recordsTotal: 0, recordsFiltered: 0, data: [], error: null };
    }

    function formatarData(valor) {
      return valor == null ? '-' : moment(valor).format('DD/MM/YYYY');
    }

    function formatarStatusContrato(valor){
      return valor == null ? '-' : valor.trim();
    }

    function formatarHora(valor) {
      return valor == null ? '-' : moment(valor).format('HH:mm:ss');
    }

    function formatarDataHora(valor) {
      return valor == null ? '-' : moment(valor).format('DD/MM/YYYY - HH:mm');
    }

    function formatarCnpj(valor) {
      return valor == null ? '-' : valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }

    function formatarTelefone(valor) {
      return valor == null ? '-' : valor.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2");
    }

    function formatarValorMonetario(valor) {
      return valor == null ? '-' : parseFloat(Math.abs(valor), 10).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }

    function formatarNumero(valor) {
      return valor == null ? '-' : parseFloat(Math.abs(valor), 10).toLocaleString('pt-br', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function formatarPrestadorServico(value) {
      return `
        <h5 style="font-weight: 100">${value.razaoSocial}</h5>
        <small class="">CNPJ: ${controller.formatarCnpj(value.cnpj)}</small>`;
    }

    function formatarUnidadeEscolar(value) {
      return `
        <h5 style="font-weight: 100">${value.descricao}</h5>
        <small>Cód.: ${value.codigo} - Tipo: ${value.tipo}</small>`;
    }

    function booleanParaBadgeAtivoEncerrado(valor) {
      return valor === null ? '-' : valor === true ? '<div class="badge bg-success text-white">Ativo</div>' : '<div class="badge bg-danger text-white">Encerrado</div>';
    }

    function formatarContrato(value) {
      return `
        <h5 style="font-weight: 100">${value.contratoDescricao}</h5>
        <small class="">${value.contratoCodigo}</small>`;
    }

    function formatarStatusContratoRetroativo(value) {
      return value == 'A' ? 'ATIVO' : 'INATIVO';
    }

    function criarBotoesTabOcorrenciaRetroativa() {
      return `<button class="btn btn-outline-primary btn-sm visualizar" title="Visualizar"><i class="icon-eye"></i></button>`;
    }

  }

})();