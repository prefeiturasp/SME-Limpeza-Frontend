(function() {

    angular
        .module('core.utils')
        .factory('controller', controller);

    controller.$inject = [
        '$rootScope',
        '$routeParams',
        '$location',
        '$q',
        'mensagem',
        'ConfigRest',
        'multiPromise',
        'session'
    ];

    function controller(
        $rootScope,
        $routeParams,
        $location,
        $q,
        mensagem,
        ConfigRest,
        multiPromise,
        session) {

        var service = {
            $location: $location,
            $q: $q,
            $routeParams: $routeParams,
            ConfigRest: ConfigRest,
            ler: ler,
            feed: mensagem.feed,
            feedMessage: mensagem.feedMessage,
            ready: multiPromise.ready,
            session: session,
            criarRetornoPromise: criarRetornoPromise,
            lerRetornoPromise: lerRetornoPromise,
            retornoPromise: retornoPromise,
            lerRetornoDatatable: lerRetornoDatatable,
            formatarCnpj: formatarCnpj,
            downloadArquivo: downloadArquivo
        };

        return service;

        function criarRetornoPromise(exec, objeto) {

            var retorno = {};
            retorno.exec = exec;
            retorno.objeto = objeto;
            return retorno;

        }

        function retornoPromise(funct) {

            return funct.then(success).catch(error);

            function success(response) {
                return criarRetornoPromise(true, response.data);
            }

            function error(response) {
                return criarRetornoPromise(false, []);
            }

        }

        function ler(data, value) {

            if (value === undefined) {
                return data.data;
            }

            return data.data[value];

        }

        function lerRetornoDatatable(data) {

            var datatable = ler(data, 'datatables');
            datatable.recordsFiltered = datatable.recordsTotal;
            return datatable;

        }

        function lerRetornoPromise(objeto, mensagem, atributos) {

            if (objeto.exec) {
                return objeto.objeto;
            } else {
                this.feed(mensagemGlobal[mensagem], this.msgAttr(mensagemGlobal[mensagem].msg, atributos));
            }

        }

        function formatarCnpj(cnpj) {
            return cnpj == null ? '-' : cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
        }

        function downloadArquivo(data) {
			const a = document.createElement('a');
			document.body.appendChild(a);
			a.style = 'display: none';
			const file = new Blob([
                new Uint8Array(data.buffer.data)
            ], {
                type: 'application/' + data.extension
            });
			const fileUrl = window.URL.createObjectURL(file);
			a.href = fileUrl;
			a.download = data.name + '.' + data.extension;
			a.click();
        }

    }


})();