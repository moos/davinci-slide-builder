const assert = require('assert');
const parser = require('fast-xml-parser');
const builder = require('./index').build;

const parse = (xml) => parser.parse(xml, {
  attributeNamePrefix : '',
  ignoreAttributes: false
});

const out1 = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
    <resources>
<asset id="sb1" src="file://localhost/C:/Users/foo/Pictures/111.jpg" name="111.jpg" />
<asset id="sb2" src="file://localhost/C:/Users/foo/Pictures/222.JPG" name="222.JPG" />

    </resources>
    <library>
        <event name="slideshow #1">
            <project name="slideshow-timeline-00:10.0--2-C:/Users/foo/Pictures/">
                <sequence>
                    <spine>
<video ref="sb1" duration="120/24s" offset="0/24s" />
  <transition duration="24/24s" offset="108/24s" />
<video ref="sb2" duration="120/24s" offset="120/24s" />
  <transition duration="24/24s" offset="228/24s" />

                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>
`;

describe('Test', () => {

  let assets = [
    'C:/Users/foo/Pictures/111.jpg',
    'C:/Users/foo/Pictures/222.JPG'
  ];

  it('constructs xml from default settings', () => {
    let out = builder(assets)
    assert.equal(out, out1)
  });

  it('handles duration and transitionDuration', () => {
    let out = builder(assets, {
      durationFixed: 10,
      transitionDuration: 5
    });
    let tree = parse(out);
    let spine = tree.fcpxml.library.event.project.sequence.spine;
    assert.equal(spine.video[0].duration, '240/24s');
    assert.equal(spine.video[1].duration, '240/24s');
    assert.equal(spine.video[1].offset, '240/24s');

    assert.equal(spine.transition[0].offset, '180/24s');
    assert.equal(spine.transition[1].offset, '420/24s');
  });

  it('handles random duration', () => {
    let out = builder(assets, {
      durationRand: true
    });

    let tree = parse(out);
    let spine = tree.fcpxml.library.event.project.sequence.spine;
    console.log(spine)
  });


});
