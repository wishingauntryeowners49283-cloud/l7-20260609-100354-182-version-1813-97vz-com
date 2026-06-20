(function () {
    document.querySelectorAll('.player-box').forEach(function (box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('.player-cover');
        var source = box.getAttribute('data-stream');
        var hls = null;
        var prepared = false;

        function restore() {
            if (cover) {
                cover.classList.remove('is-hidden');
            }
        }

        function playVideo() {
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(restore);
            }
        }

        function prepare() {
            if (prepared || !video || !source) {
                return true;
            }

            prepared = true;
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return true;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                return false;
            }

            video.src = source;
            return true;
        }

        function start() {
            if (!video) {
                return;
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            if (prepare()) {
                playVideo();
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('error', restore);
        }

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
