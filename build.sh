#!/bin/bash

set -e

for i in gulp karma
do
    which -s $i || sudo npm install -g $i
done

# TODO: First check if the modules already exists
sudo npm install -g karma-coverage jasmine-core karma-jasmine karma-chrome-launcher

npm install
gulp build