{
	/**********************************************************
	 * COMMON & INTERFACE
	 **********************************************************/
	var ie = document.documentMode
//		, console = window.console || { log: function() {}, error: function() {} };
	
	function WavePlayer(opts) {
		this.opts = {
			src: opts.src || '',
			container: opts.container || document.body,
			resetPlay: opts.resetPlay || true, // Always playing from start (not pause) (HTML5 audio only),
			volume: opts.volume || 100
		};
		
		this.playing = false;
		this.src = this.opts.src;
		this.volumeLevel = this.opts.volume;
		
		this.eventHandlers = [];
		
		this._init();
	};
	
	/**
	 * Play sound in parameter or set up in constructor options 'src'.
	 * @param uri optional, sound uri to play.
	 * @returns {WavePlayer}
	 */
	WavePlayer.prototype.play = function(uri) {
		var uri = uri || this.src;
		
		this._play(uri);
		
		this.playing = true;
		if (uri) this.src = uri;
		
		return this;
	};
	
	/**
	 * Stop current sound.
	 * @returns {WavePlayer}
	 */
	WavePlayer.prototype.stop = function() {
		this._stop();
		
		this.playing = false;
		return this;
	};
	
	/**
	 * Set volume.
	 * @param int percentage value in [0, 100].
	 * @returns {WavePlayer}
	 */
	WavePlayer.prototype.volume = function(/*percentage*/) {
		if (arguments.length > 0) {
			if (arguments[0] < 0) arguments[0] = 0;
			if (arguments[0] > 100) arguments[0] = 100;
		}
		
		var oldLevel = this.volumeLevel;
		this.volumeLevel = parseInt(this._volume.apply(this, arguments));
		
		/*
		 * Fire volume leve changes
		 */
		if (oldLevel != this.volumeLevel)
			this.fireChanges('volumeLevel');
		
		return this.volumeLevel;
	};	
	
	/**
	 * Set volume up by step percentage.
	 * @param int step
	 * @returns {WavePlayer}
	 */
	WavePlayer.prototype.volumeDown = function(step) {
		return this.volume(this.volume() - (step || 10));
	};
	
	/**
	 * Set volume down by step percentage.
	 * @param int step
	 * @returns {WavePlayer}
	 */
	WavePlayer.prototype.volumeUp = function(step) {
		return this.volume(this.volume() + (step || 10));
	};	
	
	/**
	 * Register a property changes event handler.
	 * @param property Property to observe.
	 * @param fn Handler to call when property changes.
	 */
	WavePlayer.prototype.on = function(property, fn) {
		var handlers = this.eventHandlers[property] || [];
		
		handlers.push(fn);
		
		this.eventHandlers[property] = handlers;
		
		return this;
	};	
	
	/**
	 * Fire property changes event : calling registred handlers for this event.
	 * @param property
	 */
	WavePlayer.prototype.fireChanges = function(property) {
		if (!this.eventHandlers[property])
			return;
		
		var handlers = this.eventHandlers[property];
		
		for (var h = 0; h < handlers.length; h++)
			handlers[h].call(this, this[property]);
		
		return this;
	};	
	
	/**********************************************************
	 * IMPLEMENTATION
	 **********************************************************/	
	/**
	 * Use for IE9+ : .wav file not supported for audio and embed tag
	 */	
	if (ie > 8) {
		WavePlayer.prototype._init = function() {
			var e = document.createElement('bgsound');
			e.volume = -10000;
			e.balance = 0;
			e.src = this.opts.src;
			
			this.bgsound = e;
			this.opts.container.appendChild(e);			
		};
		
		WavePlayer.prototype._play = function(uri) {
			this.bgsound.volume = this._percentToVolume(this.volumeLevel);
			this.bgsound.src = uri;
		};
		
		WavePlayer.prototype._stop = function(uri) {
			this.bgsound.removeAttribute('src');
		};
		
		WavePlayer.prototype._volume = function(percentage) {
			if (arguments.length > 0) {
				this.bgsound.volume = this._percentToVolume(percentage);				
			}
			
			return this._volumeToPercent();
		};		
		
		WavePlayer.prototype._percentToVolume = function(percentage) {
			// MIN = -10000
			// MAX = 0		
			if (percentage == 0) return -10000;
			return (percentage - 100) * 40;
		};
		
		WavePlayer.prototype._volumeToPercent = function() {
			if (this.bgsound.volume == -10000) return 0;
			return (this.bgsound.volume / 40) + 100;
		};
	} 
	/**
	 * For modern browsers
	 */	
	else if ('Audio' in window) {
		WavePlayer.prototype._init = function() {
			this.audioPlayer = new Audio(this.opts.src);
			this.audioPlayer.volume = this._percentToVolume(this.volumeLevel);
		}
		
		WavePlayer.prototype._play = function(uri) {
			/*
			 * If sound in cache not reload
			 */
			if (uri != this.src) this.audioPlayer.src = uri;
			if (this.opts.resetPlay) this.audioPlayer.currentTime = 0;
			
			this.audioPlayer.play();			
		};
		
		WavePlayer.prototype._stop = function(uri) {
			this.audioPlayer.pause();
		};		
		
		WavePlayer.prototype._playing = function() {
			return !this.audioPlayer.paused;
		};		
		
		WavePlayer.prototype._volume = function(percentage) {
			if (arguments.length > 0) {
				this.audioPlayer.volume = this._percentToVolume(percentage);
			}
			
			return this._volumeToPercent();
		};	
		
		WavePlayer.prototype._percentToVolume = function(percentage) {
			// MIN = 0
			// MAX = 1			
			return percentage / 100;
		};
		
		WavePlayer.prototype._volumeToPercent = function() {
			return this.audioPlayer.volume * 100;
		};		
	} 
	/**
	 * Other browsers and IE8: Use embed because there is an error with bgsound and https for IE8
	 */	
	else {	
		WavePlayer.prototype._init = function() {
			this.embed = this._embedding(this.opts.src);
		}
		
		WavePlayer.prototype._play = function(uri) {
			/*
			 * build new embed tag if uri changes
			 */
			if (this.src != uri) {
				this.embed.parentNode.removeChild(this.embed);
				this.embed = this._embedding(uri);	
			}

			this.embed.Play();
		}
		
		WavePlayer.prototype._stop = function(uri) {
			this.embed.Stop();		
		};	
		
		WavePlayer.prototype._playing = function() {
			return this.embed.playState >= 2;
		};
		
		WavePlayer.prototype._volume = function(percentage) {
			var that = this;
			if (arguments.length > 0) {
				var playing = this._playing();
				this.volumeLevel = percentage;
				
				/*
				 * Need to replace tag because volume changes
				 * doesn't take effect in place.
				 */
				this.stop();
				this.embed.parentNode.removeChild(this.embed);
				this.embed = this._embedding();
				if (playing) {
					setTimeout(function() {
						that.play();
					}, 500);
				}
			}
			
			return this._volumeToPercent();
		};		
		
		WavePlayer.prototype._percentToVolume = function(percentage) {
			// MIN = -10000
			// MAX = 0		
			if (percentage == 0) return -10000;
			return (percentage - 100) * 40;
		};
		
		WavePlayer.prototype._volumeToPercent = function() {
			if (this.embed.volume == -10000) return 0;
			return (this.embed.volume / 40) + 100;
		};		

		/**
		 * Make and append embed tag for embed approach (old browsers)
		 * @param src
		 * @returns {String}
		 */
		WavePlayer.prototype._embedding = function(src, onload) {
			var e = document.createElement('embed');
			e.style.height = 0;
			e.src = src || this.src;
			e.type = 'audio/wav';
			e.volume = this._percentToVolume(this.volumeLevel);
			e.autostart = false;	
			
			this.opts.container.appendChild(e);	
			
			return e;
		};		
	}
	
	/**
	 * Exports
	 */
	window.WavePlayer = WavePlayer;
};

