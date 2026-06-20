(function () {
    var shell = document.querySelector('[data-player]');

    if (!shell) {
        return;
    }

    var video = shell.querySelector('[data-video]');
    var veil = shell.querySelector('[data-veil]');
    var launchers = Array.prototype.slice.call(shell.querySelectorAll('[data-launch]'));
    var stream = video ? video.getAttribute('data-src') : '';
    var attached = false;
    var hls = null;

    var attach = function () {
        if (!video || !stream || attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            attached = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            attached = true;
        }
    };

    var play = function () {
        attach();

        if (veil) {
            veil.classList.add('is-hidden');
        }

        if (video) {
            video.controls = true;
            var request = video.play();

            if (request && typeof request.catch === 'function') {
                request.catch(function () {});
            }
        }
    };

    launchers.forEach(function (button) {
        button.addEventListener('click', play);
    });

    if (video) {
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                play();
                return;
            }

            video.pause();
        });
    }
})();
