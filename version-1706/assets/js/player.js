(function () {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("start-play");
    var configNode = document.getElementById("player-config");

    if (!video || !button || !configNode) {
        return;
    }

    var config = {};
    try {
        config = JSON.parse(configNode.textContent || "{}");
    } catch (error) {
        config = {};
    }

    var source = config.src || "";
    var attached = false;
    var hls = null;

    function attach() {
        if (attached || !source) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }
        video.src = source;
    }

    function start() {
        attach();
        button.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (!attached || video.paused) {
            start();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
            hls.destroy();
        }
    });
})();
