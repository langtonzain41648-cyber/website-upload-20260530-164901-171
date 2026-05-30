(function () {
    var hlsLoader = null;
    var hlsLibraryUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';

    function loadHls(callback, fallback) {
        if (window.Hls) {
            callback();
            return;
        }

        if (hlsLoader) {
            hlsLoader.addEventListener('load', callback, { once: true });
            hlsLoader.addEventListener('error', fallback, { once: true });
            return;
        }

        hlsLoader = document.createElement('script');
        hlsLoader.src = hlsLibraryUrl;
        hlsLoader.async = true;
        hlsLoader.addEventListener('load', callback, { once: true });
        hlsLoader.addEventListener('error', fallback, { once: true });
        document.head.appendChild(hlsLoader);
    }

    function setupPlayer(root) {
        var video = root.querySelector('video');
        var button = root.querySelector('[data-play-button]');
        var url = root.getAttribute('data-video-url');
        var attaching = false;
        var attached = false;
        var callbacks = [];
        var hls = null;

        function flush() {
            attached = true;
            attaching = false;
            callbacks.splice(0).forEach(function (callback) {
                callback();
            });
        }

        function direct() {
            video.src = url;
            flush();
        }

        function attach(callback) {
            if (!video || !url) {
                return;
            }

            callbacks.push(callback);

            if (attached) {
                flush();
                return;
            }

            if (attaching) {
                return;
            }

            attaching = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                direct();
                return;
            }

            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hls.on(window.Hls.Events.MANIFEST_PARSED, flush);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && !attached) {
                            direct();
                        }
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    direct();
                }
            }, direct);
        }

        function begin() {
            if (button) {
                button.classList.add('is-hidden');
            }
            video.controls = true;
            attach(function () {
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            });
        }

        if (!video) {
            return;
        }

        if (button) {
            button.addEventListener('click', begin);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            } else {
                video.pause();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.from(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
    });
}());
