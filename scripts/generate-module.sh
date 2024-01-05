#!/bin/bash

echo Input Module Name:
read module_name

# node_modules/.bin/nest g mo $module_name
# node_modules/.bin/nest g co $module_name --no-spec
# node_modules/.bin/nest g s $module_name --no-spec

node_modules/.bin/nest g resource $module_name modules --no-spec