# dukecon_html5

## Run the Jasmine Tests

### Execute them in a browser

Run

    mvn jasmine:bdd

Open [http://localhost:8234](http://localhost:8234) to run the specs.
Once you have changed any javascript resources, press reload in your browser.

### Run them on the command line

Run

    mvn jasmine:test

This will run the tests using PhantomJS. Iterate until `BUILD SUCCESS` appears.