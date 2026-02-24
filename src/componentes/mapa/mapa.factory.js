(function() {
    'use strict';

    angular
        .module('componentes.mapa')
        .factory('MapaUtils', MapaUtils);

    MapaUtils.$inject = ['$timeout'];

    function MapaUtils($timeout) {

        var service = {
            // funcoes para mapa
            getGoogleMapsLayer: getGoogleMapsLayer,
            getOpenStreetMapsLayer: getOpenStreetMapsLayer,
            initMap: initMap,
            initMapWithDelay: initMapWithDelay,
            addMarker: addMarker,
            centerMapToMarker: centerMapToMarker,
            centerMapToMarkerList: centerMapToMarkerList,
            centerMapToLatLon: centerMapToLatLon,
            centerMapToMarkers: centerMapToMarkers,
            addMarkerAndCenter: addMarkerAndCenter,
            centerMapToLocation: centerMapToLocation,
            centerMapToLocationList: centerMapToLocationList,
            setZoom: setZoom,
            releaseMap: releaseMap,
            openGoogleMaps: openGoogleMaps,
            openGoogleStreetView: openGoogleStreetView,
            calculateDistance: calculateDistance,

            // funcoes de geocoding para enderecos
            initGeocoder: initGeocoder,
            getCoordinate: getCoordinate,
            newLocationAndAddMarker: newLocationAndAddMarker,
            newLocation: newLocation
        };

        var markers = [];

        return service;

        // funcoes para mapa

        function getGoogleMapsLayer() {
            var layer = L.tileLayer(
                'https://{s}.google.com/vt/lyrs=st,m&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    minZoom: 5,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }
            );
            return layer;
        }

        function getOpenStreetMapsLayer() {
            var layer = L.tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    minZoom: 1,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }
            );
            return layer;
        }

        function initMap(containerId, lat, lon, customOptions, layer) {
            var options = {
                attributionControl: false,
                center: [lat, lon],
                zoom: 18,
                zoomControl: true,
                keyboard: false,
                dragging: true,
                scrollWheelZoom: true
            };

            if (customOptions)
                options = angular.extend({}, options, customOptions);

            if (!layer)
                layer = getGoogleMapsLayer();

            var map = L.map(containerId, options);
            map.addLayer(layer);
            map.invalidateSize();
            return map;
        }

        function initMapWithDelay(delay, containerId, lat, lon, callback) {
            $timeout(function() {
                var map = initMap(containerId, lat, lon);
                callback(map);
            }, delay);
        }

        function addMarker(map, location) {
            var marker = L.marker(new L.LatLng(location.lat, location.lon), location.options);
            marker = setConfigMarker(marker, location.config);
            marker.addTo(map);
            return marker;
        }

        function newLocationAndAddMarker(map, latitude, longitude, draggable, iconUrl, config) {
            var location = newLocation(latitude, longitude, draggable, iconUrl, config);
            addMarker(map, location);
            return location;
        }

        function newLocation(latitude, longitude, draggable, iconUrl, config) {
            var l = {
                "lat": parseFloat(latitude),
                "lon": parseFloat(longitude),
                "draggable": draggable,
                "config": config,
                "options": {}
            };

            if ((!latitude) || (!longitude)) return null;
            if (draggable == undefined)
                l.draggable = false;

            var options = {
                draggable: l.draggable,
                autoPan: l.draggable
            };
            if (iconUrl) {
                options.icon = L.icon({
                    iconUrl: iconUrl,
                    iconSize: coalesce(config.iconSize, [33, 53]),
                    iconAnchor: [16.5, 53],
                    zIndexOffset: 10000
                });
            }
            l.options = options;

            return l;
        }

        function setConfigMarker(marker, config) {
            if (angular.isDefined(config.hooverTooltip)) {
                marker.bindTooltip(config.hooverTooltip);
            }

            if (angular.isDefined(config.popup)) {
                marker.bindPopup(config.popup);
            }

            if (angular.isDefined(config.click)) {
                marker.on('click', function(ev) {
                    config.click(config.clickParam);
                });
            }
            return marker;
        }

        function centerMapToLocation(map, l) {
            // map.setView(marker.getLatLng(), 5);
            var latLngs = [l.lat, l.lon];
            var markerBounds = L.latLngBounds(latLngs);
            map.fitBounds(markerBounds);
        }

        function centerMapToLocationList(map, locationList) {
            
            var latLngs = [];
            angular.forEach(locationList, function(l) {
                latLngs.push([l.lat, l.lon]);
            });

            if(latLngs.length > 0) {
                var markerBounds = L.latLngBounds(latLngs);
                map.fitBounds(markerBounds);
            }
            
        }

        function setZoom(map, zoom) {
            map.setZoom(zoom);
        }

        function centerMapToMarker(map, marker) {
            // map.setView(marker.getLatLng(), 5);
            var latLngs = [marker.getLatLng()];
            var markerBounds = L.latLngBounds(latLngs);
            map.fitBounds(markerBounds);
        }

        function centerMapToMarkerList(map, markerList) {
            var latLngs = [];
            angular.forEach(markerList, function(marker) {
                latLngs.push(marker.getLatLng());
            });
            var markerBounds = L.latLngBounds(latLngs);
            map.fitBounds(markerBounds);
        }

        function centerMapToLatLon(map, lat, lon) {
            // map.setView(marker.getLatLng(), 5);
            var latLngs = [{ lat: lat, lon: lon }];
            var markerBounds = L.latLngBounds(latLngs);
            map.fitBounds(markerBounds);
        }

        function addMarkerAndCenter(map, latitude, longitude, draggable, iconUrl) {
            var marker = addMarker(map, latitude, longitude, draggable, iconUrl);
            centerMapToMarker(map, marker);
            return marker;
        }

        function centerMapToMarkers(map, markers) {
            centerMapToMarkerList(map, markers);
        }

        function releaseMap(map) {
            map.off();
            map.remove();
        }


        function coalesce(var1, var2) {
            return var1 == undefined || var1 == null ? var2 : var1;
        }

        // funcoes de geocoding para enderecos
        function initGeocoder() {
            var geocoder = new L.Control.Geocoder.Nominatim();
            return geocoder;
        }

        function getCoordinateData(obj) {
            var coordinate = {
                latitude: (obj ? obj.lat : null),
                longitude: (obj ? obj.lng || obj.lon : null)
            };
            return coordinate;
        }

        function getObjetoCoordenada(obj) {
            var coordinate;
            if (obj && obj.center)
                coordinate = getCoordinateData((obj ? obj.center : null));
            else
                coordinate = getCoordinateData((obj ? obj : null));

            var southWestBound = {};
            if (obj && obj.bbox)
                southWestBound = getCoordinateData((obj ? obj.bbox._southWest : null));
            else if (obj && obj.boundingbox)
                southWestBound = getCoordinateData({ lat: obj.boundingbox[0], lon: obj.boundingbox[2] });

            var northEastBound = {};
            if (obj && obj.bbox)
                northEastBound = getCoordinateData((obj ? obj.bbox._northEast : null));
            else if (obj && obj.boundingbox)
                northEastBound = getCoordinateData({ lat: obj.boundingbox[1], lon: obj.boundingbox[3] });

            coordinate.bounds = {
                northEast: northEastBound,
                southWest: southWestBound,
                asArrays: [
                    [northEastBound.latitude, northEastBound.longitude], // Northeast
                    [southWestBound.latitude, southWestBound.longitude] // Southwest
                ],
                valid: ((northEastBound.latitude) && (northEastBound.longitude) &&
                    (southWestBound.latitude) && (southWestBound.longitude))
            };
            return coordinate;
        }

        function getCoordinate(geocoder, addressString, callback) {
            geocoder.geocode(
                addressString,
                function(results) {
                    var result = results[0];
                    var coordinate = getObjetoCoordenada(result);
                    callback(coordinate);
                }
            );
        }

        function openInNewTab(url) {
            var win = window.open(url, '_blank');
            win.focus();
        }

        function openGoogleMaps(addressString) {
            // var url = "http://maps.google.com/maps?q=" + encodeURI(addressString);
            var url = "https://www.google.com/maps/place/" + encodeURI(addressString);
            openInNewTab(url);
        }

        function openGoogleStreetView(latitude, longitude) {
            var url = "http://maps.google.com/maps?q=&layer=c&cbll=" + latitude + "," + longitude;
            openInNewTab(url);
        }

        function calculateDistance(lat1, lon1, lat2, lon2) {
            var p = 0.017453292519943295; // Math.PI / 180
            var c = Math.cos;
            var a = 0.5 - c((lat2 - lat1) * p) / 2 +
                c(lat1 * p) * c(lat2 * p) *
                (1 - c((lon2 - lon1) * p)) / 2;

            return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
        }


    }
})();