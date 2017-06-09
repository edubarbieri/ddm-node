#!/bin/sh

SCRIPTPATH=$( cd $(dirname $0)/../ ; pwd -P )
/usr/bin/node "$SCRIPTPATH/index.js" subtitle
