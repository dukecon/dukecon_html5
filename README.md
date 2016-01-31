# DukeCon HTML5 Client

## Install the Dependencies

- Install Node/NPM >= 5.x (from https://nodejs.org/)
- Install Gulp globally (if not already existing):  
  `npm install -g gulp`
- Install Karma globally (if not already existing):  
  `npm install -g karma karm-coverage jasmine-core karma-jasmine karma-chrome-launcher`
- Install dependencies: `npm install`


## Run the Jasmine Tests

### Execute them in a browser

Open the `SpecRunner.html` in a browser of your choice -  the tests are directly executed

### Run them with Karma

- Run `npm test` from base directory.
^
This runs the test and generates a test coverage report in a new folder coverage/