(function ($) {
    "use strict";

    /**
     * Play a media element safely and swallow browser AbortError/NotAllowedError
     * rejections so interrupted play() calls never surface as uncaught promises.
     */
    function safePlay(mediaEl) {
        if (!mediaEl || typeof mediaEl.play !== "function") {
            return Promise.resolve();
        }
        try {
            var playPromise = mediaEl.play();
            if (playPromise && typeof playPromise.catch === "function") {
                return playPromise.catch(function () {});
            }
            return Promise.resolve(playPromise);
        } catch (err) {
            return Promise.resolve();
        }
    }

    $(".tmp-intro-video-card-wrapper").each(function () {
        var $video_container = $(this);
        var $video = $(this).find("#tmp-video-element");
        if (!$video.length) return;

        var videoEl = $video[0];

        // Video Controls
        var $video_controls = $video_container.find(".tmp-video-progress-container");
        var $play_button = $(this).find(".play-button");
        var $mute_button = $video_container.find(".sound-button");
        var $expanded = $(this).find(".expand-icon");
        var $progress_bar = $(this).find(".progress-bar");
        var $progress = $(this).find(".time-bar");
        var $buffer_bar = $(this).find(".buffer-bar");

        var $current = $(this).find(".current");
        var $duration = $(this).find(".duration");

        var hasAutoPlayed = false;

        videoEl.oncanplaythrough = function () {
            if (hasAutoPlayed) return;
            hasAutoPlayed = true;
            videoEl.muted = true;
            safePlay(videoEl);
            $video_controls.addClass("playing");
            if (videoEl.muted) {
                $mute_button.addClass("sound-muted");
            }
        };

        // Toggles play/pause for the video
        function playVideo() {
            if (videoEl.paused) {
                $video_controls.addClass("playing");
                safePlay(videoEl);
            } else {
                videoEl.pause();
                $video_controls.removeClass("playing");
            }
        }

        // Expanded Video Wrapper
        function expanded() {
            $video_container.toggleClass("is-expanded");
        }

        // Play/pause on video click
        $video.click(function () {
            playVideo();
        });

        // Play/pause on button click
        $play_button.click(function () {
            playVideo();
        });

        // Mute video on button click
        $mute_button.click(function () {
            var self = this;
            setTimeout(function () {
                videoEl.muted = !videoEl.muted;
                $(self).toggleClass("sound-muted");
            }, 200);
        });

        // Restart video cleanly when expanded
        function playVideoFormStart() {
            videoEl.currentTime = 0;
            safePlay(videoEl);
        }

        // Expanded Button Click
        $expanded.click(function () {
            expanded();
            playVideoFormStart();
            setTimeout(function () {
                videoEl.muted = false;
                $mute_button.removeClass("sound-muted");
            }, 100);
        });

        // time_format
        function time_format(seconds) {
            if (!isFinite(seconds) || seconds < 0) {
                return "00:00";
            }
            var m = Math.floor(seconds / 60) < 10
                ? "0" + Math.floor(seconds / 60)
                : Math.floor(seconds / 60);
            var s = Math.floor(seconds - m * 60) < 10
                ? "0" + Math.floor(seconds - m * 60)
                : Math.floor(seconds - m * 60);
            return m + ":" + s;
        }

        // startBuffer
        function startBuffer() {
            if (!videoEl.buffered || videoEl.buffered.length === 0 || !videoEl.duration) {
                return;
            }
            var currentBuffer = videoEl.buffered.end(0);
            var maxDuration = videoEl.duration;
            var perc = 100 * currentBuffer / maxDuration;
            $buffer_bar.css("width", perc + "%");

            if (currentBuffer < maxDuration) {
                setTimeout(startBuffer, 500);
            }
        }

        // updatebar
        function updatebar(x) {
            if (!videoEl.duration || !$progress_bar.width()) return;
            var position = x - $progress.offset().left;
            var percentage = 100 * position / $progress_bar.width();
            if (percentage > 100) percentage = 100;
            if (percentage < 0) percentage = 0;
            $progress.css("width", percentage + "%");
            videoEl.currentTime = videoEl.duration * percentage / 100;
        }

        $video.on("loadedmetadata", function () {
            $current.text(time_format(0));
            $duration.text(time_format(videoEl.duration));
            setTimeout(startBuffer, 150);
        });

        // Video duration timer
        $video.on("timeupdate", function () {
            if (!videoEl.duration) return;
            $current.text(time_format(videoEl.currentTime));
            $duration.text(time_format(videoEl.duration));
            var perc = 100 * videoEl.currentTime / videoEl.duration;
            $progress.css("width", perc + "%");
        });

        // when video timebar clicked
        $progress_bar.on("mousedown", function (e) {
            updatebar(e.pageX);
            setTimeout(function () {
                if ($("video").prop("muted")) {
                    $("video").prop("muted", true);
                } else {
                    $("video").prop("muted", false);
                }
            }, 500);
        });
    });

    $(document).ready(function () {
        function closePlayAudio(audioElement, callback) {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
                safePlay(audioElement).then(function () {
                    if (callback) callback();
                });
            } else if (callback) {
                callback();
            }
        }

        // Close button click event with audio playback
        $(".tmp-iv-close-button").click(function (e) {
            e.preventDefault();
            var closeButtonAudio = $("#tmp-close-button-audio")[0];
            closePlayAudio(closeButtonAudio, function () {
                setTimeout(function () {
                    $(".tmp-intro-video-card-wrapper").remove();
                    $(".background-overlay").remove();
                }, 500);
            });
        });

        // Notification bar close button click event
        $(document).on("click", ".inbio-close-button", function () {
            $(".inbio-notification-bar").fadeOut();
        });
    });

    if (typeof ThemesparkObj !== "undefined" && ThemesparkObj.intro_video_close_sound) {
        var closeSound = `<audio class="tmp-close-button-audio-modal" preload="auto"><source src="${ThemesparkObj.intro_video_close_sound}" type="audio/mpeg"><source src="${ThemesparkObj.intro_video_close_sound}" type="audio/ogg"></audio>`;

        if ($(".modal-header .close,.inbio-close-button,.close-menu-activation").length > 0) {
            $(".modal-header .close,.inbio-close-button").each(function (index) {
                if (index === 0) {
                    $(this).after(closeSound);
                }
            });

            $(".modal-header .close,.inbio-close-button,.close-menu-activation").click(function () {
                var modalButtonAudio = $(".tmp-close-button-audio-modal")[0];
                if (modalButtonAudio) {
                    modalButtonAudio.pause();
                    modalButtonAudio.currentTime = 0;
                    safePlay(modalButtonAudio);
                }
            });
        }
    }

    // Prevent uncaught promise rejections on all <audio> and <video> play() calls
    if (typeof HTMLMediaElement !== "undefined" && HTMLMediaElement.prototype.play) {
        HTMLMediaElement.prototype.play = (function (origPlay) {
            return function () {
                var promise = origPlay.apply(this, arguments);
                if (promise !== undefined && typeof promise.catch === "function") {
                    return promise.catch(function () {});
                }
                return promise;
            };
        })(HTMLMediaElement.prototype.play);
    }

})(jQuery, window);