/**********************************************************
 * JQUERY PLUGIN : optional
 **********************************************************/
if (jQuery) {
	WavePlayer.messages = {
		en: {
			play: 'Play',
			stop: 'Stop',
			volume: 'Volume control'
		},
		fr: {
			play: 'Lecture',
			stop: 'Stop',
			volume: 'Contrôle du volume'
		}
	};
	
	(function($) {
		$.fn.wavePlayer = function(opts) {
			var opts = $.extend({
				lang: 'en',
				label: '',
				volumectrl: true // show volume control
			}, opts);
			
			var mess = WavePlayer.messages[opts.lang];
			
			return this.each(function() {
				var $this = $(this);
				var data = $this.data();
				
				/*
				 * Data-attribute can override options
				 */
				var _opts = $.extend({}, opts, data);
				
				/**
				 * Init UI
				 */
				var wavePlayer = new WavePlayer({
					container: $this[0],
					src: _opts.src, // to preload,
					volume: _opts.volume
				});
				
				$this.append(
					'<div class="wave-inner">\
						<span class="wave-buttons">\
							<a href="#" class="wave-action wave-play" alt="' + mess.play + '" title="' + mess.play + '" tabindex="' + (_opts.tabindex || "") + '"></a> \
							<a href="#" class="wave-action wave-stop" alt="' + mess.stop + '" title="' + mess.stop + '" tabindex="' + (_opts.tabindex || "") + '"></a> \
						' + ( _opts.volumectrl ?	'<span class="wave-volume" title="' + mess.volume + '"><span class="wave-volume-label"></span><span class="wave-volume-level"></span></span>' : '') + '\
						' + ( _opts.label ? '<span class="wave-label wave-play">' + _opts.label + '</span>' : '') + '\
						</span> \
					</div>'
				);
				
				/**
				 * Volume control
				 */
				var $volumeCtrl = $('.wave-volume', $this);
				var $volumeLevel = $('.wave-volume-level', $volumeCtrl);
				var $volumeLabel = $('.wave-volume-label', $volumeCtrl);
				
				wavePlayer.on('volumeLevel', function(volumeLevel) {
					$volumeLevel.css({width: volumeLevel + '%'});
					$volumeLabel.text(volumeLevel);
				})
				.fireChanges('volumeLevel');
				
				$volumeCtrl.bind('mousemove click', function(e) {
					/*
					 * button pressed is required for non click event
					 */
					if (!(e.which || e.button) && 
						e.type != 'click') return;
					
					var w = $volumeCtrl.width(),
						x = e.offsetX;
					var vol = parseInt(x * 100 / w);
					
					wavePlayer.volume(vol);
					return false;
				});
				
				/**
				 * Bind buttons action
				 */
				$this
				.delegate('.wave-play', 'click', function() {
					wavePlayer.play(data.src);
					return false;
				})
				.delegate('.wave-stop', 'click', function() {
					wavePlayer.stop();
					return false;
				})
				.delegate('.wave-vol-up', 'click', function() {
					wavePlayer.volumeUp();
					return false;
				})
				.delegate('.wave-vol-down', 'click', function() {
					wavePlayer.volumeDown();
					return false;
				});
				
				return $this;
			});
		};
	})(jQuery);
}