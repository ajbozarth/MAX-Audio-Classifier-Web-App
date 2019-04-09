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

'use strict';

var request = require('request');
var yargs = require('yargs');
var express = require('express');
var formidable = require('formidable');
var ffmpeg = require('fluent-ffmpeg');
var FormData = require('form-data');
var fs = require('fs');

var args = yargs
  .default('port', 8092)
  .default('model', 'http://localhost:5000')
  .argv;

var app = express();

function model_request(file_path, start_time) {
  var res_formData = { audio: fs.createReadStream(file_path) };
  console.log('File path: ' + file_path);
  console.log('Timestamp: ' + start_time);
  console.log('Sending request to model API...');
  var res_url = args.model + '/model/predict?start_time=' + start_time;
  return request.post({url: res_url, formData: res_formData});
}

app.use(express.static('static'));

app.all('/model/:route', function(req, res) {
  console.log('Sending request to model API...');
  req.pipe(request(args.model + req.path))
    .on('error', function(err) {
      console.error(err);
      res.status(500).send('Error connecting to the model microservice');
    })
    .pipe(res);
});

app.post("/upload", function(req, res) {
  var form = new formidable.IncomingForm();
  var file_path = '';
  form.parse(req, function(err, fields, files) {
    file_path = files.audio.path;
    var new_path = file_path + '_clip.wav';
    if (files.audio.name.includes('.mp3')) {
      ffmpeg(file_path).on('end', function(stdout, stderr) {
        model_request(new_path, fields.time).pipe(res);
      }).save(new_path);
    } else {
      fs.copyFileSync(file_path, new_path, () => {});
      model_request(new_path, fields.time).pipe(res);
    }
  });
});

// Iterative global variables for running a file through the model in chunks
var run_results = {};
var run_time = 0;
var run_file = "";
var run_res;

function process_run() {
  for (var time_stamp in run_results) {
    var preds = run_results[time_stamp];

  }
}

function run_request() {
  var file_form = { audio: fs.createReadStream(run_file) };
  console.log('Timestamp: ' + run_time);
  console.log('Sending request to model API...');
  var model_url = args.model + '/model/predict?start_time=' + run_time;

  request.post({url: model_url, formData: file_form},
    function(err, httpResp, body) {
      if (err) {
        console.log(err);
        return;
      }
      var jsonResp = JSON.parse(body);
      if (httpResp.statusCode == 200 && jsonResp['status'] == 'ok') {
        run_results[run_time] = jsonResp['predictions'];
        run_time += 10;
        run_request();
      } else {
        process_run();
        run_res.send(run_results);
      }
    });
}

app.post("/run", function(req, res) {
  run_results = {};
  run_time = 0;
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    run_file = files.audio.path + '_clip.wav';
    fs.copyFileSync(files.audio.path, run_file, () => {});
    console.log('File path: ' + run_file);
    run_res = res;
    run_request();
  });
});

app.listen(args.port);

console.log('Web App Started on Port ' + args.port);
console.log('Using Model Endpoint: ' + args.model);
console.log('Press Ctrl-C to stop...');
