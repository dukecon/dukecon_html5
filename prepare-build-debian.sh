#!/bin/bash

# TODO: Migrate this to other OS or even mechanism, e.g., puppet?
sudo apt-get install npm

# TODO: First check if the modules already exists
sudo npm install -g gulp karma karma-coverage jasmine-core karma-jasmine karma-chrome-launcher
