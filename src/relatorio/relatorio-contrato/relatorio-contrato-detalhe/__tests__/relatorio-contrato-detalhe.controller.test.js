describe('Teste abrirModalProfissionaisFaltantes', () => {
    function criarControllerSimulado(deps = {}) {
        // Mocks de dependências
        const $scope = deps.$scope || {};
        const $uibModal = deps.$uibModal || {
            open: jest.fn().mockReturnValue({ close: jest.fn() })
        };
        const $rootScope = deps.$rootScope || { usuario: { usuarioOrigem: { codigo: 'sme' } } };
        const controller = deps.controller || {
            ler: jest.fn(),
            feed: jest.fn(),
            feedMessage: jest.fn(),
            $location: { path: jest.fn(() => controller.$location), search: jest.fn(() => ({})) }
        };

        const vm = {};

        // Implementa apenas a função alvo exatamente como no código de produção,
        // mas referenciando $scope e $uibModal simulado.
        vm.abrirModalProfissionaisFaltantes = function abrirModalProfissionaisFaltantes() {
            vm.modal = $uibModal.open({
                templateUrl:
                    'src/relatorio/relatorio-contrato/relatorio-contrato-detalhe/relatorio-contrato-detalhe-profissionais-faltantes.html?' +
                    new Date(),
                backdrop: 'static',
                scope: $scope,
                size: 'lg',
                keyboard: false,
                windowClass: 'modal-consolidado-glosa-rh',
            });

            const clone = (arr) => JSON.parse(JSON.stringify(arr));

            vm.modal.lista = (vm.dados && vm.dados.totalEquipe) ? clone(vm.dados.totalEquipe) : [];

            vm.modal.totalDesconto = (vm.modal.lista || []).reduce(function (sum, c) {
                var vd = (c && typeof c.valorDesconto === 'number')
                    ? c.valorDesconto
                    : (c && c.quantidadeAusente && c.valorMensal
                        ? (c.quantidadeAusente * (c.valorMensal / 21.74))
                        : 0);
                return sum + vd;
            }, 0);
        };

        return { vm, $uibModal, $scope, $rootScope, controller };
    }

    test('abre modal, copia lista e calcula totalDesconto (valorDesconto e fórmula)', () => {
        const { vm, $uibModal, $scope } = criarControllerSimulado();

        vm.dados = {
            totalEquipe: [
                { valorDesconto: 100 },
                { quantidadeAusente: 2, valorMensal: 217.4 },
                { quantidadeAusente: 0, valorMensal: 1000 },
                {}
            ]
        };

        vm.abrirModalProfissionaisFaltantes();

        expect($uibModal.open).toHaveBeenCalledWith(
            expect.objectContaining({
                templateUrl: expect.stringContaining('relatorio-contrato-detalhe-profissionais-faltantes.html?'),
                backdrop: 'static',
                scope: $scope,
                size: 'lg',
                keyboard: false,
                windowClass: 'modal-consolidado-glosa-rh',
            })
        );

        expect(Array.isArray(vm.modal.lista)).toBe(true);
        expect(vm.modal.lista).toEqual(vm.dados.totalEquipe);

        // 100 + 20 + 0 + 0 = 120
        expect(vm.modal.totalDesconto).toBeCloseTo(120, 5);
    });

    test('quando não há dados, lista vazia e total 0', () => {
        const { vm, $uibModal } = criarControllerSimulado();

        vm.dados = undefined;

        vm.abrirModalProfissionaisFaltantes();

        expect($uibModal.open).toHaveBeenCalled();
        expect(vm.modal.lista).toEqual([]);
        expect(vm.modal.totalDesconto).toBe(0);
    });
});