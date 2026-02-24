(function() {

    'use strict';

    angular
        .module('componentes.mapa')
        .controller('Mapa', mapa);

    mapa.$inject = ['MapaUtils'];

    function mapa(MapaUtils) {

        /* jshint validthis: true */
        
        var vm = this;

        vm.fecharModal = fecharModal;

        iniciar();

        function iniciar() {
            vm.locationList = vm.$resolve.modalOptions.locationList;
            vm.latitude = vm.$resolve.modalOptions.latitude;
            vm.longitude = vm.$resolve.modalOptions.longitude;
            MapaUtils.initMapWithDelay(200, 'mapaModal', vm.latitude, vm.longitude, function(mapa) {
                if (vm.locationList !== undefined && vm.locationList.length) {
                    vm.locationList.forEach(l => {
                        MapaUtils.addMarker(mapa, l);
                    });
                    MapaUtils.centerMapToLocationList(mapa, vm.locationList);
                } else {
                    MapaUtils.addMarker(mapa, vm.latitude, vm.longitude);
                }
            });
        }

        function fecharModal() {
            vm.$close();
        }

    }

})();