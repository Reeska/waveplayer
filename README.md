WavePlayer JavaScript library
========

A simple JavaScript sound player : it's allows to play .wav file in a lot of browsers with a same interface (Chrome, Firefox, IE8+). 
The original purpose is to fix IE10+ .wav playing with HTML5 audio tag that is not supported.

* For not IE browser : use HTML5 audio feature (http://www.w3schools.com/tags/ref_av_dom.asp)
* For IE browser : use bgsound tag

## Downloads

Bower install is available.

## Usage

You can use the jquery approach, that's generate HTML interface :

```html
	<link href="../dist/waveplayer.css" type="text/css" rel="stylesheet" />
	<script src="../dist/waveplayer.js"></script>
	<script>
		$(document).ready(function() {
			$('.wave-player').wavePlayer();
		});
	</script>
	
	<div class="wave-player" 
		data-src="sound.wav" 
		data-label="Play">
	</div>		
```

# Options

* data-src : File URI to play
* data-label : label to show in player

Or use the programmaticaly approach :  

```javascript
var wavePlayer = new wavePlayer();

wavePlayer.play('sound.wav');

wavePlayer.stop();
```
