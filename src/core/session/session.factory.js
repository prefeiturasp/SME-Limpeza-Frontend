(function () {

    'use strict';

    angular
        .module('core.session')
        .factory('session', session);

    session.$inject = ['nomeSessao', 'sessionGlobal', '$sessionStorage', '$localStorage'];

    function session(nomeSessao, sessionGlobal, $sessionStorage, $localStorage) {
        var service = {
            clearAll: clearAll,
            clearLocal: clearLocal,
            clearSession: clearSession,
            getLocal: getLocal,
            getLocalByProp: getLocalByProp,
            getSession: getSession,
            getSessionByProp: getSessionByProp,
            prop: sessionGlobal,
            removeLocal: removeLocal,
            removeSession: removeSession,
            setLocal: setLocal,
            setSession: setSession
        };

        init();

        return service;

        function clearAll() {
            delete $localStorage[nomeSessao];
            delete $sessionStorage[nomeSessao];
        }

        function clearLocal() {
            delete $localStorage[nomeSessao];
        }

        function clearSession() {
            delete $sessionStorage[nomeSessao];
        }

        function getLocal() {
            return $localStorage[nomeSessao];
        }

        function getLocalByProp(key) {
            if ($localStorage[nomeSessao] && $localStorage[nomeSessao][key]) {
                return $localStorage[nomeSessao][key];
            } else {
                return null;
            }
        }

        function getSession(key) {
            return $sessionStorage[nomeSessao];
        }

        function getSessionByProp(key) {
            if ($sessionStorage[nomeSessao] && $sessionStorage[nomeSessao][key]) {
                return $sessionStorage[nomeSessao][key];
            } else {
                return undefined;
            }
        }

        function init() {
            if (angular.isUndefined($sessionStorage[nomeSessao])) {
                $sessionStorage[nomeSessao] = {};
            }

            if (angular.isUndefined($localStorage[nomeSessao])) {
                $localStorage[nomeSessao] = {};
            }
        }

        function removeLocal(key) {
            if ($localStorage[nomeSessao] && $localStorage[nomeSessao][key]) {
                delete $localStorage[nomeSessao][key];
            }
        }

        function removeSession(key) {
            if ($sessionStorage[nomeSessao] && $sessionStorage[nomeSessao][key]) {
                delete $sessionStorage[nomeSessao][key];
            }
        }

        function setLocal(key, value) {
            for (var i in sessionGlobal) {
                if (sessionGlobal[i] == key) {
                    $localStorage[nomeSessao][key] = value;
                    break;
                }
            }
        }

        function setSession(key, value) {
            for (var i in sessionGlobal) {
                if (sessionGlobal[i] == key) {
                    $sessionStorage[nomeSessao][key] = value;
                    break;
                }
            }
        }
    }


})();