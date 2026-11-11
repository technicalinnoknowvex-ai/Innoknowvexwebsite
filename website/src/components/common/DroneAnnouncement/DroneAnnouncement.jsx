"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./DroneAnnouncement.module.css";

const SOURCE_WIDTH = 960;
const SOURCE_HEIGHT = 540;
const PLAYBACK_RATE = 0.15;
const FLIGHT_FALLBACK_DURATION = 53000;
const VIDEO_URL = "/announcements/gree_drone_banner.mp4";

function removeGreenScreen(context) {
  const { data } = context.getImageData(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const greenExcess = green - Math.max(red, blue);
    const keyProgress = Math.max(0, Math.min((greenExcess - 24) / 46, 1));
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
  const pointerRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return;
      pointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const timeoutId = window.setTimeout(() => setIsVisible(true), 3000);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    const flight = flightRef.current;
    const video = videoRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !flight || !video || !context) return;

    let cancelled = false;
    let animationFrameId;
    let startTime;
    let pausedAt;
    let lastDrawTime = 0;
    let isPointerPaused = false;
    let didStartPlayback = false;

    const render = (now) => {
      if (cancelled) return;

      const bounds = flight.getBoundingClientRect();
      const pointer = pointerRef.current;
      const pointerIsOverFlight =
        pointer &&
        pointer.x >= bounds.left &&
        pointer.x <= bounds.right &&
        pointer.y >= bounds.top &&
        pointer.y <= bounds.bottom;

      if (pointerIsOverFlight) {
        if (!isPointerPaused) {
          isPointerPaused = true;
          pausedAt = now;
          video.pause();
        }
        animationFrameId = window.requestAnimationFrame(render);
        return;
      }

      if (isPointerPaused) {
        startTime += now - pausedAt;
        isPointerPaused = false;
        video.play().catch((error) => {
          if (!cancelled) {
            console.error("The drone announcement video could not resume.", error);
            setIsVisible(false);
          }
        });
      }

      const duration = Number.isFinite(video.duration)
        ? (video.duration * 1000) / PLAYBACK_RATE
        : FLIGHT_FALLBACK_DURATION;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const width = flight.offsetWidth;
      const height = flight.offsetHeight;
      const x =
        -width * 0.85 + (window.innerWidth + width * 1.05) * easedProgress;
      const y = window.innerHeight + height - (window.innerHeight + height * 2.1) * easedProgress;
      const float = Math.sin(elapsed / 900) * 4;

      flight.style.transform = `translate3d(${x}px, ${y + float}px, 0)`;

      if (
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        now - lastDrawTime >= 1000 / 30
      ) {
        context.drawImage(video, 0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
        removeGreenScreen(context);
        lastDrawTime = now;
      }

      if (progress === 1) {
        setIsVisible(false);
        return;
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    const start = () => {
      if (cancelled || didStartPlayback) return;
      didStartPlayback = true;

      video.playbackRate = PLAYBACK_RATE;
      video.play().then(() => {
        if (cancelled) return;
        startTime = performance.now();
        animationFrameId = window.requestAnimationFrame(render);
      }).catch((error) => {
        if (cancelled) return;
        console.error("The drone announcement video could not be played.", error);
        setIsVisible(false);
      });
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

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
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
