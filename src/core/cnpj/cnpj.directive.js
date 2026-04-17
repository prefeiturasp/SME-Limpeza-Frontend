(function () {
    'use strict';

    CnpjMask.$inject = ['cnpjService'];

    function CnpjMask(cnpjService) {

        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {

                function limpar(valor) {
                    if (!valor) return '';
                    valor = valor.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    valor = valor.substring(0, 14);

                    if (valor.length > 12) {
                        let base = valor.substring(0, 12);
                        let dv = valor.substring(12).replace(/[^\d]/g, '');
                        valor = base + dv;
                    }

                    return valor;
                }

                function aplicarMascara(valor) {
                    if (!valor) return '';
                    return valor
                        .replace(/^([A-Z0-9]{2})([A-Z0-9])/, '$1.$2')
                        .replace(/^([A-Z0-9]{2})\.([A-Z0-9]{3})([A-Z0-9])/, '$1.$2.$3')
                        .replace(/\.(\w{3})(\w)/, '.$1/$2')
                        .replace(/(\w{4})(\w)/, '$1-$2');
                }

                ngModelCtrl.$parsers.push(function (value) {
                    let limpo = limpar(value);
                    let mascarado = aplicarMascara(limpo);

                    ngModelCtrl.$setViewValue(mascarado);
                    ngModelCtrl.$render();

                    ngModelCtrl.$setValidity('cnpj', cnpjService.validar(limpo));

                    return limpo;
                });

                ngModelCtrl.$formatters.push(function (value) {
                    return aplicarMascara(limpar(value));
                });
            }
        };
    }

    angular
        .module('cnpjModule')
        .directive('cnpjMask', CnpjMask);

})();