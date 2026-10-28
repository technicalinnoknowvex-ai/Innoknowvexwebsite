"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import Footer from "../layout/Footer/Footer";
import Header from "../layout/Header/Header";
import orbitImage from "../../assets/images/orvexa/orbit-transparent.webp";
import styles from "../../pages/Orvexa/Orvexa.module.css";

export default function OrvexaPage() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [canPlayGreeting, setCanPlayGreeting] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const playGreeting = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setCanPlayGreeting(false);
    } catch {
      setCanPlayGreeting(true);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const timeoutId = window.setTimeout(playGreeting, 700);
    return () => {
      window.clearTimeout(timeoutId);
      audio?.pause();
    };
  }, [playGreeting]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { willReadFrequently: true });

    if (!video || !canvas || !context) {
      console.error("ORVEXA video background removal could not be initialized.");
      return;
    }

    let animationFrameId;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 30;

    const startVideo = () => {
      if (!video.paused) return;

      video.play().catch((error) => {
        console.error("ORVEXA robot video could not start playing.", error);
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startVideo();
      }
    };

    const renderFrame = (time) => {
      animationFrameId = window.requestAnimationFrame(renderFrame);

      if (
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        time - lastFrameTime < frameInterval
      ) {
        return;
      }

      lastFrameTime = time;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = frame.data;

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const greenExcess = green - Math.max(red, blue);

        if (greenExcess > 8 && greenExcess < 110) {
          const brightestChannel = Math.max(red, green, blue);
          const despillAmount = Math.min(1, (greenExcess - 8) / 36);
          pixels[index] += (brightestChannel - red) * despillAmount;
          pixels[index + 1] += (brightestChannel - green) * despillAmount;
          pixels[index + 2] += (brightestChannel - blue) * despillAmount;
        }

        const correctedRed = pixels[index];
        const correctedGreen = pixels[index + 1];
        const correctedBlue = pixels[index + 2];
        const correctedMinimum = Math.min(
          correctedRed,
          correctedGreen,
          correctedBlue,
        );
        const correctedMaximum = Math.max(
          correctedRed,
          correctedGreen,
          correctedBlue,
        );

        if (correctedMinimum > 90 && correctedMaximum - correctedMinimum < 90) {
          const luminance =
            correctedRed * 0.2126 +
            correctedGreen * 0.7152 +
            correctedBlue * 0.0722;
          const whiteShell = Math.min(255, luminance * 1.12 + 10);
          pixels[index] = whiteShell;
          pixels[index + 1] = whiteShell;
          pixels[index + 2] = whiteShell;
        }

        if (greenExcess > 40) {
          const keyAmount = Math.min(1, (greenExcess - 40) / 64);
          const smoothKeyAmount =
            keyAmount * keyAmount * (3 - 2 * keyAmount);

          pixels[index + 3] = 255 * (1 - smoothKeyAmount);
        }
      }

      context.putImageData(frame, 0, 0);
    };

    video.addEventListener("loadeddata", startVideo);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    startVideo();
    animationFrameId = window.requestAnimationFrame(renderFrame);

    return () => {
      video.removeEventListener("loadeddata", startVideo);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const stopGreeting = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  return (
    <>
      <Header activeItem="ORVEXA" />
      <main className={styles.page}>
        <section className={styles.comingSoon} aria-labelledby="orvexa-title">
          <div className={styles.glow} aria-hidden="true" />
          <div className={styles.content}>
            <p className={styles.eyebrow}>Introducing</p>
            <div className={styles.brand}>
              <Image
                alt=""
                className={styles.orbit}
                height={475}
                src={orbitImage}
                unoptimized
                width={640}
              />
              <h1 id="orvexa-title">
                <span aria-hidden="true">RVEXA</span>
                <span className={styles.visuallyHidden}>ORVEXA</span>
              </h1>
            </div>
            <p className={styles.tagline}>AI that works with you</p>
            <h2>Something exciting is on its way.</h2>
            <p className={styles.description}>
              ORVEXA is being built to help you learn smarter, plan your career,
              and make more of every opportunity. Stay tuned.
            </p>
            {isSpeaking && (
              <button
                className={styles.voiceButton}
                type="button"
                onClick={stopGreeting}
              >
                <Square size={16} />
                Stop
              </button>
            )}
            {canPlayGreeting && !isSpeaking && (
              <button
                className={styles.voiceButton}
                type="button"
                onClick={playGreeting}
              >
                <Play size={16} />
                Play ORVEXA greeting
              </button>
            )}
            <span className={styles.comingSoonLabel}>Coming soon</span>
            <Link className={styles.homeLink} href="/">
              <span aria-hidden="true">←</span> Back to home
            </Link>
          </div>
          <div className={styles.robotFrame}>
            <video
              ref={videoRef}
              className={styles.robotVideoSource}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            >
              <source src="/orvexa/cuterobo.mp4" type="video/mp4" />
            </video>
            <canvas
              ref={canvasRef}
              aria-label="Animated ORVEXA robot"
              className={styles.robotVideoCanvas}
              height="640"
              role="img"
              width="360"
            />
          </div>
          <audio
            ref={audioRef}
            preload="auto"
            onPlay={() => setIsSpeaking(true)}
            onPause={() => setIsSpeaking(false)}
            onEnded={() => setIsSpeaking(false)}
            onError={() => setCanPlayGreeting(true)}
          >
            <source src="/orvexa/voice.mp3" type="audio/mpeg" />
          </audio>
        </section>
      </main>
      <Footer />
    </>
  );
}
