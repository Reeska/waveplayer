function WavePlayer(container) {
	this.container = container || 'body';
	this.ie = document.documentMode;
	this.playing = false;
	
	this.$bgsound = this.ie > 8 ? $('<bgsound volume="3" balance="0"/>').appendTo(this.container) : null;
	this.audioPlayer = 'Audio' in window ? new Audio() : null
};

WavePlayer.prototype.supported = function() {
	return this.ie || this.audioPlayer;
};

WavePlayer.prototype.play = function(uri) {
	/**
	 * Use for IE9+ : .wav file not supported for audio and embed tag
	 */
	if (this.ie > 8) {
		this.$bgsound.attr('src', uri);
	} 
	/**
	 * For modern browsers
	 */
	else if (this.audioPlayer) {
		this.audioPlayer.src = uri;
		this.audioPlayer.play();
	} 
	/**
	 * Other browsers and IE8: Use embed because there is an error with bgsound and https for IE8
	 */
	else {
		/*
		 * remove embed if uri changes
		 */
		if (this.embed && this.embed[0].src != uri) {
			this.embed.remove();
			this.embed = null;
		}
		
		if (this.embed)
			this.embed[0].Play();
		else
			this.embed = $('<embed height="0" src="' + uri +'" type="audio/wav"/>').appendTo(this.container);
	}
	
	this.playing = true;
	
	return this;
};

WavePlayer.prototype.stop = function() {
	if (this.ie > 8) {
		this.$bgsound.attr('src', '');
	} else if (this.audioPlayer) {
		this.audioPlayer.src = '';
		this.audioPlayer.pause();
	} else if (this.embed) {
		this.embed[0].Stop();		
	}
	
	this.playing = false;
	return this;
};

(function($) {
	$.fn.wavePlayer = function() {
		return this.each(function() {
			var $this = $(this);
			
			var wavePlayer = new WavePlayer($this);
			var data = $this.data();
			
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
				wavePlayer.stop(data.src);
			});
			
			return $this;
		});
	};
})(jQuery);