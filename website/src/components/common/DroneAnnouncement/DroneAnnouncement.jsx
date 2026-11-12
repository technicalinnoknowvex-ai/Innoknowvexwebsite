"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./DroneAnnouncement.module.css";

const SOURCE_WIDTH = 960;
const SOURCE_HEIGHT = 540;
const PLAYBACK_RATE = 0.2;
const VIDEO_START_TIME = 2;
const BANNER_OPEN_VIDEO_TIME = 3.6;
const CENTER_HOLD_VIDEO_TIME = 4.6;
const CENTER_HOLD_DURATION = 2000;
const FLIGHT_FALLBACK_DURATION = 40000;
const VIDEO_URL = "/announcements/dronenew.mp4";

function removeGreenScreen(context) {
  const { data } = context.getImageData(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const greenExcess = green - Math.max(red, blue);
    const keyProgress = Math.max(0, Math.min((greenExcess - 8) / 28, 1));
    const smoothKey = keyProgress * keyProgress * (3 - 2 * keyProgress);

    data[index + 3] = Math.round(data[index + 3] * (1 - smoothKey));

    if (smoothKey > 0 && data[index + 3] > 0) {
      data[index + 1] = Math.min(green, Math.max(red, blue) + 24);
    }
  }

  context.putImageData(new ImageData(data, SOURCE_WIDTH, SOURCE_HEIGHT), 0, 0);
}

export default function DroneAnnouncement() {
  const [isVisible, setIsVisible] = useState(false);
  const flightRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeoutId = window.setTimeout(() => setIsVisible(true), 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    const flight = flightRef.current;
    const video = videoRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !flight || !video || !context) return;

    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    const videoStartTime = isMobile ? BANNER_OPEN_VIDEO_TIME : VIDEO_START_TIME;
    let cancelled = false;
    let animationFrameId;
    let startTime;
    let pausedDuration = 0;
    let holdStartedAt;
    let holdProgress;
    let lastDrawTime = 0;
    let didStartPlayback = false;
    let isHolding = false;
    let didHold = false;

    const render = (now) => {
      if (cancelled) return;

      const duration = Number.isFinite(video.duration)
        ? ((video.duration - videoStartTime) * 1000) / PLAYBACK_RATE
        : FLIGHT_FALLBACK_DURATION;
      const elapsed = isHolding
        ? holdProgress * duration
        : now - startTime - pausedDuration;
      const progress = Math.min(elapsed / duration, 1);
      const bannerOpenProgress = Math.min(
        (BANNER_OPEN_VIDEO_TIME - videoStartTime) /
          (video.duration - videoStartTime),
        1,
      );
      const centerHoldProgress = Math.min(
        (CENTER_HOLD_VIDEO_TIME - videoStartTime) /
          (video.duration - videoStartTime),
        1,
      );

      if (!isMobile && !didHold && !isHolding && progress >= centerHoldProgress) {
        isHolding = true;
        holdStartedAt = now;
        holdProgress = centerHoldProgress;
        video.pause();
      }

      if (isHolding && now - holdStartedAt >= CENTER_HOLD_DURATION) {
        pausedDuration += now - holdStartedAt;
        isHolding = false;
        didHold = true;
        video.play().catch((error) => {
          if (!cancelled) {
            console.error("The drone announcement video could not resume.", error);
            setIsVisible(false);
          }
        });
      }

      const width = flight.offsetWidth;
      const startX = -width * 1.1;
      const centerX = (window.innerWidth - width) / 2;
      const endX = window.innerWidth + width * 1.1;
      let x;

      if (isMobile) {
        x = startX + (endX - startX) * progress;
      } else if (progress <= bannerOpenProgress) {
        x = startX + (0 - startX) * (progress / bannerOpenProgress);
      } else if (progress <= centerHoldProgress) {
        x =
          centerX *
          ((progress - bannerOpenProgress) /
            (centerHoldProgress - bannerOpenProgress));
      } else {
        x =
          centerX +
          (endX - centerX) *
            ((progress - centerHoldProgress) / (1 - centerHoldProgress));
      }

      const float = Math.sin(elapsed / 900) * 3;

      flight.style.transform = `translate3d(${x}px, calc(-50% + ${float}px), 0)`;

      if (
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        now - lastDrawTime >= 1000 / 30
      ) {
        context.drawImage(video, 0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
        removeGreenScreen(context);
        lastDrawTime = now;
      }

      if (!isHolding && progress === 1) {
        setIsVisible(false);
        return;
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (cancelled || didStartPlayback) return;
      didStartPlayback = true;

      video.currentTime = videoStartTime;
      video.playbackRate = PLAYBACK_RATE;
      video.play().then(
        () => {
          if (cancelled) return;
          startTime = performance.now();
          animationFrameId = window.requestAnimationFrame(render);
        },
        (error) => {
          if (cancelled) return;
          console.error("The drone announcement video could not be played.", error);
          setIsVisible(false);
        },
      );
    };

    video.addEventListener("canplay", start, { once: true });
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) start();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(animationFrameId);
      video.pause();
      video.removeEventListener("canplay", start);
    };
  }, [isVisible]);

  return (
    <div
      className={`${styles.overlay} ${isVisible ? styles.visible : ""}`}
      aria-hidden="true"
    >
      <div ref={flightRef} className={styles.flight}>
        <video
          ref={videoRef}
          className={styles.source}
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
        />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={SOURCE_WIDTH}
          height={SOURCE_HEIGHT}
        />
      </div>
    </div>
  );
}
