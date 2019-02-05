#!/usr/bin/env bash

# Copy .js and .d.ts files from src to lib using rsync, because tsc does not allow --allowJs and --declaration parameters at the same time.
#        dirs begin with __test↴           all dirs↴        all js↴      all .d.ts↴  exclude all else↴
# rsync -zarm --exclude '__test*/' --include '*/' --include '*.js' --include '*.d.ts' --exclude '*' 'src/' 'lib'
# rsync -zarm --delete --include '*/' --include '*.d.ts' --include '*.js' --exclude '*' 'src/' 'lib'

echo
echo Starting sync of non-typescript files...
echo

rsync -zarm --include '*.d.ts' --exclude '*.ts' --include '*' 'src/' 'lib'

echo
echo Sync of non-typescript files complete.
echo
