#!/usr/bin/env node

const argv = require('yargs-parser')(process.argv.slice(2), {
  boolean: ['dry-run']
});
const fg = require('fast-glob');
const arraySort = require('array-sort');
const path = require('path');
const builder = require('../src').build;

const defaultIgnores = [
  '**/Thumbs.db',
  '**/*.dat',
  '**/*.ini',
  '**/*.sfk',
  '**/*.cxf',
  '**/*.mxf',
  '**/*.THM',
  '**/*.txt',
  // '**/*.avi',  // ???
  '**/*.xmp'
];

argv.advanced && advHelp();
argv.globs && globHelp();
argv._.length === 0 && help();

function help() {
  console.log(`
Usage: slide-builder [options] files... > outfile.xml

Options
  --slideDuration, -d N             - duration of each slide (default: 5 sec)
  --transitionDuration, -t N        - duration of transition between each slide (default: 1 sec)
                                        0 for no transition.
  --durationRange, -r min,max,dist  - randomize duration within this range (secs) with distribution
                                       uniform or normal (default: 3,6,uniform)
  --name S                          - name of project
  --sort [by]                       - sort slides (see advanced options)

  (Use --advanced to show less-used options)

files... can be one or more glob patterns, e.g., "pics/slideshow/** pics/summer/**.jpg".
(Use --globs to show more examples)
`);
  process.exit(0);
}

function advHelp() {
  console.log(`
Advanced options:
  --ext [list]    - limit glob to list of file extension, e.g., "jpg,png"
  --noext [list]  - file extensions to exclude
  --ignore [list] - list of glob patterns to ignore, e.g., "node_module/**,backups/**"
  --depth         - set glob depth, i.e., how deep directories are traversed (default: 3)
  --sort [by]     - sort entries: [by] is one of:
                         date  - creation date
                         mdate - modified date
                         size  - file size
                         name  - file name, excluding path
                         iname - file name, excluding path, case insensitive
                         ext   - extension only
                         path  - file path, depth first
                       * flat  - file path, breadth first (default)
                         rand  - randomize
  --rsort [by]    - reverse sort order
  --dry-run       - just show selected files
`);
  process.exit(0);
}

function globHelp() {
  console.log(`
Glob examples:
  pics/foo/*      (all files in pics/foo)
  pics/foo/*.png  (only png files in pics/foo)
  pics/foo/**     (all files under pics/foo/... recursively)
  pics/**/{2015..2017}* (all files under pics/... beginning with "2015", "2016", or "2017")
  pics/**/201[5..7]* (same as above using RexEx brackets single character expansion)
  pics/**/{2015,2017}* (all files under pics/... beginning with "2015" or "2017")
  pics/[[:alpha:][:digit:]]* (app files in pics/ beginning with a letter and number, e.g., "p5")
  !private/**  (exclusion)

More at https://github.com/isaacs/node-glob#glob-primer
`);
  process.exit(0);
}

let toArr = (str) => str ? str.split(',') : [];

let options = {};
let durationRange = argv.durationRange || argv.r;
Object.entries({
  projName: [argv.name],
  durationFixed: [argv.slideDuration || argv.d, (a) => parseFloat(a, 10)],
  durationRange: [durationRange, (a) => toArr(a).splice(0,2).map(parseFloat)],
  durationRand: [durationRange, (a) => !!a],
  durationDist: [durationRange, (a) => a[0]],
  transitionDuration: [argv.transitionDuration || argv.t,,true],
  shuffle: [argv.sort || argv.rsort, (a) => a === 'rand'],
  dryRun: [argv.dryRun]
}).forEach(([key, [value, proc, falsyOK]]) => {
  if (value || falsyOK) options[key] = proc ? proc(value) : value;
});

// process file globs
// const entries = fg.sync(['src/**/*.js', '!src/**/*.spec.js']);
let assets = fg.sync(argv._, {
  absolute: true,
  deep: argv.depth || 3,
  onlyFiles: true,
  stats: true,
  ignore: [].concat(
    defaultIgnores,
    toArr(argv.ignore),
    toArr(argv.noext).map(ext => '**/*.' + ext)
  )
});

if (!assets.length) {
  console.error(`No files matched for: ${argv._.join(' ')}`);
  process.exit(1);
}

// sort
let sort = argv.sort || argv.rsort;
let sortMap = {
  date: 'ctime',
  mdate: 'mtime',
  size: 'size',
  name: 'name',  // note: this is calculated below, not returned by fstat
  iname: 'name', // case insensitive version of name
  ext: 'ext',
  path: 'path'
  // flat: ['depth','path']  // default ***
};

if (sort && !options.shuffle && sortMap[sort]) {
  // calc name.ext if needed
  if (/(name|ext)/.test(sort)) {
    let icase = sort === 'iname' ? (a => a.toLowerCase()) : (a => a);
    assets.forEach((a,i) => {
      assets[i].name = icase(path.basename(a.path));
      assets[i].ext = path.extname(a.path);
    });
  }

  assets = arraySort(assets, sortMap[sort], {
    reverse: !!argv.rsort
  });
}

assets = assets.map(a => a.path);

// filter extensions
if (argv.ext) {
  let exts = argv.ext.split(',');
  let extMatch = (path) => exts.filter(ext => path.endsWith('.' + ext)).length;
  assets = assets.filter(extMatch);
}

let out = builder(assets, options);
console.log(out)
