(function () {
    function build(video, streamUrl) {
        if (video.getAttribute("data-ready") === "true") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.setAttribute("data-ready", "true");
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            video.setAttribute("data-ready", "true");
            return;
        }

        video.src = streamUrl;
        video.setAttribute("data-ready", "true");
    }

    window.initializePlayer = function (videoId, buttonId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);

        if (!video || !streamUrl) {
            return;
        }

        var started = false;

        function startPlayback() {
            if (started) {
                if (video.paused) {
                    video.play().catch(function () {});
                }
                return;
            }

            started = true;
            build(video, streamUrl);

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            video.play().catch(function () {
                started = false;

                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (!video.ended && video.currentTime === 0 && overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
    };
})();
