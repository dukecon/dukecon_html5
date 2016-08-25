# dukecon_html5

## Developing

Start local tomcat with 
    
    mvn tomcat7:run-war
    
Open [http://localhost:8080/dukecon-html5-client/public/](http://localhost:8080/dukecon-html5-client/public/) in your browser.

REST service call will use relative path rest/conferences/499959 which will work, if server and html5 client are packaged in the same JAR (as overlay). For development use the following maven profile:

    mvn tomcat7:run-war -P develop

which uses dukecon_html5/src/main/webapp/public/rest/conferences/499959.json as local resource. This file need to be synchronized from time to time from https://dev.dukecon.org/latest/rest/conferences/499959. We have ".json" as file extension as Tomcat can't send this json document without extension.

Customize used REST service url with an environment variable: 
    
    mvn tomcat7:run-war -Ddukecon.server.jsonUrl=https://dev.dukecon.org/latest/rest/conferences/499959

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
