{
	/**********************************************************
	 * COMMON & INTERFACE
	 **********************************************************/
	var ie = document.documentMode;
	
	function WavePlayer(opts) {
		this.opts = {
			src: opts.src || '',
			container: opts.container || document.body,
			resetPlay: opts.resetPlay || true // Always playing from start (not pause) (HTML5 audio only)
		};
		
		this.playing = false;
		this.src = opts.src;
		
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
			this.bgsound.volume = 0;
			this.bgsound.src = uri;
		};
		
		WavePlayer.prototype._stop = function(uri) {
			this.bgsound.removeAttribute('src');
		};
	} 
	/**
	 * For modern browsers
	 */	
	else if ('Audio' in window) {
		WavePlayer.prototype._init = function() {
			this.audioPlayer = new Audio(this.opts.src);
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
			 * remove embed if uri changes
			 */
			if (this.embed && this.src != uri) {
				this.emebed.parentNode.removeChild(this.embed);
				delete this.embed;
			}
			
			if (this.embed)
				this.embed.Play();
			else
				this.embed = this._embedding(opts.src);			
		}
		
		WavePlayer.prototype._stop = function(uri) {
			if (this.embed) {
				this.embed.Stop();		
			}			
		};	

		/**
		 * Make and append embed tag for embed approach (old browsers)
		 * @param src
		 * @returns {String}
		 */
		WavePlayer.prototype._embedding = function(src) {
			var e = document.createElement('embed');
			e.style.height = 0;
			e.src = src;
			e.type = 'audio/wav';
			e.volume = 0;
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
	(function($) {
		$.fn.wavePlayer = function() {
			return this.each(function() {
				var $this = $(this);
				var data = $this.data();
				
				var wavePlayer = new WavePlayer({
					container: $this[0],
					src: data.src // to preload
				});
				
				$this.append(
					'<div class="wave-inner">\
						<span class="wave-buttons"><i class="wave-play"></i> <i class="wave-stop"></i></span> \
						<span class="wave-label wave-play">' + (data.label ? data.label : '') + '</span>\
					</div>'
				);
				
				$('.wave-play', $this).click(function() {
					wavePlayer.play(data.src);
				});
				$('.wave-stop', $this).click(function() {
					wavePlayer.stop();
				});
				
				return $this;
			});
		};
	})(jQuery);
}