import React from 'react';
import classNames from 'classnames';
import { Stream, StreamPlayerApi } from '@cloudflare/stream-react';
import { useIsRtl } from '@deriv/api';
import { isSafariBrowser, mobileOSDetect } from '@deriv/shared';
import throttle from 'lodash.throttle';
import { useDebounceCallback } from 'usehooks-ts';
import VideoOverlay from './video-overlay';
import VideoControls from './video-controls';

type TVideoPlayerProps = {
    className?: string;
    data_testid?: string;
    height?: string;
    hide_volume_control?: boolean;
    is_mobile?: boolean;
    is_v2?: boolean;
    increased_drag_area?: boolean;
    muted?: boolean;
    src: string;
    show_loading?: boolean;
    onModalClose?: () => void;
    should_show_controls?: boolean;
};
type TSupportedEvent = React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement> | TouchEvent | MouseEvent;

const dragMoveHandlerThrottled = throttle(
    (e: TSupportedEvent, callback: (e: TSupportedEvent) => void) => callback(e),
    50
);

const VideoPlayer = ({
    className,
    data_testid,
    height,
    hide_volume_control = false,
    is_mobile,
    is_v2,
    increased_drag_area,
    muted = false,
    src,
    show_loading = false,
    onModalClose,
    should_show_controls = false,
}: TVideoPlayerProps) => {
    const is_rtl = useIsRtl();

    const should_autoplay =
        (!isSafariBrowser() || (is_mobile && mobileOSDetect() !== 'iOS' && mobileOSDetect() !== 'unknown')) ?? true;

    const [current_time, setCurrentTime] = React.useState<number>();
    const [has_enlarged_dot, setHasEnlargedDot] = React.useState(false);
    const [is_animated, setIsAnimated] = React.useState(true);
    const [is_loading, setIsLoading] = React.useState(true);
    const [is_playing, setIsPlaying] = React.useState(false);
    const [is_muted, setIsMuted] = React.useState(muted);
    const [playback_rate, setPlaybackRate] = React.useState(1);
    const [show_controls, setShowControls] = React.useState(should_show_controls ? true : !should_autoplay);
    const [is_in_initial_period, setIsInInitialPeriod] = React.useState(should_show_controls);

    React.useEffect(() => {
        if (should_show_controls) {
            const tutorial_timeout = setTimeout(() => {
                setShowControls(false);
                setIsInInitialPeriod(false);
            }, 5000);
            return () => clearTimeout(tutorial_timeout);
        }
    }, [should_show_controls]);
    const [shift_X, setShiftX] = React.useState(0);
    const [video_duration, setVideoDuration] = React.useState<number>();
    const [volume, setVolume] = React.useState(0.5);

    const video_ref = React.useRef<StreamPlayerApi>();
    const progress_bar_filled_ref = React.useRef<HTMLDivElement>(null);
    const progress_bar_ref = React.useRef<HTMLDivElement>(null);
    const progress_dot_ref = React.useRef<HTMLSpanElement>(null);
    const animation_ref = React.useRef(0);
    const new_time_ref = React.useRef(0);
    const should_check_time_ref = React.useRef(false);

    const replay_animation_timeout = React.useRef<ReturnType<typeof setTimeout>>();
    const toggle_animation_timeout = React.useRef<ReturnType<typeof setTimeout>>();
    const inactivity_timeout = React.useRef<ReturnType<typeof setTimeout>>();

    const is_dragging = React.useRef(false);
    const is_ended = React.useRef(false);

    const calculateNewWidth = (e: TSupportedEvent) => {
        const full_width = 100;
        const progress_bar = progress_bar_ref.current;
        const client_X =
            e.type === 'mousemove' || e.type === 'click'
                ? (e as MouseEvent).clientX
                : (e as TouchEvent).changedTouches[0].clientX;

        let new_width =
            ((client_X - shift_X - (progress_bar?.getBoundingClientRect().left ?? 0)) /
                (progress_bar?.getBoundingClientRect().width ?? 0)) *
            full_width;
        if (is_rtl) new_width = full_width - new_width;
        if (new_width >= full_width) new_width = full_width;
        if (new_width <= 0) new_width = 0;
        return parseFloat(new_width.toFixed(3));
    };

    const dragStartHandler = (e: React.MouseEvent<HTMLSpanElement> | React.TouchEvent<HTMLSpanElement>) => {
        if (e.type === 'mousedown') e.preventDefault();
        e.stopPropagation();

        video_ref?.current?.pause();
        cancelAnimationFrame(animation_ref.current);
        debouncedRewind.cancel();
        setIsPlaying(false);
        setIsAnimated(false);
        is_dragging.current = true;

        const point = progress_dot_ref.current as HTMLElement;
        const client_X =
            e.type === 'mousedown'
                ? (e as React.MouseEvent<HTMLSpanElement>).clientX
                : (e as React.TouchEvent<HTMLSpanElement>).changedTouches[0].clientX;
        setShiftX(client_X - (point?.getBoundingClientRect().left ?? 0));

        if (is_mobile) setHasEnlargedDot(true);
    };

    const dragMoveHandler = (e: TSupportedEvent) => {
        if (e.type === 'mousemove') e.preventDefault();
        e.stopPropagation();

        if (!is_dragging.current) return;
        if (!video_ref.current || !progress_bar_filled_ref.current) return;

        cancelAnimationFrame(animation_ref.current);
        debouncedRewind.cancel();

        const new_width = calculateNewWidth(e);
        progress_bar_filled_ref.current.style.setProperty('width', `${new_width}%`);
        const calculated_time = Math.round((Number(video_ref.current.duration) * new_width) / 100);
        const new_time = calculated_time >= video_ref.current.duration ? video_ref.current.duration : calculated_time;
        video_ref.current.currentTime = new_time;
        new_time_ref.current = new_time;
        setCurrentTime(new_time);
    };

    const dragEndHandler = (e: MouseEvent | TouchEvent) => {
        if (e.type === 'mouseup') e.preventDefault();
        e.stopPropagation();

        if (!is_dragging.current) return;
        if (!video_ref.current || !progress_bar_filled_ref.current) return;

        cancelAnimationFrame(animation_ref.current);
        debouncedRewind.cancel();
        is_dragging.current = false;
        should_check_time_ref.current = false;

        debouncedRewind();

        if (is_mobile) setHasEnlargedDot(false);
    };

    const onRewind = (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (is_dragging.current) return;
        if (e.type === 'keydown') return;
        if ((e.target as HTMLElement).className === 'player__progress-dot') return;
        if (!video_ref.current || !progress_bar_filled_ref.current) return;

        cancelAnimationFrame(animation_ref.current);
        debouncedRewind.cancel();
        setIsAnimated(false);
        video_ref.current.pause();

        const new_width = calculateNewWidth(e as React.MouseEvent<HTMLDivElement>);
        progress_bar_filled_ref.current.style.setProperty('width', `${new_width}%`);
        const calculated_time = Math.round((Number(video_ref.current.duration) * new_width) / 100);
        const new_time = calculated_time >= video_ref.current.duration ? video_ref.current.duration : calculated_time;
        video_ref.current.currentTime = new_time;
        new_time_ref.current = new_time;
        setCurrentTime(new_time);
        should_check_time_ref.current = false;

        debouncedRewind();
    };

    const debouncedRewind = useDebounceCallback(() => {
        if (!video_ref.current) return;

        const is_rewind_to_the_end = Math.round(new_time_ref.current) === Math.round(video_ref.current?.duration);
        if (!video_ref.current?.ended || !is_rewind_to_the_end) {
            cancelAnimationFrame(animation_ref.current);
            setIsAnimated(true);
            video_ref.current.currentTime = new_time_ref.current;
            animation_ref.current = requestAnimationFrame(repeat);
            video_ref.current.play().catch(() => null);
            is_ended.current = false;
        }
    }, 500);

    const onLoadedMetaData = () => {
        if (!video_ref.current || !progress_bar_filled_ref.current) return;

        setVideoDuration(video_ref.current.duration);
        setIsPlaying(should_autoplay);
        setIsLoading(false);

        if (should_autoplay) animation_ref.current = requestAnimationFrame(repeat);
    };

    const onEnded = () => {
        is_ended.current = true;
        progress_bar_filled_ref?.current?.style.setProperty('width', '100%');
        setCurrentTime(video_duration);
        setIsPlaying(false);
        setIsAnimated(false);
        cancelAnimationFrame(animation_ref.current);
        should_check_time_ref.current = false;
    };

    const repeat = () => {
        if (!video_ref.current || !progress_bar_filled_ref.current) return;
        if (should_check_time_ref.current && new_time_ref.current !== video_ref.current.currentTime) {
            cancelAnimationFrame(animation_ref.current);
            animation_ref.current = requestAnimationFrame(repeat);
            return;
        }
        if (should_check_time_ref.current) should_check_time_ref.current = false;
        setCurrentTime(video_ref.current.currentTime);

        const new_width = parseFloat(
            ((video_ref.current.currentTime / Number(video_ref.current.duration)) * 100).toFixed(3)
        );
        progress_bar_filled_ref.current.style.setProperty('width', `${new_width >= 99 ? 100 : new_width}%`);

        animation_ref.current = requestAnimationFrame(repeat);
    };

    const togglePlay = React.useCallback(
        (
            e:
                | React.MouseEvent<HTMLDivElement | HTMLButtonElement>
                | React.KeyboardEvent<HTMLDivElement | HTMLButtonElement>
        ) => {
            e.stopPropagation();

            if (!video_ref.current || !progress_bar_filled_ref.current) return;

            cancelAnimationFrame(animation_ref.current);
            debouncedRewind.cancel();
            clearTimeout(replay_animation_timeout.current);
            clearTimeout(toggle_animation_timeout.current);
            setIsAnimated(false);

            // handle replay by resetting time and progress bar at the end of the video
            if (is_ended.current) {
                is_ended.current = false;
                video_ref.current.currentTime = 0;
                new_time_ref.current = 0;
                setCurrentTime(0);
                progress_bar_filled_ref.current.style.setProperty('width', '0%');

                replay_animation_timeout.current = setTimeout(() => {
                    animation_ref.current = requestAnimationFrame(repeat);
                    video_ref?.current?.play().catch(() => null);
                }, 500);
                toggle_animation_timeout.current = setTimeout(() => {
                    setIsAnimated(true);
                }, 1000);
                return;
            }

            is_ended.current = false;

            if (is_playing) {
                video_ref.current.pause();
                setIsPlaying(false);
            } else {
                replay_animation_timeout.current = setTimeout(() => {
                    animation_ref.current = requestAnimationFrame(repeat);
                    video_ref?.current?.play().catch(() => null);
                }, 500);
                toggle_animation_timeout.current = setTimeout(() => {
                    setIsAnimated(true);
                }, 1000);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [is_playing]
    );

    React.useEffect(() => {
        const dragMoveHandlerThrottledWrapper = (e: TSupportedEvent) => dragMoveHandlerThrottled(e, dragMoveHandler);

        if (is_mobile) {
            document.addEventListener('touchmove', dragMoveHandlerThrottledWrapper);
            document.addEventListener('touchend', dragEndHandler);
            document.addEventListener('touchcancel', dragEndHandler);
        } else {
            document.addEventListener('mousemove', dragMoveHandlerThrottledWrapper);
            document.addEventListener('mouseup', dragEndHandler);
        }

        return () => {
            if (is_mobile) {
                document.removeEventListener('touchmove', dragMoveHandlerThrottledWrapper);
                document.removeEventListener('touchend', dragEndHandler);
                document.removeEventListener('touchcancel', dragEndHandler);
            } else {
                document.removeEventListener('mousemove', dragMoveHandlerThrottledWrapper);
                document.removeEventListener('mouseup', dragEndHandler);
            }
            cancelAnimationFrame(animation_ref.current);
            clearTimeout(replay_animation_timeout.current);
            clearTimeout(toggle_animation_timeout.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // logic and effect to cancel/reset timeout to auto close when there's user controls interaction
    const resetInactivityTimer = React.useCallback(() => {
        if (inactivity_timeout.current) {
            clearTimeout(inactivity_timeout.current);
        }

        if (is_v2 && is_mobile && !is_ended.current) {
            inactivity_timeout.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [is_v2, is_mobile]);

    React.useEffect(() => {
        if (show_controls && is_v2 && is_mobile && !is_ended.current) {
            resetInactivityTimer();
        }
        return () => {
            if (inactivity_timeout.current) {
                clearTimeout(inactivity_timeout.current);
            }
        };
    }, [show_controls, is_v2, is_mobile, resetInactivityTimer]);

    return (
        <div
            className={classNames(className, 'player__wrapper')}
            onMouseOver={is_mobile || is_in_initial_period ? undefined : () => setShowControls(true)}
            onMouseLeave={is_mobile || is_in_initial_period ? undefined : () => setShowControls(false)}
            data-testid={data_testid}
        >
            <Stream
                autoplay={should_autoplay && !is_dragging.current}
                height={!is_v2 ? (height ?? (is_mobile ? '184.5px' : '270px')) : undefined}
                className={classNames('', { player: is_v2 })}
                width='100%'
                letterboxColor='transparent'
                muted={is_muted}
                preload='auto'
                responsive={is_v2 ? undefined : false}
                src={src}
                streamRef={video_ref}
                onEnded={onEnded}
                onPlay={() => setIsPlaying(true)}
                onLoadedMetaData={onLoadedMetaData}
                onSeeked={() => (should_check_time_ref.current = false)}
                onSeeking={() => (should_check_time_ref.current = false)}
                playbackRate={playback_rate}
                volume={volume}
            />
            {is_loading && show_loading && (
                <div className='player__loader' style={{ height: height ?? (is_mobile ? '184.5px' : '270px') }}>
                    <div className='player__loader-circle' />
                </div>
            )}
            <VideoOverlay
                onClick={() => setShowControls(!show_controls)}
                togglePlay={togglePlay}
                show_controls={show_controls}
                is_ended={is_ended.current}
                is_mobile={is_mobile}
                is_playing={is_playing}
                is_v2={is_v2}
                onModalClose={onModalClose}
            />
            <VideoControls
                block_controls={is_dragging.current}
                current_time={current_time}
                dragStartHandler={dragStartHandler}
                has_enlarged_dot={has_enlarged_dot}
                hide_volume_control={hide_volume_control}
                is_animated={is_animated}
                is_ended={is_ended.current}
                is_playing={is_playing}
                is_mobile={is_mobile}
                is_muted={is_muted}
                is_v2={is_v2}
                increased_drag_area={increased_drag_area}
                onRewind={onRewind}
                onVolumeChange={setVolume}
                onPlaybackRateChange={setPlaybackRate}
                show_controls={show_controls}
                togglePlay={togglePlay}
                toggleMute={setIsMuted}
                video_duration={video_duration}
                volume={volume}
                progress_bar_filled_ref={progress_bar_filled_ref}
                progress_bar_ref={progress_bar_ref}
                progress_dot_ref={progress_dot_ref}
                playback_rate={playback_rate}
                onUserActivity={resetInactivityTimer}
            />
        </div>
    );
};

export default React.memo(VideoPlayer);
