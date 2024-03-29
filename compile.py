#!/usr/bin/env python

import sys
import os
import subprocess

filename = len(sys.argv) > 1 and sys.argv[1]

output = open(filename, 'w') if filename else sys.stdout

os.system("""
mkdir -p build/
mkdir -p tools/
cd tools/
if [ ! -f compiler.jar ]
then
    wget http://closure-compiler.googlecode.com/files/compiler-20120917.tar.gz
    tar xzf compiler-20120917.tar.gz
    rm compiler-20120917.tar.gz
fi
cd ..
""")

optimization_level = os.environ.get('OPTIMIZATION_LEVEL', 'ADVANCED_OPTIMIZATIONS')
debug = os.environ.get('TBONE_DEBUG', False)
mode = 'debug' if debug else 'release'
minflag = '' if debug else '.min'

with open('tbone.js', 'r') as f:
    raw = f.read()
parsed = raw.replace('var TBONE_DEBUG = window[\'TBONE_DEBUG\'];', 'var TBONE_DEBUG = %s;' % ('true' if debug else 'false'))
with open('build/tbone.%s.js' % mode, 'w') as f:
    f.write(parsed)

cmd = [
    "java",
    "-jar",
    "tools/compiler.jar",
    "--compilation_level",
    optimization_level,
    "--create_source_map",
    "build/tbone%s.js.map" % minflag,
    "--source_map_format=V3",
    "--externs",
    "externs/jquery.js",
    "--externs",
    "externs/underscore-1.3.3.js",
    "--externs",
    "externs/backbone-0.9.2.js",
    "--js",
    "build/tbone.%s.js" % mode
]

out, error = subprocess.Popen(cmd, stdout=subprocess.PIPE).communicate()
if error:
    print >> sys.stderr, error
else:
    output.write("//@ sourceMappingURL=tbone%s.js.map\n" % minflag)
    output.write("(function(){'use strict';")
    output.write(out)
    output.write("}());")
    output.close()
