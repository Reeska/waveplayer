{
	/**********************************************************
	 * COMMON & INTERFACE
	 **********************************************************/
	var ie = document.documentMode,
		console = window.console || { log: function() {}, error: function() {} };
	
	function WavePlayer(opts) {
		this.opts = {
			src: opts.src || '',
			container: opts.container || document.body,
			resetPlay: opts.resetPlay || true, // Always playing from start (not pause) (HTML5 audio only),
			volume: opts.volume || 100
		};
		
		this.playing = false;
		this.src = this.opts.src;
		this.volume = this.opts.volume;
		
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
		
		return (this.volume = this._volume.apply(this, arguments));
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
	
	/**********************************************************
	 * IMPLEMENTATION
	 **********************************************************/	
	/**
	 * Use for IE9+ : .wav file not supported for audio and embed tag
	 */	
	if (ie > 8) {
		WavePlayer.prototype._init = function() {
			var e = document.createElement('bgsound');
			e.volume = this._percentToVolume(this.volume);
			e.balance = 0;
			e.src = this.opts.src;
			
			this.bgsound = e;
			this.opts.container.appendChild(e);			
		};
		
		WavePlayer.prototype._play = function(uri) {
			this.bgsound.volume = 0;
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
			return (percentage - 100) * 100;
		};
		
		WavePlayer.prototype._volumeToPercent = function() {
			return this.bgsound.volume * 100;
		};		
	} 
	/**
	 * For modern browsers
	 */	
	else if ('Audio' in window) {
		WavePlayer.prototype._init = function() {
			this.audioPlayer = new Audio(this.opts.src);
			this.audioPlayer.volume = this._percentToVolume(this.volume);
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
			if (this.embed && this.src != uri) {
				this.embed.parentNode.removeChild(this.embed);
				this.embed = this._embedding(uri);	
			}

			this.embed.Play();
		}
		
		WavePlayer.prototype._stop = function(uri) {
			this.embed.Stop();		
		};	
		
		WavePlayer.prototype._volume = function(percentage) {
			if (arguments.length > 0) {
				this.volume = percentage;
				this.embed.parentNode.removeChild(this.embed);
				this.embed = this._embedding();
			}
			
			return this._volumeToPercent();
		};		
		
		WavePlayer.prototype._percentToVolume = function(percentage) {
			// MIN = -10000
			// MAX = 0			
			return (percentage - 100) * 40;
		};
		
		WavePlayer.prototype._volumeToPercent = function() {
			return (this.embed.volume / 40) + 100;
		};		

		/**
		 * Make and append embed tag for embed approach (old browsers)
		 * @param src
		 * @returns {String}
		 */
		WavePlayer.prototype._embedding = function(src) {
			var e = document.createElement('embed');
			e.style.height = 0;
			e.src = src || this.src;
			e.type = 'audio/wav';
			e.volume = this._percentToVolume(this.volume);
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
			stop: 'Stop'
		},
		fr: {
			play: 'Lecture',
			stop: 'Stop'
		}
	};
	
	(function($) {
		$.fn.wavePlayer = function(opts) {
			var opts = $.extend({
				lang: 'en'
			}, opts);
			
			var mess = WavePlayer.messages[opts.lang];
			
			return this.each(function() {
				var $this = $(this);
				var data = $this.data();
				
				var wavePlayer = new WavePlayer({
					container: $this[0],
					src: data.src, // to preload,
					volume: data.volume
				});
				
				$this.append(
					'<div class="wave-inner">\
						<span class="wave-buttons">\
							<a href="#" class="wave-action wave-play" alt="' + mess.play + '" title="' + mess.play + '" tabindex="' + (data.tabindex || "") + '"></a> \
							<a href="#" class="wave-action wave-stop" alt="' + mess.stop + '" title="' + mess.stop + '" tabindex="' + (data.tabindex || "") + '"></a>\
						</span> \
						<span class="wave-label wave-play">' + (data.label ? data.label : '') + '</span>\
					</div>'
				);
				
				/*
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