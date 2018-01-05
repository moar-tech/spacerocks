

Space Rocks
==============================================================================

![Space Rocks](https://github.com/moar-tech/spacerocks/raw/master/media/space-rocks.jpg "Space Rocks (WebVR)")

__Escape through space on stolen plasma engines while slinging photon bolts at
deadly asteroids.__ How many can you blow apart? Put on your virtual reality 
headset and pick up your hand controllers. You’ll need them if you want to 
survive.

Play [Space Rocks](https://spacerocks.moar.io "Space Rocks (WebVR)") now at 
https://spacerocks.moar.io

And read more about 
[Space Rocks](https://spacerocks.moar.io "Space Rocks (WebVR)") on 
[Stewart’s Medium post](https://medium.com/@stew_rtsmith/space-rocks-webvr-d4035d0ac429).


Requirements
------------------------------------------------------------------------------
You’ll need a position-tracking virtual reality rig with two hand controllers,
and a WebVR-capable browser. Right now in 2017 the most expensive part is the 
computer needed to run a room-scale VR rig, but take heart—by 2022 all of this
hardware will be much cheaper. And the Web will still be free. In the meantime
here’s what Space Rocks is tuned to run on:

![Space Rocks (WebVR) compatibility matrix](https://github.com/moar-tech/spacerocks/raw/master/media/compatibility-matrix.png "Space Rocks (WebVR) compatibility matrix")

Bring your senses of [curiosity](https://en.wikipedia.org/wiki/Curiosity)
and [wonder](https://en.wikipedia.org/wiki/Wonder_(emotion)). VR is still new
and exciting — don’t become jaded. (Also, if your headset isn’t detected 
right away try reloading the page. Your pioneer spirit is appreciated!)


Run locally
------------------------------------------------------------------------------
The simplest way to fire this up on your own desktop machine is to start a 
simple Python server. Open up a 
[command line prompt](https://en.wikipedia.org/wiki/Command-line_interface), 
navigate to wherever you’ve stored this code package, then type the 
following command depending on the version of 
[Python](https://en.wikipedia.org/wiki/Python_(programming_language)) you have
installed.  

Python 2: `python -m SimpleHTTPServer 8000`  
Python 3: `py -m http.server 8000`  

In your browser you can now navigate to http://localhost:8000/ to see 
[Space Rocks](https://spacerocks.moar.io "Space Rocks (WebVR)") running 
locally. You can shutdown the local server by returning to the command line
and hitting Control + C.


Colophon
------------------------------------------------------------------------------
[Space Rocks](https://spacerocks.moar.io) is a WebVR experiment created by 
[Stewart Smith](http://stewartsmith.io) and brought to you by [Moar 
Technologies Corp](https://moar.io), a consultancy for emerging technology and
strategy in Brooklyn, New York. Built with 
[VRController](https://github.com/stewdio/THREE.VRController) for
[Three.js](https://threejs.org/). Display typeface:
[Big Noodle Titling](https://www.myfonts.com/fonts/sentinel/big-noodle-titling/)
by James Arboghast for Sentinel Type. Body typeface: 
[Roboto](https://fonts.google.com/specimen/Roboto) by Christian Robertson for
Google.

Many thanks to everyone who has helped to make WebVR possible, from the
hardware teams to the browser teams, to the framework developers, and everyone
in between. And a very special thanks to Lyle, Ed, Dominic, and whoever else
had a hand in making 
[Atari’s Asteroids (1979)](https://en.wikipedia.org/wiki/Asteroids_(video_game))
which was a childhood favorite of mine and an obvious influence here.

Copyright © [Moar Technologies Corp](https://moar.io) 2017, 2018.
All Rights Reserved. See license for details.



