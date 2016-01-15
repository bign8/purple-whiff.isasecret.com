(function($) {
	var $story = $('#story');

	function timeout(duration) {
		var dfd = $.Deferred();
		setTimeout(function() {
			dfd.resolve();
		}, duration);
		return dfd.promise();
	}

	$('#ready').on('click', function () {
		var $btn = $(this).button('loading');

		$.when($.ajax("/story/full.html"), timeout(1000)).
		done(function(data) {
			$story.html(data);
		}).
		fail(function() {
			alert("Error loading data... please try again...");
		}).
		always(function() {
			$btn.button('reset');
		});
	});
})(jQuery)
