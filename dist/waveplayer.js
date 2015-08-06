function WavePlayer(container) {
	this.ie = !!document.documentMode;
	this.playing = false;
	this.$bgsound = $('<bgsound volume="3" balance="0"/>').appendTo(container || 'body');
	
	if ('Audio' in window)
		this.audioPlayer = new Audio();
};


WavePlayer.prototype.play = function(uri) {
	if (this.ie)
		this.$bgsound.attr('src', uri);
	else {
		this.audioPlayer.src = uri;
		this.audioPlayer.play();
	}
	
	this.playing = true;
	
	return this;
};

WavePlayer.prototype.stop = function() {
	if (this.ie)
		this.$bgsound.attr('src', '');
	else {
		this.audioPlayer.src = '';
		this.audioPlayer.pause();
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