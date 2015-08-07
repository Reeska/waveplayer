WavePlayer JavaScript library
========

A simple JavaScript sound player : it's allows to play .wav file in a lot of browsers with a same interface (Chrome, Firefox, IE8+). 
The original purpose is to fix IE10+ .wav playing with HTML5 audio tag that is not supported.

* For not IE browser : use HTML5 audio feature (http://www.w3schools.com/tags/ref_av_dom.asp)
* For IE browser : use bgsound tag

## Downloads

Bower install is available :

```
bower install waveplayer
```

## UI usage

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

### Data attributes

* data-src : File URI to play
* data-label : label to show in player

## Programmatically  usage

To use the programmatically approach :  

```javascript
var wavePlayer = new wavePlayer();

wavePlayer.play('sound.wav');
wavePlayer.stop();
```

With preload :

```javascript
var wavePlayer = new wavePlayer({uri : 'sound.wav'});

wavePlayer.play();
wavePlayer.stop();
```

Also, jQuery is not required.

### Methods

#### constructor(opts)

Make a WavePlayer instance with specific options. 

| name | description | type   | default   |
|------|-------------|--------|-----------|
| opts | Options map. | object | See below|

##### Options

| name      | description                                                                          | type    |  default     |
|-----------|--------------------------------------------------------------------------------------|---------|--------------|
| src       | Sound uri to preload.                                                                | string  | *none*      |
| container | Tag container for media tag (bgsound, embed, ...).                                   | node    | document.body|
| resetPlay | Force playing from start for HTML5 audio when play method is call after stop method. | boolean | true         |

#### .play(uri)

Play sound in parameter or set up in constructor options 'src'.

| name | description | type   | default          |
|------|-------------|--------|-----------|
| uri  | Optional, sound uri to play | string | *none* |

#### .stop()

Stop current sound.