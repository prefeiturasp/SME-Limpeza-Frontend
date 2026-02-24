(function () {

  'use strict';

  var configuracaoREST = {
    aplicativo: 'aplicativo',
    authenticate: 'auth',
    recuperacaoSenha: 'auth/recuperar-senha',
    usuario: 'usuario',
    usuarioOrigem: 'usuario/origem',
    usuarioCargo: 'usuario/cargo',
    usuarioStatus: 'usuario/status',
    endereco: 'endereco',
    feriado: 'feriado',
    configuracao: 'configuracao',
    diretoriaRegional: 'diretoria-regional',
    unidadeEscolar: 'unidade-escolar',
    prestadorServico: 'prestador-servico',
    contrato: 'contrato',
    cargo: 'cargo',
    declaracao: 'declaracao',
    periodicidade: 'plano-trabalho/periodicidade',
    turno: 'plano-trabalho/turno',
    tipoAmbiente: 'plano-trabalho/ambiente/tipo-ambiente',
    ambienteGeral: 'plano-trabalho/ambiente/ambiente-geral',
    ambienteUnidadeEscolar: 'plano-trabalho/ambiente/ambiente-unidade-escolar',
    planoTrabalhoMatriz: 'plano-trabalho/matriz',
    planoTrabalhoUnidadeEscolar: 'plano-trabalho/unidade-escolar',
    monitoramento: 'monitoramento',
    ocorrencia: 'ocorrencia',
    ocorrenciaTipo: 'ocorrencia/ocorrencia-tipo',
    ocorrenciaSituacao: 'ocorrencia/ocorrencia-situacao',
    ocorrenciaVariavel: 'ocorrencia/ocorrencia-variavel',
    ocorrenciaMensagem: 'ocorrencia/ocorrencia-mensagem',
    relatorioGerencial: 'relatorio/relatorio-gerencial',
    relatorioContrato: 'relatorio/relatorio-contrato',
    relatorioContratoPontos: 'relatorio/relatorio-contrato-pontos',
    relatorioOcorrenciaFuncionario: 'relatorio/relatorio-ocorrencia-funcionario',
    relatorioEquipe: 'relatorio/relatorio-equipe',
    relatorioEquipeContrato: 'relatorio/relatorio-equipe-contrato',
    url: getURL()
  };

  function getURL() {

    const listaHostsDesenvolvimento = [
      'limpeza.localhost'
    ];

    if (listaHostsDesenvolvimento.includes(window.location.host)) {
      return 'http://' + window.location.host + ':3001/api/web/';
    }

    return 'https://' + window.location.host + '/api/web/';

  }

  angular
    .module('core.constantes')
    .constant('ConfigRest', configuracaoREST);

})();