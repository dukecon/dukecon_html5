# DukeCon HTML5 Client

## Install the Dependencies

- Install Node/NPM >= 5.x (from https://nodejs.org/)
- Install Gulp globally (if not already existing):  
  `npm install -g gulp`
- For being able to run the tests (not needed to build the app), install Karma globally (if not already existing):  
  `npm install -g karma karma-coverage jasmine-core karma-jasmine karma-chrome-launcher`
- Install dependencies: `npm install`

## Build the Artifact

Run `gulp build`. You will find the zip file in the `target` directory.

## Run the Application

Type `gulp watch` - this will start the local browser sync and proxy middleware to redirect all rest calls to the "latest" backend.
This can be overridden by passing command line attributes:
- `gulp watch --local` redirects rest calls to `http://localhost:8080`
- `gulp watch --backendurl=http://somehost` redirects rest calls to `http://somehost`


## Run the Jasmine Tests

### Execute them in a browser

Open the `SpecRunner.html` in a browser of your choice -  the tests are directly executed

### Run them with Karma

- Run `npm test` from base directory.
^
This runs the test and generates a test coverage report in a new folder coverage/