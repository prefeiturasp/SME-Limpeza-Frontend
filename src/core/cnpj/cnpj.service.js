(function () {
    'use strict';

    function CnpjService() {

        this.validar = function (cnpj) {
            return validarCNPJAlfanumerico(cnpj);
        };

    }

    /**
     * Valida um CNPJ alfanumérico conforme a Receita Federal.
     * Aceita CNPJ numérico tradicional e alfanumérico.
     */
    function validarCNPJAlfanumerico(cnpj) {
        if (!cnpj) return false;

        // Remove caracteres que não sejam letras ou números
        cnpj = cnpj.toUpperCase().replaceAll(/[^A-Z0-9]/g, '');

        // Deve possuir 14 caracteres
        if (cnpj.length !== 14)
            return false;

        const corpo = cnpj.substring(0, 12);
        const dvInformado = cnpj.substring(12);

        const pesosDV1 = [5,4,3,2,9,8,7,6,5,4,3,2];
        const pesosDV2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];

        function calcularDV(base, pesos) {
            let soma = 0;

            for (let i = 0; i < base.length; i++) {
                const valor = valorCaracter(base[i]);

                if (valor < 0)
                    return null;

                soma += valor * pesos[i];
            }

            const resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        }

        const dv1 = calcularDV(corpo, pesosDV1);
        if (dv1 === null) return false;

        const dv2 = calcularDV(corpo + dv1, pesosDV2);
        if (dv2 === null) return false;

        return dvInformado === `${dv1}${dv2}`;
    }

    function valorCaracter(c) {
        if (c >= '0' && c <= '9')
            return c.codePointAt(0) - 48;

        if (c >= 'A' && c <= 'Z')
            return c.codePointAt(0) - 48;

        return -1;
    }

    angular
        .module('cnpjModule')
        .service('cnpjService', CnpjService);

})();