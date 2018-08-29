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

app.use(express.static('static'));

app.all('/model/:route', function(req, res) {
  console.log('Sending request to model API...')
  req.pipe(request(args.model + req.path)).pipe(res);
});

app.post("/upload", (req, res) => {
  var form = new formidable.IncomingForm();
  var file_path = '';
  form.parse(req, function(err, fields, files) {
    file_path = files.audio.path;
    console.log('File path: ' + file_path);
    console.log('Timestamp: ' + fields.time);
    ffmpeg(file_path)
      .setStartTime(fields.time)
      .setDuration('10')
      .on('end', function(stdout, stderr) {
        var formData = { audio: fs.createReadStream(file_path + '_clip.wav') };
        console.log('Sending request to model API...');
        request.post({url: args.model + '/model/predict', formData: formData}).pipe(res);
      })
      .save(file_path + '_clip.wav');
  });

});

app.listen(args.port);

console.log('Web App Started on Port ' + args.port);
console.log('Using Model Endpoint: ' + args.model);
console.log('Press Ctrl-C to stop...');
