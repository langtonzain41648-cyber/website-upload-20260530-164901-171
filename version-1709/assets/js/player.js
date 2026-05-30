(function () {
    var shell = document.querySelector('[data-player]');

    if (!shell) {
        return;
    }

    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-source');
    var title = shell.getAttribute('data-title') || '';
    var centerButton = shell.querySelector('[data-play-center]');
    var playButton = shell.querySelector('[data-play]');
    var muteButton = shell.querySelector('[data-mute]');
    var fullscreenButton = shell.querySelector('[data-fullscreen]');
    var state = shell.querySelector('[data-player-state]');
    var stateText = shell.querySelector('[data-player-state-text]');
    var titleNode = shell.querySelector('[data-player-title]');
    var hls = null;

    if (!video || !source) {
        return;
    }

    if (titleNode) {
        titleNode.textContent = title;
    }

    function setState(message, visible) {
        if (state && stateText) {
            stateText.textContent = message || '';
            state.classList.toggle('show', Boolean(visible));
        }
    }

    function updatePlayButtons() {
        var symbol = video.paused ? '▶' : 'Ⅱ';
        if (playButton) {
            playButton.textContent = symbol;
        }
        if (centerButton) {
            centerButton.textContent = video.paused ? '▶' : 'Ⅱ';
            centerButton.classList.toggle('playing', !video.paused);
        }
    }

    function attachSource() {
        setState('加载中...', true);

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setState('', false);
            }, { once: true });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                setState('', false);
            });
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    setState('网络连接不稳定，正在重新加载...', true);
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    setState('视频正在恢复播放...', true);
                    hls.recoverMediaError();
                } else {
                    setState('播放器暂时无法载入当前视频', true);
                    hls.destroy();
                }
            });
            return;
        }

        setState('当前浏览器不支持此视频格式', true);
    }

    function togglePlay() {
        if (video.paused) {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setState('请再次点击播放按钮开始观看', true);
                });
            }
        } else {
            video.pause();
        }
    }

    function toggleMute() {
        video.muted = !video.muted;
        if (muteButton) {
            muteButton.textContent = video.muted ? '静' : '音';
        }
    }

    function toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (shell.requestFullscreen) {
            shell.requestFullscreen();
        }
    }

    [centerButton, playButton, video].forEach(function (node) {
        if (node) {
            node.addEventListener('click', togglePlay);
        }
    });

    if (muteButton) {
        muteButton.addEventListener('click', toggleMute);
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', toggleFullscreen);
    }

    video.addEventListener('play', function () {
        setState('', false);
        updatePlayButtons();
    });

    video.addEventListener('pause', updatePlayButtons);
    video.addEventListener('waiting', function () {
        setState('缓冲中...', true);
    });
    video.addEventListener('playing', function () {
        setState('', false);
    });
    video.addEventListener('error', function () {
        setState('视频加载失败，请稍后重试', true);
    });

    attachSource();
    updatePlayButtons();

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
})();
