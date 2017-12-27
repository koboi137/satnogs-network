/* global mapboxgl, polarplot, moment */
/* jshint esversion: 6 */

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

    // Pass predictions loading
    $('#loading-image').show();
    $.ajax({
        url: '/pass_predictions/' + $('#station-info').attr('data-id') + '/',
        cache: false,
        success: function(data){
            var len = data.nextpasses.length - 1;
            var new_obs = $('#station-info').attr('data-new-obs');
            var station = $('#station-info').attr('data-id');
            var station_online = $('#station-info').data('online');
            var station_active = $('#station-info').data('active');
            var can_schedule =  $('#station-info').data('schedule');
            for (var i = 0; i <= len; i++) {
                var schedulable = data.nextpasses[i].valid && station_online && station_active && can_schedule;
                var json_polar_data = JSON.stringify(data.nextpasses[i].polar_data);
                var tr = moment(data.nextpasses[i].tr).format('YYYY/MM/DD HH:mm');
                var ts = moment(data.nextpasses[i].ts).format('YYYY/MM/DD HH:mm');
                var tr_display_date = moment(data.nextpasses[i].tr).format('YYYY-MM-DD');
                var tr_display_time = moment(data.nextpasses[i].tr).format('HH:mm');
                var ts_display_date = moment(data.nextpasses[i].ts).format('YYYY-MM-DD');
                var ts_display_time = moment(data.nextpasses[i].ts).format('HH:mm');
                $('#pass_predictions').append(`
                  <tr>
                    <td>
                      <a href="#" data-toggle="modal" data-target="#SatelliteModal" data-id="${data.nextpasses[i].norad_cat_id}">
                        ${data.nextpasses[i].norad_cat_id} - ${data.nextpasses[i].name}
                      </a>
                      <div class="progress satellite-success">
                        <div class="progress-bar progress-bar-success" style="width: ${data.nextpasses[i].success_rate}%"
                             data-toggle="tooltip" data-placement="bottom" title="${data.nextpasses[i].success_rate}% (${data.nextpasses[i].verified_count}) Verified">
                          <span class="sr-only">${data.nextpasses[i].success_rate}% Verified</span>
                        </div>
                        <div class="progress-bar progress-bar-warning" style="width: ${data.nextpasses[i].unknown_rate}%"
                             data-toggle="tooltip" data-placement="bottom" title="${data.nextpasses[i].unknown_rate}% (${data.nextpasses[i].unknown_count}) Unknown">
                          <span class="sr-only">${data.nextpasses[i].unknown_rate}% Unknown</span>
                        </div>
                        <div class="progress-bar progress-bar-danger" style="width: ${data.nextpasses[i].empty_rate}%"
                             data-toggle="tooltip" data-placement="bottom" title="${data.nextpasses[i].empty_rate}% (${data.nextpasses[i].empty_count}) Empty">
                          <span class="sr-only">${data.nextpasses[i].empty_rate}% Empty</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="datetime-date">${tr_display_date}</span>
                      <span class="datetime-time">${tr_display_time}</span><br>
                      <span class="datetime-date">${ts_display_date}</span>
                      <span class="datetime-time">${ts_display_time}</span>
                    </td>
                    <td>
                      <span class="lightgreen">⤉</span>${data.nextpasses[i].azr}°
                    </td>
                    <td>
                      ⇴${data.nextpasses[i].altt}°
                    </td>
                    <td>
                      <span class="red">⤈</span>${data.nextpasses[i].azs}°
                    </td>
                    <td>
                      <canvas class="polar-plot" width="100" height="100" data-points="${json_polar_data}"></canvas>
                    </td>
                    <td>
                      ${schedulable ? `<a href="${new_obs}?norad=${data.nextpasses[i].norad_cat_id}&ground_station=${station}&start_date=${tr}&end_date=${ts}"
                           class="btn btn-default"
                           target="_blank">
                           schedule
                           <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>
                         </a>
                      ` : `
                        <a class="btn btn-default" disabled>
                          schedule
                          <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>
                        </a>
                      `}
                    </td>
                  </tr>
                `);
            }
            polarplot();
        },
        complete: function(){
            $('#loading-image').hide();
        }
    });
});
