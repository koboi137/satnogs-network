/* global d3 WaveSurfer URI */

$(document).ready(function() {
    'use strict';

    var observation_start = 1000 * $('#observation-info').data('start');
    var observation_end = 1000 * $('#observation-info').data('end');

    var observation_data = [];

    var formatTime = function(timeSeconds) {
        var minute = Math.floor(timeSeconds / 60); // get minute(integer) from timeSeconds
        var tmp = Math.round(timeSeconds - (minute * 60)); // get second(integer) from timeSeconds
        var second = (tmp < 10 ? '0' : '') + tmp; // make two-figured integer if less than 10

        return String(minute + ':' + second); // combine minute and second in string
    };

    $('.observation-data').each(function(){
        var $this = $(this);
        var data_groundstation = $this.data('groundstation');
        var data_time_start = 1000 * $this.data('start');
        var data_time_end = 1000 * $this.data('end');
        observation_data.push({label : data_groundstation, times : [{starting_time: data_time_start, ending_time: data_time_end}]});
    });

    var chart = d3.timeline()
        .stack()
        .beginning(observation_start)
        .ending(observation_end)
        .hover(function (d, i, datum) {
            var div = $('#hoverRes');
            var colors = chart.colors();
            div.find('.coloredDiv').css('background-color', colors(i));
            div.find('#name').text(datum.label);
        })
        .margin({left:140, right:10, top:0, bottom:50})
        .tickFormat({format: d3.time.format.utc('%H:%M'), tickTime: d3.time.minutes, tickInterval: 30, tickSize: 6});

    var svg_width = 1140;
    if (screen.width < 1200) { svg_width = 940; }
    if (screen.width < 992) { svg_width = 720; }
    if (screen.width < 768) { svg_width = screen.width - 30; }
    d3.select('#timeline').append('svg').attr('width', svg_width)
        .datum(observation_data).call(chart);

    // Set width for not selected tabs
    var panelWidth = $('.panel-body').first().width();
    $('.tab-pane').css('width', panelWidth);

    // Waveform loading
    $('.wave').each(function(){
        var $this = $(this);
        var wid = $this.data('id');
        var wavesurfer = Object.create(WaveSurfer);
        var data_payload_url = $this.data('payload');
        var container_el = '#data-' + wid;
        $(container_el).css('opacity', '0');
        var loading = '#loading-' + wid;
        var $playbackTime = $('#playback-time-' + wid);
        var progressDiv = $('#progress-bar-' + wid);
        var progressBar = $('.progress-bar', progressDiv);

        var showProgress = function (percent) {
            if (percent == 100) {
                $(loading).text('Analyzing data...');
            }
            progressDiv.css('display', 'block');
            progressBar.css('width', percent + '%');
            progressBar.text(percent + '%');
        };

        var hideProgress = function () {
            progressDiv.css('display', 'none');
        };


        wavesurfer.init({
            container: container_el,
            waveColor: '#bf7fbf',
            progressColor: 'purple'
        });

        wavesurfer.on('destroy', hideProgress);
        wavesurfer.on('error', hideProgress);

        wavesurfer.on('loading', function(percent) {
            showProgress(percent);
            $(loading).show();
        });

        $this.parents('.observation-data').find('.playpause').click( function(){
            wavesurfer.playPause();
        });

        $('a[href="#tab-audio-' + wid + '"]').on('shown.bs.tab', function () {
            wavesurfer.load(data_payload_url);
            $('a[href="#tab-audio-' + wid + '"]').off('shown.bs.tab');
        });

        wavesurfer.on('ready', function() {
            hideProgress();
            var spectrogram = Object.create(WaveSurfer.Spectrogram);
            spectrogram.init({
                wavesurfer: wavesurfer,
                container: '#wave-spectrogram-' + wid,
                fftSamples: 256,
                windowFunc: 'hann'
            });

            $playbackTime.text(formatTime(wavesurfer.getCurrentTime()));

            wavesurfer.on('audioprocess', function(evt) {
                $playbackTime.text(formatTime(evt));
            });
            wavesurfer.on('seek', function(evt) {
                $playbackTime.text(formatTime(wavesurfer.getDuration() * evt));
            });
            $(loading).hide();
            $(container_el).css('opacity', '1');
        });
    });

    // Hightlight Data block
    var uri = new URI(location.href);
    var data_id = uri.hash();
    $(data_id).addClass('panel-info');


    // Delete confirmation
    var message = 'Do you really want to delete this Observation?';
    var actions = $('#obs-delete');
    if (actions.length) {
        actions[0].addEventListener('click', function(e) {
            if (! confirm(message)) {
                e.preventDefault();
            }
        });
    }
});
