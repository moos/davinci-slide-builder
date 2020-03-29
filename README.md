davinci-slide-builder
---------------
[![NPM version](https://img.shields.io/npm/v/davinci-slide-builder.svg)](https://www.npmjs.com/package/davinci-slide-builder)


Generates an `fcpxml` (1.8) formatted timeline of stills that can be imported into [Da Vinci Resolve](https://www.blackmagicdesign.com/products/davinciresolve/) to make a slideshow.

### Motivation
Da Vinci Resolve (free version) is an excellent software for video editing, rivaling both Final Cut Pro and Adobe Premier Pro.  Alas I found it a little limiting in auto generating a slideshow of stills, specifically in being able to sort the media (say randomly) or choosing varied duration time and/or transition effects.


### Install it
Get [node.js](https://nodejs.org/en/), then
```
npm i -g davinci-slide-builder
```

### Example
```xml
$ slide-builder -d 3 -t 1 ~/pics/2005/img100*.jpg  ~/pics/2006/img100*.jpg > out.xml
$ cat out.xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
    <resources>
<asset id="sb1" src="file://localhost/c:/Users/foo/pics/2005/img100.jpg" name="img100.jpg" />
<asset id="sb1" src="file://localhost/c:/Users/foo/pics/2005/img101.jpg" name="img101.jpg" />
<asset id="sb1" src="file://localhost/c:/Users/foo/pics/2005/img102.jpg" name="img102.jpg" />
<asset id="sb2" src="file://localhost/c:/Users/foo/pics/2006/img100.jpg" name="img100.jpg" />

    </resources>
    <library>
        <event name="slideshow #1">
            <project name="slideshow timeline">
                <sequence>
                    <spine>
<video ref="sb1" duration="75/24s" offset="0/24s" />
  <transition duration="12/24s" offset="69/24s" />
<video ref="sb2" duration="70/24s" offset="75/24s" />
  <transition duration="12/24s" offset="139/24s" />
<video ref="sb3" duration="66/24s" offset="145/24s" />
  <transition duration="12/24s" offset="205/24s" />
<video ref="sb4" duration="69/24s" offset="211/24s" />
  <transition duration="12/24s" offset="274/24s" />

                    </spine>
                </sequence>
            </project>
        </event>
    </library>
</fcpxml>
```
Then open _Da Vinci Resolve_, (new project) and "import timeline" from `out.xml`.

To shuffle slides:
```
$ slide-builder -d 3 -t 1 --sort rand ~/pics/2005/img100*.jpg  ~/pics/2006/img100*.jpg > out.xml
```

### CLI options
```
$ slide-builder
Usage: slide-builder [options] files... > outfile.xml

Options                                                                                                
  --slideDuration, -d N             - duration of each slide (default: 5 sec)                               
  --transitionDuration, -t N        - duration of transition between each slide (default: 1 sec)            
                                        0 for no transition.                                                  
  --randomDuration, -r min,max,dist - randomize slide duration within this range (secs) with distribution
                                        "uniform" or "normal" (Gaussian) (default: 3,6,uniform)
  --name S                          - name of project                                                       
  --sort [by]                       - sort slides (see advanced options)

  (Use --advanced to show less-used options)                                                           

files... can be one or more glob patterns, e.g., "pics/slideshow/** pics/summer/**.jpg".               
(Use --globs to show more examples)
```

### Change log
- 1.2.0 Rename CLI args and fix default handling
- 1.1.1 Added npm keywords
- 1.1.0 Refactored CLI arguments. Add `-R normal` and sort by name and extension.
- 1.0.0 Initial version supporting fcpxml 1.8

### License
This software is released under the terms of the MIT license.
