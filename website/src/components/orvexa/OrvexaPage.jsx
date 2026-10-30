"use client";

import Link from "next/link";
import Image from "next/image";
import orbitImage from "../../assets/images/orvexa/orbit-transparent.webp";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowUp, Mic, Play, X, Volume2 } from "lucide-react";
import Header from "../layout/Header/Header";
import styles from "../../pages/Orvexa/Orvexa.module.css";

function OrbitMark({ className = "" }) {
  return <Image src={orbitImage} alt="" aria-hidden="true" width={96} height={72} className={className} draggable={false} onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()} unoptimized />;
}

export default function OrvexaPage() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [canPlayGreeting, setCanPlayGreeting] = useState(false);
  const [stage, setStage] = useState("intro");
  const stuntEnabled = true;
  const [robotMode, setRobotMode] = useState("idle");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const launchRef = useRef(null);
  const closeRef = useRef(null);
  const inputRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sideCanvasRef = useRef(null);
  const stuntVideoRef = useRef(null);
  const stuntPlayingRef = useRef(false);
  const openingStuntPendingRef = useRef(false);
  const openingStuntPlayingRef = useRef(false);
  const stageRef = useRef("intro");

  useEffect(() => {
    if (stage !== "chat") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [stage]);

  const startRobotGreeting = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.paused) return;

    video.play().catch((error) => {
      console.error("ORVEXA robot video could not start playing.", error);
    });
  }, []);

  const startRobotIdle = useCallback(() => {
    const video = stuntVideoRef.current;
    stuntPlayingRef.current = false;
    openingStuntPlayingRef.current = false;
    setRobotMode("idle");
    if (!video || stageRef.current !== "chat") return;
    video.pause();
    if (video.readyState < HTMLMediaElement.HAVE_METADATA) return;
    video.currentTime = 6.2;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.play().catch(() => {});
    }
  }, []);

  const playRobotStunt = useCallback(async () => {
    const video = stuntVideoRef.current;
    if (!stuntEnabled || stuntPlayingRef.current || stageRef.current !== "chat" || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      openingStuntPendingRef.current = false;
      startRobotIdle();
      return;
    }
    openingStuntPlayingRef.current = openingStuntPendingRef.current;
    openingStuntPendingRef.current = false;
    stuntPlayingRef.current = true;
    setRobotMode("stunt");
    // The generated lead-in briefly crops the reference image; start at the
    // first fully framed pose, before the actual cartwheel begins.
    video.currentTime = 1.2;
    try { await video.play(); } catch { startRobotIdle(); }
  }, [startRobotIdle, stuntEnabled]);

  useEffect(() => {
    stageRef.current = stage;
    if (stage !== "chat") {
      stuntPlayingRef.current = false;
      openingStuntPlayingRef.current = false;
      openingStuntPendingRef.current = false;
      stuntVideoRef.current?.pause();
    }
    if (stage !== "intro") {
      videoRef.current?.pause();
      // Keep the original introduction paused while the companion uses its idle segment.
      if (stage === "chat" && videoRef.current) {
        videoRef.current.currentTime = 6.9;
        if (openingStuntPendingRef.current) {
          playRobotStunt();
        } else { startRobotIdle(); }
      }
    }
  }, [stage, startRobotIdle, playRobotStunt]);

  const playGreeting = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || audio.dataset.dismissed === "true") return;

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

    const processingCanvas = document.createElement("canvas");
    const processingContext = processingCanvas.getContext("2d", { willReadFrequently: true });
    if (!processingContext) return;

    let animationFrameId;
    let lastFrameTime = 0;
    let lastFrameSource = null;
    let lastMediaTime = -1;
    let lastSideCanvas = null;
    const frameInterval = 1000 / 24;

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        audioRef.current &&
        !audioRef.current.paused
      ) {
        startRobotGreeting();
      }
    };

    const renderFrame = (time) => {
      animationFrameId = window.requestAnimationFrame(renderFrame);

      const sourceVideo = stageRef.current === "chat" && stuntVideoRef.current?.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? stuntVideoRef.current : video;
      if (
        stageRef.current === "ready" ||
        !sourceVideo ||
        sourceVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        time - lastFrameTime < frameInterval
      ) {
        return;
      }

      if (sourceVideo.seeking) return;
      if (sourceVideo === lastFrameSource && sourceVideo.currentTime === lastMediaTime && sideCanvasRef.current === lastSideCanvas) return;
      lastFrameTime = time;
      lastFrameSource = sourceVideo;
      lastMediaTime = sourceVideo.currentTime;
      lastSideCanvas = sideCanvasRef.current;
      // Process at the native aspect ratio: landscape stunts must not be
      // stretched or squeezed into the portrait introduction canvas.
      const resolution = Math.min(1, 1280 / Math.max(sourceVideo.videoWidth, sourceVideo.videoHeight));
      const frameWidth = Math.max(1, Math.round(sourceVideo.videoWidth * resolution));
      const frameHeight = Math.max(1, Math.round(sourceVideo.videoHeight * resolution));
      if (processingCanvas.width !== frameWidth || processingCanvas.height !== frameHeight) {
        processingCanvas.width = frameWidth;
        processingCanvas.height = frameHeight;
      }
      processingContext.drawImage(sourceVideo, 0, 0, frameWidth, frameHeight);
      const frame = processingContext.getImageData(0, 0, frameWidth, frameHeight);
      let minX = frameWidth, minY = frameHeight, maxX = -1, maxY = -1;
      const pixels = frame.data;

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const greenExcess = green - Math.max(red, blue);

        // Only key genuinely green background pixels. Ratio checks preserve
        // reflected green on white limbs and the dark teal hands/feet.
        const greenDominance = greenExcess / Math.max(1, green);
        const hueKey = Math.max(0, Math.min(1, (greenDominance - 0.10) / 0.14));
        const strengthKey = Math.max(0, Math.min(1, (greenExcess - 20) / 36));
        const keyAmount = hueKey * strengthKey;
        const smoothKey = keyAmount * keyAmount * (3 - 2 * keyAmount);
        pixels[index + 3] = 255 * (1 - smoothKey);
        if (keyAmount >= 1) continue;
        if (pixels[index + 3] > 96) {
          const pixel = index / 4;
          const x = pixel % frameWidth;
          const y = Math.floor(pixel / frameWidth);
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        }

        // Suppress green spill at the silhouette, without whitening background.
        if (greenExcess > 0) {
          pixels[index + 1] = green - greenExcess * 0.85;
        }
        // Continuous despill avoids abrupt white/grey patches at a threshold.
        const spill = Math.min(32, Math.max(0, greenExcess));
        pixels[index] = Math.min(255, red + spill * 0.35);
        pixels[index + 2] = Math.min(255, blue + spill * 0.15);
      }

      processingContext.putImageData(frame, 0, 0);
      if (stageRef.current === "intro") {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        const introScale = Math.min(canvas.width / frameWidth, canvas.height / frameHeight);
        context.drawImage(processingCanvas, (canvas.width - frameWidth * introScale) / 2, (canvas.height - frameHeight * introScale) / 2, frameWidth * introScale, frameHeight * introScale);
      }
      const sideCanvas = sideCanvasRef.current;
      if (stageRef.current === "chat" && sideCanvas) {
        const sideContext = sideCanvas.getContext("2d");
        sideContext?.clearRect(0, 0, sideCanvas.width, sideCanvas.height);
        if (sideContext) { sideContext.imageSmoothingEnabled = true; sideContext.imageSmoothingQuality = "high"; }
        if (maxX >= minX && maxY >= minY) {
          const subjectWidth = maxX - minX + 1;
          const subjectHeight = maxY - minY + 1;
          const padding = 50;
          const scale = Math.min((sideCanvas.width - padding * 2) / subjectWidth, (sideCanvas.height - padding * 2) / subjectHeight);
          const width = subjectWidth * scale;
          const height = subjectHeight * scale;
          sideContext?.drawImage(processingCanvas, minX, minY, subjectWidth, subjectHeight, (sideCanvas.width - width) / 2, sideCanvas.height - padding - height, width, height);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    animationFrameId = window.requestAnimationFrame(renderFrame);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [startRobotGreeting]);

  const stopRobotStunt = () => {
    // Let the one-time opening performance finish even when the pointer leaves.
    if (openingStuntPlayingRef.current) return;
    startRobotIdle();
  };


  const finishIntro = () => {
    if (audioRef.current) audioRef.current.dataset.dismissed = "true";
    audioRef.current?.pause();
    videoRef.current?.pause();
    setIsSpeaking(false);
    setStage("ready");
  };

  const openAssistant = () => {
    audioRef.current?.pause();
    videoRef.current?.pause();
    openingStuntPendingRef.current = true;
    setStage("chat");
    setNotice("");
    window.requestAnimationFrame(() => closeRef.current?.focus());
  };

  const closeAssistant = () => {
    setStage("ready");
    window.requestAnimationFrame(() => launchRef.current?.focus());
  };

  const submitMessage = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setNotice("This is an interface preview. Live ORVEXA replies are not connected yet; your message has not been sent.");
  };

  return (
    <>
      <div inert={stage === "chat"}><Header activeItem="ORVEXA" /></div>
      <main className={styles.page} onContextMenu={(event) => {
        // A casual-save deterrent only, not protection from browser inspection.
        if (event.target instanceof Element && event.target.closest("img, canvas, video, [data-orvexa-art]")) event.preventDefault();
      }} onDragStart={(event) => {
        if (event.target instanceof Element && event.target.closest("img, canvas, video, [data-orvexa-art]")) event.preventDefault();
      }}>
        <section className={styles.scene} data-stage={stage} aria-labelledby="orvexa-title">
          <div className={styles.grid} aria-hidden="true" />
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.orbitOne} aria-hidden="true" />
          <div className={styles.orbitTwo} aria-hidden="true" />
          <div className={styles.orbitThree} aria-hidden="true" />
          <div className={styles.floatingShards} aria-hidden="true"><i /><i /><i /></div>
          <div className={styles.topline} inert={stage === "chat"}>
            <Link href="/" className={styles.homeLink}>← Back to home</Link>
            <span className={styles.previewBadge}><span /> EXPERIENCE PREVIEW</span>
          </div>

          <div className={styles.heading} aria-hidden={stage === "chat"}>
            <p className={styles.eyebrow}>A LITTLE CURIOSITY. A NEW POSSIBILITY.</p>
            <h1 id="orvexa-title" aria-label="Meet ORVEXA.">Meet <span className={styles.brandWord} aria-hidden="true"><OrbitMark className={styles.brandOrbit} />RVEXA.</span></h1>
            <p>Your next chapter starts with a conversation.</p>
          </div>

          <div className={styles.robotFrame} aria-hidden={stage !== "intro"}>
            <div className={styles.robotAura} />
            <video ref={videoRef} className={styles.robotVideoSource} controlsList="nodownload noremoteplayback" disablePictureInPicture loop muted playsInline preload="auto" aria-hidden="true">
              <source src="/orvexa/cuterobo.mp4" type="video/mp4" />
            </video>
            <canvas ref={canvasRef} aria-label="Animated ORVEXA robot" className={styles.robotVideoCanvas} height="1280" role="img" width="720" />
            <div className={styles.robotFloor} />
          </div>

          {stage === "intro" && <div className={styles.introControls}>
            <p><Volume2 size={15} /> {isSpeaking ? "A hello from your future learning companion" : "Let’s get to know each other"}</p>
            <div>
              {canPlayGreeting && !isSpeaking && <button type="button" className={styles.textButton} onClick={playGreeting}><Play size={14} /> Play greeting</button>}
              <button type="button" className={styles.textButton} onClick={finishIntro}>{isSpeaking ? "Skip intro" : "Continue"} <ArrowUpRight size={15} /></button>
            </div>
          </div>}

          <div className={styles.launchStage} inert={stage !== "ready"} aria-hidden={stage !== "ready"}>
            <div className={styles.launchCaption}><OrbitMark className={styles.captionOrbit} /><span>A SPACE FOR YOUR NEXT BIG IDEA</span></div>
            <button ref={launchRef} type="button" className={styles.launchButton} data-orvexa-art="true" onClick={openAssistant}>
              <span className={styles.launchSurface}>
              <span className={styles.launchIcon}><OrbitMark className={styles.buttonOrbit} /></span>
              <span>Talk with ORVEXA<small>YOUR NEXT STEP, TOGETHER</small></span>
              <ArrowUpRight className={styles.launchArrow} size={29} />
              </span>
            </button>
            <p className={styles.launchHint}>Type or speak. Let’s find your next step.</p>
            <span className={styles.previewNote}>Interface preview · Live AI coming soon</span>
          </div>

          {stage === "chat" && <div className={styles.chatLayer}>
            <aside className={styles.companionDock} data-robot-mode={robotMode} aria-hidden="true" onPointerEnter={playRobotStunt} onPointerLeave={stopRobotStunt}>
              {stuntEnabled && <video key="robot-gymnastics-wide" ref={stuntVideoRef} className={styles.robotVideoSource} controlsList="nodownload noremoteplayback" disablePictureInPicture muted playsInline preload="auto" onLoadedData={() => {
                if (openingStuntPendingRef.current) playRobotStunt();
                else if (!stuntPlayingRef.current) startRobotIdle();
              }} onTimeUpdate={() => {
                const video = stuntVideoRef.current;
                if (!stuntPlayingRef.current && video && video.currentTime >= 7.8) startRobotIdle();
              }} onEnded={startRobotIdle} onError={() => { stuntPlayingRef.current = false; openingStuntPendingRef.current = false; openingStuntPlayingRef.current = false; setRobotMode("idle"); }}><source src="/orvexa/robot-gymnastics-wide.mp4" type="video/mp4" /></video>}
              <div className={styles.dockEyebrow}><span /> YOUR ORVEXA SPACE</div>
              <div className={styles.companionStage}>
                <div className={styles.companionRing} />
                <div className={styles.companionRingTwo} />
                <div className={styles.gymnast}><canvas ref={sideCanvasRef} className={styles.companionCanvas} width="960" height="1280" /></div>
                <div className={styles.pedestal}><span /></div>
                <span className={styles.companionChip}><OrbitMark className={styles.chipOrbit} /> MADE FOR YOUR NEXT CHAPTER</span>
              </div>
              <h2>A little guidance.<br /><span>Endless possibilities.</span></h2>
              <p>Your learning & career companion.</p>
              {stuntEnabled && <p className={styles.hoverHint}>Hover over me for a little surprise.</p>}
            </aside>
            <section className={styles.chatPanel} role="dialog" aria-modal="true" aria-labelledby="chat-title"
              onKeyDown={(event) => {
                if (event.key === "Escape") { event.stopPropagation(); closeAssistant(); }
                if (event.key === "Tab") {
                  const items = Array.from(event.currentTarget.querySelectorAll('button:not([disabled]), textarea, a[href]')).filter((item) => item.getClientRects().length > 0);
                  const first = items[0]; const last = items[items.length - 1];
                  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
                }
              }}>
              <header className={styles.chatHeader}>
                <div className={styles.assistantMark} data-orvexa-art="true"><OrbitMark className={styles.headerOrbit} /></div>
                <div><h2 id="chat-title">ORVEXA</h2><p>Learning & career companion · Preview</p></div>
                {stuntEnabled && <button type="button" className={styles.motionToggle} aria-label="Play robot move" onClick={playRobotStunt} title="Play robot gymnastics"><Play size={14} /><span>Robot move</span></button>}
                <button ref={closeRef} type="button" className={styles.iconButton} aria-label="Close ORVEXA" onClick={closeAssistant}><X size={21} /></button>
              </header>
              <div className={styles.conversation}>
                <span className={styles.welcomeIcon} data-orvexa-art="true"><span className={styles.orbitMotion}><OrbitMark className={styles.welcomeOrbit} /></span></span>
                <p className={styles.eyebrow}>YOUR AMBITION. OUR STARTING POINT.</p>
                <h3>What’s your<br /><span>next big step?</span></h3>
                <p className={styles.welcomeCopy}>A new skill, a career move, or a stronger resume.<br />Start with what’s on your mind.</p>
                <div className={styles.suggestions}>
                  {["Find my learning path", "Explore my career options", "Improve my resume"].map((text) => <button type="button" key={text} onClick={() => { setDraft(text); inputRef.current?.focus(); }}>{text}<ArrowUpRight size={16} /></button>)}
                </div>
              </div>
              <div className={styles.composerArea}>
                <p className={styles.notice} role="status">{notice || "Preview only — messages and microphone audio are not sent or recorded."}</p>
                <form className={styles.composer} onSubmit={submitMessage}>
                  <textarea ref={inputRef} aria-label="Message ORVEXA" placeholder="What would you like to explore?" rows={1} maxLength={4000} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitMessage(event); } }} />
                  <button type="button" className={styles.micButton} aria-label="Voice preview information" onClick={() => setNotice("Voice conversations are not connected yet. Your microphone has not been activated.")}><Mic size={19} /></button>
                  <button type="submit" className={styles.sendButton} aria-label="Try sending a preview message" disabled={!draft.trim()}><ArrowUp size={21} /></button>
                </form>
                <p className={styles.composerFootnote}>Built for your possibilities. Designed around you.</p>
              </div>
            </section>
          </div>}
          <div className={styles.sceneFooter} aria-hidden="true"><span>LEARN. EXPLORE. BECOME.</span><span>THE FUTURE LOOKS LIKE YOU. ↗</span></div>
          <audio ref={audioRef} preload="auto"
            onPlay={() => { setIsSpeaking(true); startRobotGreeting(); }}
            onPause={() => { setIsSpeaking(false); videoRef.current?.pause(); }}
            onEnded={finishIntro}
            onError={() => setCanPlayGreeting(true)}>
            <source src="/orvexa/voice.mp3" type="audio/mpeg" />
          </audio>
        </section>
      </main>
    </>
  );
}
