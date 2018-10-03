[![Build Status](https://travis-ci.org/ajbozarth/MAX-Audio-Classifier-Web-App.svg?branch=master)](https://travis-ci.org/ajbozarth/MAX-Audio-Classifier-Web-App)

# MAX Audio Classifier Web App

A web app utilizing the [MAX Audio Classifier](https://github.com/IBM/MAX-Audio-Classifier) model

# Steps

## Run Locally

### Start the Model API

To run the docker image, which automatically starts the model serving API, run:

```
$ docker run -it -p 5000:5000 codait/max-audio-classifier
```

This will pull a pre-built image from Docker Hub (or use an existing image if already cached locally) and run it.
If you'd rather build and run the model locally, or deploy on a Kubernetes cluster, you can follow the steps in the
[model README](https://github.com/IBM/MAX-Audio-Classifier/#steps).

### Install dependencies

This app requires [ffmpeg](https://www.ffmpeg.org) to be installed locally in order to run.

### Start the Web App

#### 1. Get a local copy of the repository

Clone the web app repository locally. In a terminal, run the following command:

```
$ git clone https://github.com/ajbozarth/MAX-Audio-Classifier-Web-App.git
```

Change directory into the repository base folder:

```
$ cd MAX-Audio-Classifier-Web-App
```

#### 2. Install dependencies

Make sure Node.js and npm are installed then, in a terminal, run the following command:

```
$ npm install
```

#### 3. Start the web app server

You then start the web app by running:

```
$ node app
```

You can then access the web app at: [`http://localhost:8092`](http://localhost:8092)

#### 4. Configure ports (Optional)

If you want to use a different port or are running the model API at a different location you can change them with command-line options:

```
$ node app --port=[new port] --model=[endpoint url including protocol and port]
```

# Links

* [Model Asset eXchange (MAX)](https://developer.ibm.com/code/exchanges/models/)
* [Center for Open-Source Data & AI Technologies (CODAIT)](https://developer.ibm.com/code/open/centers/codait/)

# License
[Apache 2.0](LICENSE)
