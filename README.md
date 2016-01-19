# dukecon_html5

## Run the Jasmine Tests

### Execute them in a browser
Open the SpecRunner.html in a browser of your choice -  the tests are directly executed

### Run them with Karma
1. Download and install nodejs from https://nodejs.org/
2. Install the required modules: 
npm install -g karma karma-coverage karma-jasmine karma-chrome-launcher --save-dev
3. Navigate to the test directory and start the execution:
karma start karma.conf.js

This runs the test and generates a test coverage report in a new folder coverage/