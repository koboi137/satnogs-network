/*global mapboxgl*/

$(document).ready(function() {
    'use strict';

    // Render Station success rate
    var success_rate = $('.progress-bar-success').data('success-rate');
    var percentagerest = $('.progress-bar-danger').data('percentagerest');
    $('.progress-bar-success').css('width', success_rate + '%');
    $('.progress-bar-danger').css('width', percentagerest + '%');

    var mapboxtoken = $('div#map').data('mapboxtoken');
    var stations = $('div#map').data('stations');

    mapboxgl.accessToken = mapboxtoken;

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/pierros/cj8kftshl4zll2slbelhkndwo',
        zoom: 2,
        minZoom: 2,
        scrollZoom: false,
        center: [10,29]
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', function () {

        map.loadImage('/static/img/pin.png', function(error, image) {
            map.addImage('pin', image);
        });

        var map_points = {
            'id': 'points',
            'type': 'symbol',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': []
                }
            },
            'layout': {
                'icon-image': 'pin',
                'icon-size': 0.4
            }
        };

        $.ajax({
            url: stations
        }).done(function(data) {
            data.forEach(function(m) {
                map_points.source.data.features.push({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [
                            parseFloat(m.lng),
                            parseFloat(m.lat)]
                    },
                    'properties': {
                        'description': '<a href="/stations/' + m.id + '">' + m.id + ' - ' + m.name + '</a>',
                        'icon': 'circle'
                    }
                });
            });

            map.addLayer(map_points);
        });
    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'points', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(e.features[0].geometry.coordinates)
            .setHTML(e.features[0].properties.description)
            .addTo(map);
    });

    map.on('mouseleave', 'places', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
});
