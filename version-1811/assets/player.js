(function () {
    function setupPlayer(id, source) {
        var shell = document.getElementById(id);
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        var button = shell.querySelector(".play-button");
        var started = false;
        var hlsInstance = null;

        function start() {
            if (!video) {
                return;
            }
            if (!started) {
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.controls = true;
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!started) {
                    start();
                }
            });
        }
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.setupPlayer = setupPlayer;
})();
