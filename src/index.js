const path = require('path');
const tmpl = require('./tmpl');
const shuffle = require('knuth-shuffle-seeded');

// time values in secs
const defaultSettings = {
  projName: 'slideshow timeline',
  durationFixed: 5,
  durationRange: [3,6], // min, max
  durationRand: false,
  durationDist: 'linear',  // or 'normal'  TODO
  transitionDuration: 1,
  shuffle: false
};

const fps = 24;  // TODO input
const timeRes = fps * 1;
const toTC = t => Math.round(timeRes * t);

const getDuration = (env) => env.durationRand ? getRandDuration(env) : toTC(env.durationFixed);
const getRandDuration = (env) => toTC(env.durationRange[0] + Math.random()
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


function build(assets, options) {
  let env = Object.assign({}, defaultSettings, options);
  const transitionDuration = toTC(env.transitionDuration);
  const halfTransDuration = Math.floor(transitionDuration / 2);

  if (env.shuffle) {
    assets = shuffle(assets, Date.now())
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
    projName: env.projName,
    resources,
    spine
  });

  return output;
}

module.exports = {
  build,
  defaultSettings
};
