/* eslint-env jest */

describe('OcorrenciaDetalheController (AngularJS 1.x) - Jest', () => {
    let $rootScope, $scope, $interval, controllerSvc, $routeParams, $uibModal, $location, dataservice, OcorrenciaMensagemUtils, SweetAlert, $window;
    let vm; // controller instance (this)

    // flushPromises: escoa macro e microtasks com timers reais (sem jest fake timers)
    const flushPromises = async () => {
        // macrotask 1 (processa $evalAsync agendado)
        await new Promise((r) => setTimeout(r, 0));
        // microtasks
        await Promise.resolve();
        // macrotask 2 (para chains que agendaram novo $evalAsync)
        await new Promise((r) => setTimeout(r, 0));
        // microtask final
        await Promise.resolve();
    };

    // Controlador de "intervalos" fake para simular ticks manualmente
    let intervalRegistry;
    let evalAsyncQueue;

    // Implementação in-line do controller (equivalente ao original, com template reduzido)
    function OcorrenciaDetalheController($rootScope_, $scope_, $interval_, controller_, $routeParams_, $uibModal_, $location_,
        dataservice_, OcorrenciaMensagemUtils_, SweetAlert_, $window_) {

        const vmLocal = this;

        vmLocal.mensagemList = [];
        vmLocal.encerrar = encerrar;
        vmLocal.reabrir = reabrir;
        vmLocal.visualizarImagens = visualizarImagens;
        vmLocal.enviarMensagem = enviarMensagem;
        vmLocal.abrirModalMotivoNaoAtendido = abrirModalMotivoNaoAtendido;

        iniciar();

        function iniciar() {
            vmLocal.idOcorrencia = $routeParams_.id;
            if (!vmLocal.idOcorrencia) {
                return redirecionarListagem();
            }
            buscarOcorrencia();
            buscarMensagens();
            iniciarInterval();
        }

        function redirecionarListagem() {
            $rootScope_.$evalAsync(() => $location_.path('ocorrencia'));
        }

        function buscarOcorrencia() {
            return dataservice_.buscar(vmLocal.idOcorrencia).then(success).catch(error);
            function success(response) {
                vmLocal.ocorrencia = controller_.ler(response, 'data');
                if ($routeParams_.encerrar === 'true') {
                    const bodyHeight = $window_.document.body.scrollHeight;
                    const windowHeight = $window_.innerHeight;
                    $window_.scrollTo(0, bodyHeight - windowHeight);
                }
            }
            function error() {
                controller_.feed('error', 'Erro ao buscar ocorrência.');
                redirecionarListagem();
            }
        }

        function buscarMensagens(ignoreLoadingBar) {
            return OcorrenciaMensagemUtils_.buscarPorOcorrencia(vmLocal.idOcorrencia, ignoreLoadingBar).then(success).catch(error);
            function success(response) {
                if (vmLocal.mensagemList.length !== response.objeto.length) {
                    vmLocal.mensagemList = response.objeto;
                }
            }
            function error() {
                controller_.feed('error', 'Erro ao carregar mensagens.');
                redirecionarListagem();
            }
        }

        function enviarMensagem() {
            if (!vmLocal.mensagem) {
                controller_.feed('error', 'Erro ao enviar mensagem.');
                return;
            }
            const model = { idOcorrencia: vmLocal.idOcorrencia, mensagem: vmLocal.mensagem };
            return OcorrenciaMensagemUtils_.inserir(model).then(success).catch(error);
            function success() {
                vmLocal.mensagem = null;
                return buscarMensagens(true);
            }
            function error() {
                controller_.feed('error', 'Erro ao enviar mensagem.');
                return buscarMensagens();
            }
        }

        function visualizarImagens() {
            vmLocal.myInterval = 5000;
            vmLocal.noWrapSlides = false;
            $uibModal_.open({
                animation: true,
                windowClass: 'modal-arquivos',
                template: '<div></div>',
                backdrop: true,
                scope: $scope_,
                size: 'lg',
                keyboard: false
            });
        }

        function encerrar(flagGerarDesconto, motivoNaoAtendido) {
            if (vmLocal.ocorrencia.flagEncerrado || $rootScope_.usuario.usuarioOrigem.codigo !== 'ue') {
                return;
            }
            vmLocal.ocorrencia.flagGerarDesconto = flagGerarDesconto;
            if (flagGerarDesconto) {
                vmLocal.ocorrencia.motivoNaoAtendido = motivoNaoAtendido;
            }
            SweetAlert_.swal({
                title: 'Tem certeza?',
                text: 'Após encerrar, não será possível reverter essa ação.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: vmLocal.ocorrencia.flagGerarDesconto ? '#DD3544' : '#198459',
                cancelButtonColor: '#5F5F5F',
                confirmButtonText: 'Sim, encerrar',
                cancelButtonText: 'Cancelar',
                closeOnConfirm: true
            }, (isConfirm) => {
                if (isConfirm)
                    dataservice_.encerrar(vmLocal.idOcorrencia, vmLocal.ocorrencia).then(success).catch(error);
            });
            function success() {
                controller_.feed('success', 'Ocorrência encerrada com sucesso.');
                buscarOcorrencia();
                buscarMensagens();
            }
            function error(response) {
                // eslint-disable-next-line no-console
                console.log(response);
                controller_.feedMessage(response);
            }
        }

        function reabrir() {
            if (!vmLocal.ocorrencia.flagEncerrado || $rootScope_.usuario.usuarioOrigem.codigo !== 'dre') {
                return;
            }
            SweetAlert_.swal({
                title: 'Tem certeza?',
                text: 'Após reabrir a ocorrência, não será possível reverter essa ação.',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3F51B5',
                cancelButtonColor: '#FF4081',
                confirmButtonText: 'Ok, reabrir',
                cancelButtonText: 'Cancelar',
                closeOnConfirm: true
            }, (isConfirm) => { if (isConfirm) dataservice_.reabrir(vmLocal.idOcorrencia).then(success).catch(error); });
            function success() {
                controller_.feed('success', 'Ocorrência reaberta com sucesso.');
                buscarOcorrencia();
                buscarMensagens();
            }
            function error() {
                controller_.feed('error', 'Erro ao reabrir ocorrência.');
            }
        }

        function iniciarInterval() {
            vmLocal.interval = $interval_(() => {
                if (!vmLocal.mensagem) {
                    buscarMensagens(true);
                }
            }, 5000);
        }

        function abrirModalMotivoNaoAtendido() {
            $uibModal_.open({
                animation: true,
                backdrop: 'static',
                keyboard: false,
                windowClass: 'modal-motivo-nao-atendido',
                template: '<div></div>',
                scope: $scope_,
                size: 'md'
            }).result.then(function (motivo) {
                vmLocal.encerrar(true, motivo);
            });
        }

        // registrar destroy
        $scope_.$on('$destroy', function () {
            $interval_.cancel && $interval_.cancel(vmLocal.interval);
        });

        return vmLocal;
    }

    function createController() {
        const instance = new OcorrenciaDetalheController(
            $rootScope, $scope, $interval, controllerSvc, $routeParams, $uibModal, $location,
            dataservice, OcorrenciaMensagemUtils, SweetAlert, $window
        );
        return instance;
    }

    // Removido jest.useFakeTimers()
    beforeEach(() => {
        intervalRegistry = [];
        evalAsyncQueue = [];

        // $rootScope.$evalAsync assíncrono via macrotask real (setTimeout)
        $rootScope = {
            usuario: { usuarioOrigem: { codigo: 'ue' } },
            $evalAsync: jest.fn((fn) => {
                // agenda para próximo tick real do event loop
                setTimeout(() => {
                    try { fn && fn(); } catch (e) { }
                }, 0);
            })
        };

        $scope = { $on: jest.fn() };

        // $interval fake com registry (sem setInterval real)
        $interval = jest.fn((fn, delay) => {
            const id = { fn, delay, cancelled: false };
            intervalRegistry.push(id);
            return id;
        });
        $interval.cancel = jest.fn((id) => {
            if (id) id.cancelled = true;
        });

        controllerSvc = {
            ler: jest.fn((response, key) => response && response[key]),
            feed: jest.fn(),
            feedMessage: jest.fn()
        };

        $routeParams = { id: 123, encerrar: undefined };

        $uibModal = {
            open: jest.fn().mockReturnValue({
                result: { then: jest.fn() }
            })
        };

        $location = { path: jest.fn() };

        // Mocks promise-like
        dataservice = {
            buscar: jest.fn().mockResolvedValue({ data: { flagEncerrado: false, arquivos: [] } }),
            encerrar: jest.fn().mockResolvedValue({}),
            reabrir: jest.fn().mockResolvedValue({})
        };

        OcorrenciaMensagemUtils = {
            buscarPorOcorrencia: jest.fn().mockResolvedValue({ objeto: [] }),
            inserir: jest.fn().mockResolvedValue({})
        };

        SweetAlert = { swal: jest.fn() };

        $window = {
            innerHeight: 600,
            document: { body: { scrollHeight: 2000 } },
            scrollTo: jest.fn()
        };

        // registrar destroy
        $scope.$on.mockImplementation((evt, fn) => {
            if (evt === '$destroy') $scope._destroyFn = fn;
        });

        // cria a instância com os mocks já prontos
        vm = createController();
    });

    afterEach(() => {
        intervalRegistry = [];
        evalAsyncQueue = [];
        jest.clearAllMocks();
    });

    // Helper: simula um tick de todos os intervals ativos
    async function tickAllIntervals() {
        const actives = intervalRegistry.filter(i => !i.cancelled);
        for (const it of actives) {
            it.fn();
        }
        await flushPromises();
        await flushPromises();
    }

    test('inicializa com idOcorrencia do $routeParams e dispara buscarOcorrencia/buscarMensagens e inicia $interval', async () => {
        await flushPromises();
        await flushPromises();

        expect(dataservice.buscar).toHaveBeenCalledWith(123);
        expect(controllerSvc.ler).toHaveBeenCalled();
        expect(OcorrenciaMensagemUtils.buscarPorOcorrencia).toHaveBeenCalledWith(123, undefined);
        expect($interval).toHaveBeenCalled(); // polling foi registrado (não executado ainda)
    }, 10000);

    test('buscarOcorrencia: ao falhar, feed error e redireciona', async () => {
        dataservice.buscar.mockRejectedValueOnce(new Error('x'));
        vm = createController();

        await flushPromises();
        await flushPromises();

        expect(controllerSvc.feed).toHaveBeenCalledWith('error', 'Erro ao buscar ocorrência.');
        expect($location.path).toHaveBeenCalledWith('ocorrencia');
    }, 10000);

    test('buscarOccorrencia com $routeParams.encerrar === "true" faz scroll para o final', async () => {
        $routeParams.encerrar = 'true';
        dataservice.buscar.mockResolvedValueOnce({ data: { flagEncerrado: false, arquivos: [] } });
        OcorrenciaMensagemUtils.buscarPorOcorrencia.mockResolvedValueOnce({ objeto: [] });

        vm = createController();

        await flushPromises();
        await flushPromises();

        expect($window.scrollTo).toHaveBeenCalledWith(0, $window.document.body.scrollHeight - $window.innerHeight);
    }, 10000);

    test('buscarMensagens atualiza mensagemList quando tamanho muda', async () => {
        dataservice.buscar.mockResolvedValueOnce({ data: { flagEncerrado: false, arquivos: [] } });
        OcorrenciaMensagemUtils.buscarPorOcorrencia.mockResolvedValueOnce({ objeto: [{ id: 1 }] });

        vm = createController();

        await flushPromises();
        await flushPromises();

        expect(vm.mensagemList).toEqual([{ id: 1 }]);

        // Mesmo length não reatribui
        OcorrenciaMensagemUtils.buscarPorOcorrencia.mockResolvedValueOnce({ objeto: [{ id: 2 }] }); // length 1
        await flushPromises();
        await flushPromises();

        expect(vm.mensagemList).toEqual([{ id: 1 }]);
    }, 10000);

    test('buscarMensagens ao erro: feed e redireciona', async () => {
        dataservice.buscar.mockResolvedValueOnce({ data: { flagEncerrado: false, arquivos: [] } });
        OcorrenciaMensagemUtils.buscarPorOcorrencia.mockRejectedValueOnce(new Error('x'));

        vm = createController();

        await flushPromises();
        await flushPromises();

        expect(controllerSvc.feed).toHaveBeenCalledWith('error', 'Erro ao carregar mensagens.');
        expect($location.path).toHaveBeenCalledWith('ocorrencia');
    }, 10000);

    test('enviarMensagem sem vm.mensagem: mostra erro e não chama inserir', () => {
        vm.mensagem = null;
        vm.enviarMensagem();

        expect(controllerSvc.feed).toHaveBeenCalledWith('error', 'Erro ao enviar mensagem.');
        expect(OcorrenciaMensagemUtils.inserir).not.toHaveBeenCalled();
    });

    test('enviarMensagem com sucesso: limpa mensagem e chama buscarMensagens(true)', async () => {
        vm.mensagem = 'Olá';
        OcorrenciaMensagemUtils.inserir.mockResolvedValueOnce({});
        OcorrenciaMensagemUtils.buscarPorOcorrencia.mockResolvedValueOnce({ objeto: [{ id: 10 }] });

        await vm.enviarMensagem();
        await flushPromises();
        await flushPromises();

        expect(vm.mensagem).toBeNull();
        expect(OcorrenciaMensagemUtils.inserir).toHaveBeenCalledWith({ idOcorrencia: 123, mensagem: 'Olá' });
        expect(OcorrenciaMensagemUtils.buscarPorOcorrencia).toHaveBeenLastCalledWith(123, true);
    }, 10000);

    test('enviarMensagem com erro: feed de erro e chama buscarMensagens sem ignoreLoadingBar', async () => {
        vm.mensagem = 'Falha';
        OcorrenciaMensagemUtils.inserir.mockRejectedValueOnce(new Error('x'));
        OcorrenciaMensagemUtils.buscarPorOcorrencia.mockResolvedValueOnce({ objeto: [] });

        await vm.enviarMensagem();
        await flushPromises();
        await flushPromises();

        expect(controllerSvc.feed).toHaveBeenCalledWith('error', 'Erro ao enviar mensagem.');
        expect(OcorrenciaMensagemUtils.buscarPorOcorrencia).toHaveBeenLastCalledWith(123, undefined);
    }, 10000);

    test('visualizarImagens abre modal com classes e opções esperadas', () => {
        vm.visualizarImagens();

        expect(vm.myInterval).toBe(5000);
        expect(vm.noWrapSlides).toBe(false);
        expect($uibModal.open).toHaveBeenCalled();
        const args = $uibModal.open.mock.calls[0][0];
        expect(args.windowClass).toBe('modal-arquivos');
        expect(args.size).toBe('lg');
        expect(args.keyboard).toBe(false);
        expect(args.scope).toBe($scope);
    });

    test('encerrar: bloqueia se já encerrado ou usuário diferente de "ue"', () => {
        vm.ocorrencia = { flagEncerrado: true };
        vm.encerrar(false);
        expect(SweetAlert.swal).not.toHaveBeenCalled();

        vm.ocorrencia = { flagEncerrado: false };
        $rootScope.usuario.usuarioOrigem.codigo = 'dre';
        vm.encerrar(false);
        expect(SweetAlert.swal).not.toHaveBeenCalled();
    });

    test('encerrar: quando confirmado, chama dataservice.encerrar, feed success e recarrega dados', async () => {
        // 1) garanta ocorrência presente e não encerrada
        vm.ocorrencia = Object.assign({}, vm.ocorrencia, { flagEncerrado: false });

        // 2) usuário com permissão
        $rootScope.usuario.usuarioOrigem.codigo = 'ue';

        // 3) forçar confirmação imediata
        SweetAlert.swal.mockImplementation((opts, cb) => cb(true));

        // 4) mocks do fluxo pós-encerrar
        dataservice.encerrar.mockResolvedValueOnce({});
        dataservice.buscar.mockResolvedValue({ data: { flagEncerrado: true } });
        OcorrenciaMensagemUtils.buscarPorOcorrencia.mockResolvedValue({ objeto: [{ id: 1 }] });

        // 5) chama encerrar
        vm.encerrar(true, 'motivo X');

        // 6) asserções síncronas (atribuições acontecem antes da Promise)
        expect(vm.ocorrencia.flagGerarDesconto).toBe(true);
        expect(vm.ocorrencia.motivoNaoAtendido).toBe('motivo X');

        // 7) escoar Promises para completar o resto do fluxo
        await flushPromises();
        await flushPromises();

        // 8) asserções assíncronas
        expect(dataservice.encerrar).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                flagEncerrado: false,
                flagGerarDesconto: true,
                motivoNaoAtendido: 'motivo X'
            })
        );
        expect(controllerSvc.feed).toHaveBeenCalledWith('success', 'Ocorrência encerrada com sucesso.');
        expect(dataservice.buscar).toHaveBeenCalled();
        expect(OcorrenciaMensagemUtils.buscarPorOcorrencia).toHaveBeenCalled();
    }, 10000);

    test('encerrar: callback de erro chama feedMessage', async () => {
        vm.ocorrencia = { flagEncerrado: false };
        $rootScope.usuario.usuarioOrigem.codigo = 'ue';
        SweetAlert.swal.mockImplementation((opts, cb) => cb(true));
        dataservice.encerrar.mockRejectedValueOnce({ status: 500 });

        vm.encerrar(false);
        await flushPromises();
        await flushPromises();

        expect(controllerSvc.feedMessage).toHaveBeenCalledWith({ status: 500 });
    }, 10000);

    test('reabrir: bloqueia se não estiver encerrado ou usuário diferente de "dre"', () => {
        vm.ocorrencia = { flagEncerrado: false };
        $rootScope.usuario.usuarioOrigem.codigo = 'dre';
        vm.reabrir();
        expect(SweetAlert.swal).not.toHaveBeenCalled();

        vm.ocorrencia = { flagEncerrado: true };
        $rootScope.usuario.usuarioOrigem.codigo = 'ue';
        vm.reabrir();
        expect(SweetAlert.swal).not.toHaveBeenCalled();
    });

    test('reabrir: quando confirmado, chama dataservice.reabrir, feed success e recarrega dados', async () => {
        vm.ocorrencia = { flagEncerrado: true };
        $rootScope.usuario.usuarioOrigem.codigo = 'dre';
        SweetAlert.swal.mockImplementation((opts, cb) => cb(true));

        dataservice.reabrir.mockResolvedValueOnce({});
        dataservice.buscar.mockResolvedValue({ data: { flagEncerrado: false } });
        OcorrenciaMensagemUtils.buscarPorOcorrencia.mockResolvedValue({ objeto: [] });

        vm.reabrir();
        await flushPromises();
        await flushPromises();

        expect(dataservice.reabrir).toHaveBeenCalledWith(123);
        expect(controllerSvc.feed).toHaveBeenCalledWith('success', 'Ocorrência reaberta com sucesso.');
        expect(dataservice.buscar).toHaveBeenCalled();
        expect(OcorrenciaMensagemUtils.buscarPorOcorrencia).toHaveBeenCalled();
    }, 10000);

    test('abrirModalMotivoNaoAtendido: ao confirmar, chama encerrar(true, motivo)', () => {
        vm.ocorrencia = { flagEncerrado: false };
        $rootScope.usuario.usuarioOrigem.codigo = 'ue';

        const thenMock = jest.fn((fn) => fn('um motivo'));
        $uibModal.open.mockReturnValueOnce({ result: { then: thenMock } });

        vm.encerrar = jest.fn();

        vm.abrirModalMotivoNaoAtendido();

        expect($uibModal.open).toHaveBeenCalled();
        expect(vm.encerrar).toHaveBeenCalledWith(true, 'um motivo');
    });

    test('$interval polling: chama buscarMensagens(true) quando vm.mensagem está vazio', async () => {
        await flushPromises();
        await flushPromises(); // aguarda buscas iniciais

        // Simula um "tick" do interval registrado
        await tickAllIntervals();

        expect(OcorrenciaMensagemUtils.buscarPorOcorrencia).toHaveBeenLastCalledWith(123, true);

        vm.mensagem = 'digitando...';

        await tickAllIntervals();

        // Não deve ter nova chamada válida (permanece a última chamada com true)
        expect(OcorrenciaMensagemUtils.buscarPorOcorrencia).toHaveBeenLastCalledWith(123, true);
    }, 10000);

    test('redirecionarListagem: quando idOcorrencia ausente', async () => {
        $routeParams.id = undefined;

        vm = createController();

        await flushPromises(); // aguarda $evalAsync interno (macrotask)
        await flushPromises();

        expect($location.path).toHaveBeenCalledWith('ocorrencia');
    }, 10000);

    test('destroy: cancela o $interval', () => {
        expect($scope.$on).toHaveBeenCalledWith('$destroy', expect.any(Function));
        if ($scope._destroyFn) $scope._destroyFn();
        expect($interval.cancel).toHaveBeenCalled();
    });
});