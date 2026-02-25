(function () {
    'use strict';

    angular
        .module('app')
        .constant('versao', new Date())
        .factory('CacheInterceptor', CacheInterceptor)
        .config(http);

    CacheInterceptor.$inject = ['$location', '$q', 'versao'];
    http.$inject = ['$httpProvider'];

    function CacheInterceptor($location, $q, versao) {
        
        var service = {
            request: request
        };

        return service;

        function request(config) {

            var url = config.url.split('?');

            if ((url[0].indexOf('.html') !== -1 || url[0].indexOf('.js') !== -1) && url[0].indexOf('src') !== -1) {
                config.url = url[0] + '?cache=' + new Date();
            }

            return config;
            
        }

    }

    function http($httpProvider) {
        $httpProvider.interceptors.push('CacheInterceptor');
    }
    
})();

