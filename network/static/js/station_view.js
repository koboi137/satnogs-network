/* global mapboxgl */

$(document).ready(function() {
    'use strict';

    // Render Station success rate
    var success_rate = $('.gs.progress-bar-success').data('success-rate');
    var percentagerest = $('.gs.progress-bar-danger').data('percentagerest');
    $('.gs.progress-bar-success').css('width', success_rate + '%');
    $('.gs.progress-bar-danger').css('width', percentagerest + '%');

    // Reading data for station
    var station_info = $('#station-info').data();

    // Confirm station deletion
    var message = 'Do you really want to delete this Ground Station?';
    var actions = $('#station-delete');
    if (actions.length) {
        actions[0].addEventListener('click', function(e) {
            if (! confirm(message)) {
                e.preventDefault();
            }
        });
    }

    // Init the map
    var mapboxtoken = $('div#map-station').data('mapboxtoken');

    mapboxgl.accessToken = mapboxtoken;

    var map = new mapboxgl.Map({
        container: 'map-station',
        style: 'mapbox://styles/pierros/cj8kftshl4zll2slbelhkndwo',
        zoom: 5,
        minZoom: 2,
        center: [parseFloat(station_info.lng),parseFloat(station_info.lat)]
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
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [
                                parseFloat(station_info.lng),
                                parseFloat(station_info.lat)]
                        },
                        'properties': {
                            'description': '<a href="/stations/' + station_info.id + '">' + station_info.id + ' - ' + station_info.name + '</a>',
                            'icon': 'circle'
                        }
                    }]
                }
            },
            'layout': {
                'icon-image': 'pin',
                'icon-size': 0.4,
                'icon-allow-overlap': true
            }
        };

        map.addLayer(map_points);
        map.repaint = true;
    });

    // Filters
    $('#antenna-filter').submit(function () {
        var the_form = $(this);

        the_form.find('input[type="checkbox"]').each( function () {
            var the_checkbox = $(this);

            if( the_checkbox.is(':checked') === true ) {
                the_checkbox.attr('value','1');
            } else {
                the_checkbox.prop('checked',true);
                // Check the checkbox but change it's value to 0
                the_checkbox.attr('value','0');
            }
        });
    });

    $('#antenna-filter input[type=checkbox]').change(function() {
        $('#antenna-filter').submit();
    });
});
