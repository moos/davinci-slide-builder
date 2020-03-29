const path = require('path');
const tmpl = require('./tmpl');
const shuffle = require('knuth-shuffle-seeded');
const randNormal = require('./rand-normal');

let t = new Date();
t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
let timeStamp = t.toISOString().replace(/\.\d+z$/i,'');

// time values in secs
const defaultSettings = {
  projName: '', //'slideshow-timeline-' + timeStamp, // not used!
  durationFixed: 5,
  durationRange: [3,6], // min, max
  durationRand: false,
  durationDist: 'uniform',  // or 'normal'
  transitionDuration: 1,
  shuffle: false,
  dryRun: false
};

const fps = 24;  // TODO input
const timeRes = fps * 1;
const toTC = t => t && Math.round(timeRes * t);
const pad = t => String(t).padStart(2, '0');
const toMMss = tc => {
  let secs = tc / timeRes;
  return `${pad(~~(secs/60))}:${pad((secs % 60).toPrecision(3))}`
};

const getDuration = (env) => env.durationRand ? getRandDuration(env) : toTC(env.durationFixed);
const randFn = (env) => env.durationDist === 'normal' ? randNormal : Math.random;
const getRandDuration = (env) => toTC(env.durationRange[0] + randFn(env)()
                                      * (env.durationRange[1] - env.durationRange[0]));

const id = () => `sb${++id.ref}`;
id.reset = () => id.ref = 0;

const attrs = {
  time: (d) => `duration="${d.duration}/${timeRes}s" offset="${d.offset}/${timeRes}s"`
};

const line = {
  asset: (d) => `<asset id="${id()}" src="${d.src}" name="${path.basename(d.src)}" />\n`,
  video: (d) => `<video ref="${id()}" ${attrs.time(d)} />\n`,
  transition: (d) => `  <transition ${attrs.time(d)} />\n`
};

const longest_common = (a,b) => {
  let idx = 1;
  let result = null;
  while(idx <= a.length){
    if(b.startsWith(a.slice(0, idx))) {
      result = a.slice(0,idx);
      idx++;
    }
    else
      break;
  }
  return result;
}

/**
 * Main function
 */
function build(assets, options) {
  let name;
  let env = Object.assign({}, defaultSettings, options);
  const transitionDuration = toTC(env.transitionDuration);
  const halfTransDuration = Math.floor(transitionDuration / 2);

  // creat project name from first asset
  if (!env.projName) {
    name = assets[0];
    name = name
      .replace(longest_common(name, process.cwd()), '')
      .replace(path.basename(name), '');
    env.projName = `slideshow-timeline`;
  }

  if (env.shuffle) {
    assets = shuffle(assets, Date.now())
  }

  if (env.dryRun) {
    console.log(env);
    console.log(assets);
    console.log(`${assets.length} matches`);
    process.exit(0);
  }

  // compose <resources>
  id.reset();
  const resources = assets.map(r => {
    return line.asset({ src: 'file://localhost/' + r});
  }).join('');

  // compose <spine>
  id.reset();
  let offset = 0;
  const spine = assets.map(r => {
    let duration = getDuration(env);
    let str = line.video({duration, offset});
    offset += duration;

    if (transitionDuration) {
      str += line.transition({
        duration: transitionDuration,
        offset: offset - halfTransDuration
      });
    }
    return str;
  }).join('');

  const output = tmpl.main({
    projName: env.projName + `-${toMMss(offset)}--${assets.length}` + (name ? `-${name}` : ''),
    resources,
    spine
  });

  return output;
}

module.exports = {
  build,
  defaultSettings
};
