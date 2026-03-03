(function () {
    'use strict';

    function CnpjService() {

        function charToValue(char) {
            if (/[0-9]/.test(char)) {
                return parseInt(char, 10);
            }

            // Letras A-Z → 10-35
            return char.charCodeAt(0) - 55;
        }

        function calcularDV(base, pesos) {
            let soma = 0;
            for (let i = 0; i < pesos.length; i++) {
                soma += charToValue(base[i]) * pesos[i];
            }
            let resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        }

        this.validar = function (cnpj) {

            if (!cnpj || cnpj.length !== 14)
                return false;

            let base = cnpj.substring(0, 12);
            let dvInformado = cnpj.substring(12);

            let pesos1 = [5,4,3,2,9,8,7,6,5,4,3,2];
            let pesos2 = [6].concat(pesos1);

            function calcularDV(base, pesos) {
                let soma = 0;

                for (let i = 0; i < pesos.length; i++) {
                    soma += charToValue(base[i]) * pesos[i];
                }

                let resto = soma % 11;
                return resto < 2 ? 0 : 11 - resto;
            }

            let dv1 = calcularDV(base, pesos1);
            let dv2 = calcularDV(base + dv1, pesos2);

            return dvInformado === ('' + dv1 + dv2);
        };
    }

    angular
        .module('cnpjModule')
        .service('cnpjService', CnpjService);

})();