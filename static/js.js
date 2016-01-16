// http://www.html5rocks.com/en/tutorials/es6/promises/
var Story = (function($, d) {
	// TODO: pre-fetch story
	// TODO: bind to next/previous buttons
	// TODO: cache state of story with local storage
	// TODO: remove jQuery bindings

	// Clean timeout deferred function
	function timeout(duration) {
		return new Promise(function(resolve) {
			setTimeout(resolve, duration);
		});
	}

	// Promise based AJAX requester
	function get(url) {
		return new Promise(function(resolve, reject) {
			var req = new XMLHttpRequest();
			req.open('GET', '/story/' + url);
			req.onload = function() {
				if (req.status >= 200 && req.status < 400) resolve(req.response);
				else reject(Error(req.statusText));
			};
			req.onerror = reject;
			req.send();
		});
	}

	// JSON parsing Promise wrapper for AJAX requester
	function getJSON(url) {
		return get(url).then(JSON.parse).catch(function(err) {
			console.log("getJSON failed for", url, err);
			throw err;
		});
	}

	// Render a chapter in the drawing window
	function renderChapter(chapter) {
		$('#story').append('<h2>' + chapter.title + '</h2>');
		chapter.text.forEach(function(line) {
			$('#story').append('<p>' + line + '</p>');
		});

		// Return number of words in chapter
		return chapter.text.reduce(function(count, line) {
			var temp = line.replace(/ /g, '');
			return count + line.length - temp.length + 1;
		}, 0);
	}

	function printAll() {
		return getJSON('story.json').then(function (story) {
			$('#preamble').hide();
			$('#story').html('').parent().parent().show();
			$('#nav').hide();
			return story.chapters.map(getJSON).reduce(function(sequence, chapterPromise) {
				return sequence.then(function() {
					return chapterPromise;
				}).then(function(chapter) {
					var time = renderChapter(chapter) / 300 * 60000;
					console.log('sleeping for:', time, 'ms');
					time = 0;
					return timeout(time); // / reading rate * milliseconds in minute
				});
			}, Promise.resolve());
		}).then(function() {
			console.log('Complete...');
		}).catch(function(err) {
			console.log("Argh, broken: " + err.message);
			alert("Something went wrong... Notify the boss");
		}).then(function() {
			// document.querySelector('.spinner').style.display = 'none';
		});
	}

	$('#ready').on('click', function () {
		var $btn = $(this).button('loading');
		Story.printAll().then(function() {
			$btn.button('reset');
		});
	});

	return {
		printAll: printAll,
	};
})(jQuery, document);

!function Konami(a, d, f) {
	var codes = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], cursor = 0, max = codes.length;
	var x = function(e) {
		cursor = e.keyCode == codes[cursor] ? cursor + 1 : 0;
		if (cursor >= max) {
			d.removeEventListener(a, x);
			d.body.classList.add('konami');
			f();
		}
	}
	d.addEventListener(a, x);
}('keydown', document, Story.printAll);
