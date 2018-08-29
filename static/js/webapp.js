/*
 * Copyright 2018 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-env jquery */
/* eslint-env browser */

'use strict';

var current_file = null;

// Run or bind functions on page load
$(function() {

  // File upload form submit functionality
  $('#file-upload').on('submit', function(event) {
    // Stop form from submitting normally
    event.preventDefault();

    // Get file form data
    var form = event.target;
    var file = form[0].files[0];
    var data = new FormData(form);

    // Display audio player for uploaded file on UI
    var reader = new FileReader();
    reader.onload = function(event) {
      var file_url = event.target.result;
      $('#input-audio').attr('src', file_url);
      $('#audio-player').show();
      $('#json-output').empty();
    };
    reader.readAsDataURL(file);

    if ($('#file-input').val() !== '') {
      $('#file-submit').text('Predicting...');
      $('#file-submit').prop('disabled', true);
      $('#file-send').prop('disabled', true);

      // Perform file upload
      $.ajax({
        url: '/model/predict',
        method: 'post',
        processData: false,
        contentType: false,
        data: data,
        dataType: 'json',
        success: function(data) {
          var output = JSON.stringify(data, null, 2);
          $('#json-output').html(output);
          current_file = file;
        },
        error: function(jqXHR, status, error) {
          alert('Prediction Failed: ' + error);
        },
        complete: function() {
          $('#file-submit').text('Submit');
          $('#file-input').val('');
          $('#file-submit').prop('disabled', false);
          $('#file-send').prop('disabled', false);
        },
      });
    }
  });

  $('#clip-upload').on('submit', function(event) {
    // Stop form from submitting normally
    event.preventDefault();

    // Capture current time on audio player
    var current_time = $('#input-audio')[0].currentTime;

    if (current_file) {
      $('#file-send').text('...');
      $('#file-submit').prop('disabled', true);
      $('#file-send').prop('disabled', true);

      // Get file form data
      var data = new FormData();
      data.append('time', current_time);
      data.append('audio', current_file);

      // Perform file upload
      $.ajax({
        url: '/upload',
        method: 'post',
        processData: false,
        contentType: false,
        data: data,
        dataType: 'json',
        success: function(data) {
          var output = JSON.stringify(data, null, 2);
          $('#json-output').html(output);
        },
        error: function(jqXHR, status, error) {
          alert('Prediction Failed: ' + error);
        },
        complete: function() {
          $('#file-send').text('Send');
          $('#file-submit').prop('disabled', false);
          $('#file-send').prop('disabled', false);
        },
      });
    }
  });

});
