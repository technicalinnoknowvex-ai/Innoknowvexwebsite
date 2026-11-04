"use client";

import Link from "next/link";
import Image from "next/image";
import orbitImage from "../../assets/images/orvexa/orbit-transparent.webp";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowUp, Mic, Play, X, Volume2 } from "lucide-react";
import Header from "../layout/Header/Header";
import styles from "../../pages/Orvexa/Orvexa.module.css";
import {
  clearAuthStorage,
  getStudentPortfolio,
  updateStudentPortfolio,
} from "../../lib/auth-api";

const EMPTY_PROFILE = {
  current_status: "",
  education_level: "",
  skills: [],
  learning_skills: [],
  projects: [],
  experience: [],
  interests: [],
  goals: [],
  ai_personalization_consent: false,
  onboarding_completed: false,
};
const ORVEXA_RETURN_PATH = "/orvexa?openChat=1";

function profileToDraft(profile = EMPTY_PROFILE) {
  return {
    current_status: profile.current_status || "",
    education_level: profile.education_level || "",
    skills: (profile.skills || []).join("\n"),
    learning_skills: (profile.learning_skills || []).join("\n"),
    projects: (profile.projects || [])
      .map((project) => [project.title, project.description || "", (project.technologies || []).join(", "), project.url || ""].join(" | "))
      .join("\n"),
    experience: (profile.experience || [])
      .map((item) => [item.role, item.organization || "", item.description || "", item.startDate || "", item.endDate || ""].join(" | "))
      .join("\n"),
    interests: (profile.interests || []).join("\n"),
    goals: (profile.goals || []).join("\n"),
    ai_personalization_consent: profile.ai_personalization_consent === true,
  };
}

function parseList(value) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function draftToProfile(draft) {
  const projectRows = draft.projects.split("\n").map((row) => row.trim()).filter(Boolean);
  const experienceRows = draft.experience.split("\n").map((row) => row.trim()).filter(Boolean);

  return {
    current_status: draft.current_status,
    education_level: draft.education_level.trim() || null,
    skills: parseList(draft.skills),
    learning_skills: parseList(draft.learning_skills),
    projects: projectRows.map((row) => {
      const [projectTitle, projectDescription = "", technologies = "", url = ""] =
        row.split("|").map((part) => part.trim());
      return {
        title: projectTitle,
        description: projectDescription,
        technologies: parseList(technologies),
        url,
      };
    }),
    experience: experienceRows.map((row) => {
      const [role, organization = "", description = "", startDate = "", endDate = ""] =
        row.split("|").map((part) => part.trim());
      return { role, organization, description, startDate, endDate };
    }),
    interests: parseList(draft.interests),
    goals: parseList(draft.goals),
    ai_personalization_consent: draft.ai_personalization_consent,
    onboarding_completed: true,
  };
}

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
  const [profileStatus, setProfileStatus] = useState("loading");
  const [profileError, setProfileError] = useState("");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [profileDraft, setProfileDraft] = useState(profileToDraft());
  const [profileStep, setProfileStep] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [skipProfileSetup, setSkipProfileSetup] = useState(false);
  const launchRef = useRef(null);
  const closeRef = useRef(null);
  const inputRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const sideCanvasRef = useRef(null);
  const stuntVideoRef = useRef(null);
  const helloVideoRef = useRef(null);
  const helloStartedRef = useRef(false);
  const stuntPlayingRef = useRef(false);
  const openingStuntPendingRef = useRef(false);
  const openingStuntPlayingRef = useRef(false);
  const returnedToChatRef = useRef(false);
  const stageRef = useRef("intro");

  useEffect(() => {
    if (stage !== "chat") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [stage]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("openChat") !== "1") return;
    returnedToChatRef.current = true;
    const frameId = window.requestAnimationFrame(() => setStage("chat"));
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (stage !== "chat") return undefined;
    let isCurrent = true;

    async function loadLearnerProfile() {
      const accessToken = window.sessionStorage.getItem("innoknowvex_access_token");
      setProfileError("");
      setSkipProfileSetup(false);
      setProfileStatus("loading");
      setIsEditingProfile(false);

      if (!accessToken) {
        setProfileStatus("signed-out");
        return;
      }

      try {
        const savedProfile = await getStudentPortfolio(accessToken);
        if (!isCurrent) return;
        const nextProfile = { ...EMPTY_PROFILE, ...savedProfile };
        setProfile(nextProfile);
        setProfileDraft(profileToDraft(nextProfile));
        setSkipProfileSetup(nextProfile.onboarding_completed);
        setProfileStatus(nextProfile.onboarding_completed ? "complete" : "incomplete");
      } catch (error) {
        if (!isCurrent) return;
        if (error.status === 401) {
          clearAuthStorage();
          setProfileStatus("signed-out");
          return;
        }
        setProfileError("We couldn’t load your learner profile. Please try again.");
        setProfileStatus("error");
      }
    }

    loadLearnerProfile();
    return () => {
      isCurrent = false;
    };
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
    const hello = helloVideoRef.current;
    if (!hello || hello.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || helloStartedRef.current) return;
    helloStartedRef.current = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    hello.currentTime = reducedMotion ? Math.max(0, hello.duration - 0.1) : 0;
    if (!reducedMotion) hello.play().catch(() => {});
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
    helloStartedRef.current = false;
    helloVideoRef.current?.pause();
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
      helloVideoRef.current?.pause();
      helloStartedRef.current = false;
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
    if (returnedToChatRef.current) return undefined;
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

      const hello = helloVideoRef.current;
      const showingHello = stageRef.current === "chat" && !stuntPlayingRef.current && helloStartedRef.current && hello?.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
      const sourceVideo = showingHello
        ? hello
        : stageRef.current === "chat" && stuntPlayingRef.current && stuntVideoRef.current?.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
          ? stuntVideoRef.current
          : video;
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
          if (showingHello) {
            // Use the reference standing pose as a fixed anchor: the hand can
            // wave freely without auto-centering or resizing the entire robot.
            const fixedScale = Math.min((sideCanvas.width - padding * 2) / (292 * frameWidth / 1280), (sideCanvas.height - padding * 2) / (604 * frameHeight / 720));
            const x = sideCanvas.width / 2 - (631 * frameWidth / 1280) * fixedScale;
            const y = sideCanvas.height - padding - (694 * frameHeight / 720) * fixedScale;
            sideContext?.drawImage(processingCanvas, x, y, frameWidth * fixedScale, frameHeight * fixedScale);
          } else {
            sideContext?.drawImage(processingCanvas, minX, minY, subjectWidth, subjectHeight, (sideCanvas.width - width) / 2, sideCanvas.height - padding - height, width, height);
          }
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
    const url = new URL(window.location.href);
    url.searchParams.set("openChat", "1");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setStage("chat");
    setNotice("");
    window.requestAnimationFrame(() => closeRef.current?.focus());
  };

  const closeAssistant = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("openChat");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    setStage("ready");
    window.requestAnimationFrame(() => launchRef.current?.focus());
  };

  const submitMessage = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setNotice("This is an interface preview. Live ORVEXA replies are not connected yet; your message has not been sent.");
  };

  function editSavedProfileStep(step) {
    setProfileDraft(profileToDraft(profile));
    setProfileStep(step);
    setProfileError("");
    setIsEditingProfile(true);
    setSkipProfileSetup(false);
  }

  async function saveLearnerProfile() {
    const accessToken = window.sessionStorage.getItem("innoknowvex_access_token");
    if (!accessToken) {
      setProfileStatus("signed-out");
      return;
    }
    if (!profileDraft.ai_personalization_consent) {
      setProfileError("Please agree to save your profile for personalized guidance, or skip setup.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");
    try {
      const savedProfile = await updateStudentPortfolio(accessToken, draftToProfile(profileDraft));
      setProfile({ ...EMPTY_PROFILE, ...savedProfile });
      setIsEditingProfile(false);
      setProfileStatus("complete");
      setNotice("Your learner profile is saved. You can review or edit it any time.");
    } catch (error) {
      if (error.status === 401) {
        clearAuthStorage();
        setProfileStatus("signed-out");
      } else {
        setProfileError("We couldn’t save your learner profile. Please check your answers and try again.");
      }
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <>
      <Header activeItem="ORVEXA" />
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

          <div className={styles.robotFrame} data-speaking={isSpeaking} aria-hidden={stage !== "intro"}>
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
              <video ref={helloVideoRef} className={styles.robotVideoSource} controlsList="nodownload noremoteplayback" disablePictureInPicture muted playsInline preload="auto" onLoadedData={() => {
                if (stageRef.current === "chat" && !stuntPlayingRef.current) startRobotIdle();
              }} aria-hidden="true"><source src="/orvexa/robot-hello.mp4" type="video/mp4" /></video>
              {stuntEnabled && <video key="robot-gymnastics-wide" ref={stuntVideoRef} className={styles.robotVideoSource} controlsList="nodownload noremoteplayback" disablePictureInPicture muted playsInline preload="auto" onLoadedData={() => {
                if (openingStuntPendingRef.current) playRobotStunt();
                else if (!stuntPlayingRef.current) startRobotIdle();
              }} onTimeUpdate={() => {
                const video = stuntVideoRef.current;
                if (stuntPlayingRef.current && video && video.currentTime >= 5.6) startRobotIdle();
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
            <section className={styles.chatPanel} role="dialog" aria-labelledby="chat-title"
              onKeyDown={(event) => {
                if (event.key === "Escape") { event.stopPropagation(); closeAssistant(); }
              }}>
              <header className={styles.chatHeader}>
                <div className={styles.assistantMark} data-orvexa-art="true"><OrbitMark className={styles.headerOrbit} /></div>
                <div><h2 id="chat-title">ORVEXA</h2><p>Learning & career companion · Preview</p></div>
                {stuntEnabled && <button type="button" className={styles.motionToggle} aria-label="Play robot move" onClick={playRobotStunt} title="Play robot gymnastics"><Play size={14} /><span>Robot move</span></button>}
                <button ref={closeRef} type="button" className={styles.iconButton} aria-label="Close ORVEXA" onClick={closeAssistant}><X size={21} /></button>
              </header>
              <div className={`${styles.conversation} ${(["incomplete", "complete", "signed-out", "error"].includes(profileStatus) && !skipProfileSetup) ? styles.conversationForm : ""}`}>
                {profileStatus === "loading" && (
                  <div className={styles.profileMessage} role="status">Loading your learner profile…</div>
                )}

                {profileStatus === "signed-out" && !skipProfileSetup && (
                  <div className={styles.profileMessage}>
                    <p className={styles.eyebrow}>PERSONAL GUIDANCE STARTS WITH YOU</p>
                    <h3>Sign in to start<br /><span>your ORVEXA journey.</span></h3>
                    <p className={styles.welcomeCopy}>ORVEXA uses your learner profile to make guidance relevant to your skills, projects, and goals. Sign in or create an account to continue.</p>
                    <div className={styles.suggestions}>
                      <Link href={`/auth/student/login?next=${encodeURIComponent(ORVEXA_RETURN_PATH)}`}>Sign in <ArrowUpRight size={16} /></Link>
                      <Link href={`/auth/student/signup?next=${encodeURIComponent(ORVEXA_RETURN_PATH)}`}>Create account <ArrowUpRight size={16} /></Link>
                    </div>
                  </div>
                )}

                {profileStatus === "error" && !skipProfileSetup && (
                  <div className={styles.profileMessage}>
                    <p className={styles.eyebrow}>LEARNER PROFILE</p>
                    <h3>We couldn’t load<br /><span>your saved profile.</span></h3>
                    <p className={styles.welcomeCopy}>{profileError}</p>
                    <div className={styles.suggestions}>
                      <button type="button" onClick={() => {
                        setStage("ready");
                        window.requestAnimationFrame(() => setStage("chat"));
                      }}>Try again <ArrowUpRight size={16} /></button>
                      <Link href={`/auth/student/login?next=${encodeURIComponent(ORVEXA_RETURN_PATH)}`}>Sign in again <ArrowUpRight size={16} /></Link>
                    </div>
                  </div>
                )}

                {(profileStatus === "incomplete" || isEditingProfile) && !skipProfileSetup && (
                  <section className={styles.onboarding} aria-labelledby="onboarding-title">
                    <p className={styles.eyebrow}>YOUR AMBITION. OUR STARTING POINT.</p>
                    <h3 id="onboarding-title">{profileStep < 4 ? "Let’s get to know you." : "Review your answers."}</h3>
                    {profileStep < 4 ? (
                      <>
                        <p className={styles.onboardingProgress}>A few optional details · Step {profileStep + 1} of 4</p>
                        {profileStep === 0 && (
                          <div className={styles.onboardingFields}>
                            <label>
                              <span>Which best describes you?</span>
                              <select value={profileDraft.current_status} onChange={(event) => setProfileDraft((previous) => ({ ...previous, current_status: event.target.value }))}>
                                <option value="">Choose one</option>
                                <option value="student">Student</option>
                                <option value="graduate">Graduate</option>
                                <option value="working_professional">Working professional</option>
                              </select>
                            </label>
                            <label>
                              <span>What is your education level? <small>Optional</small></span>
                              <input value={profileDraft.education_level} onChange={(event) => setProfileDraft((previous) => ({ ...previous, education_level: event.target.value }))} maxLength={120} placeholder="For example, studying for a bachelor's degree" />
                            </label>
                          </div>
                        )}
                        {profileStep === 1 && (
                          <div className={styles.onboardingFields}>
                            <label>
                              <span>What skills do you already know?</span>
                              <textarea value={profileDraft.skills} onChange={(event) => setProfileDraft((previous) => ({ ...previous, skills: event.target.value }))} maxLength={3000} rows={5} placeholder={"JavaScript\nCommunication\nData analysis"} />
                              <small>List skills you have used or practiced. Enter one per line.</small>
                            </label>
                            <label>
                              <span>What skills would you like to learn?</span>
                              <textarea value={profileDraft.learning_skills} onChange={(event) => setProfileDraft((previous) => ({ ...previous, learning_skills: event.target.value }))} maxLength={3000} rows={4} placeholder={"Machine learning\nCloud computing"} />
                              <small>List skills you want to develop. Enter one per line.</small>
                            </label>
                          </div>
                        )}
                        {profileStep === 2 && (
                          <div className={styles.onboardingFields}>
                            <label>
                              <span>What projects have you worked on? <small>Optional</small></span>
                              <textarea value={profileDraft.projects} onChange={(event) => setProfileDraft((previous) => ({ ...previous, projects: event.target.value }))} maxLength={12000} rows={4} placeholder={"Personal website | Built a portfolio | React, CSS"} />
                              <small>One project per line: title | description | technologies.</small>
                            </label>
                            <label>
                              <span>Any work, internship, or volunteer experience? <small>Optional</small></span>
                              <textarea value={profileDraft.experience} onChange={(event) => setProfileDraft((previous) => ({ ...previous, experience: event.target.value }))} maxLength={12000} rows={3} placeholder={"Intern | Example company | Helped build a reporting tool"} />
                              <small>One experience per line: role | organization | description | start date | end date.</small>
                            </label>
                          </div>
                        )}
                        {profileStep === 3 && (
                          <div className={styles.onboardingFields}>
                            <label>
                              <span>What topics interest you? <small>Optional</small></span>
                              <textarea value={profileDraft.interests} onChange={(event) => setProfileDraft((previous) => ({ ...previous, interests: event.target.value }))} maxLength={3000} rows={3} placeholder={"AI\nWeb development"} />
                            </label>
                            <label>
                              <span>What would you like to achieve? <small>Optional</small></span>
                              <textarea value={profileDraft.goals} onChange={(event) => setProfileDraft((previous) => ({ ...previous, goals: event.target.value }))} maxLength={3000} rows={3} placeholder={"Build my first app\nPrepare for a new role"} />
                            </label>
                            <label className={styles.consentField}>
                              <input type="checkbox" checked={profileDraft.ai_personalization_consent} onChange={(event) => setProfileDraft((previous) => ({ ...previous, ai_personalization_consent: event.target.checked }))} />
                              <span>I agree to save this profile so ORVEXA can personalize learning and career guidance. I can edit my answers or withdraw consent later.</span>
                            </label>
                          </div>
                        )}
                        {profileError && <p className={styles.profileError} role="alert">{profileError}</p>}
                        <div className={styles.onboardingActions}>
                          {profileStep > 0 && <button type="button" onClick={() => { setProfileError(""); setProfileStep((step) => step - 1); }}>Back</button>}
                          <button type="button" onClick={() => {
                            setProfileError("");
                            if (profileStep === 0 && !profileDraft.current_status) {
                              setProfileError("Choose whether you are a student, graduate, or working professional.");
                              return;
                            }
                            setProfileStep((step) => step + 1);
                          }}>{profileStep === 3 ? "Review answers" : "Next question"} <ArrowUpRight size={15} /></button>
                        </div>
                      </>
                    ) : (
                      <div className={styles.profileReview}>
                        {[
                          ["About you", `Step 1 · ${profileDraft.current_status.replaceAll("_", " ")}${profileDraft.education_level ? ` · ${profileDraft.education_level}` : ""}`, 0],
                          ["Skills I know", profileDraft.skills || "Not added", 1],
                          ["Skills I want to learn", profileDraft.learning_skills || "Not added", 1],
                          ["Projects & experience", [profileDraft.projects, profileDraft.experience].filter(Boolean).join("\n") || "Not added", 2],
                          ["Interests & goals", [profileDraft.interests, profileDraft.goals].filter(Boolean).join("\n") || "Not added", 3],
                        ].map(([label, value, step]) => (
                          <div key={label}>
                            <p><strong>{label}</strong><button type="button" onClick={() => { setProfileError(""); setProfileStep(step); }}>Edit</button></p>
                            <span>{value}</span>
                          </div>
                        ))}
                        {!profileDraft.ai_personalization_consent && <p className={styles.profileError} role="alert">Consent is needed to save this profile for personalized guidance.</p>}
                        {profileError && <p className={styles.profileError} role="alert">{profileError}</p>}
                        <div className={styles.onboardingActions}>
                          <button type="button" onClick={() => { setProfileError(""); setProfileStep(3); }}>Back</button>
                          <button type="button" onClick={saveLearnerProfile} disabled={isSavingProfile || !profileDraft.ai_personalization_consent}>
                            {isSavingProfile ? "Saving…" : "Save profile"}
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {profileStatus === "complete" && !isEditingProfile && !skipProfileSetup && (
                  <section className={styles.onboarding} aria-labelledby="saved-profile-title">
                    <span className={styles.welcomeIcon} data-orvexa-art="true"><span className={styles.orbitMotion}><OrbitMark className={styles.welcomeOrbit} /></span></span>
                    <p className={styles.eyebrow}>YOUR AMBITION. OUR STARTING POINT.</p>
                    <h3 id="saved-profile-title">Your profile,<br /><span>your next big step.</span></h3>
                    <div className={styles.profileReview}>
                      <div><p><strong>About you</strong><button type="button" onClick={() => editSavedProfileStep(0)}>Edit</button></p><span>{profile.current_status?.replaceAll("_", " ") || "Not added"}{profile.education_level ? ` · ${profile.education_level}` : ""}</span></div>
                      <div><p><strong>Skills I know</strong><button type="button" onClick={() => editSavedProfileStep(1)}>Edit</button></p><span>{profile.skills.join(", ") || "Not added"}</span></div>
                      <div><p><strong>Skills I want to learn</strong><button type="button" onClick={() => editSavedProfileStep(1)}>Edit</button></p><span>{profile.learning_skills.join(", ") || "Not added"}</span></div>
                      <div><p><strong>Projects</strong><button type="button" onClick={() => editSavedProfileStep(2)}>Edit</button></p><span>{profile.projects.map((project) => project.title).join(", ") || "Not added"}</span></div>
                      <div><p><strong>Experience</strong><button type="button" onClick={() => editSavedProfileStep(2)}>Edit</button></p><span>{profile.experience.map((item) => item.role).join(", ") || "Not added"}</span></div>
                      <div><p><strong>Interests & goals</strong><button type="button" onClick={() => editSavedProfileStep(3)}>Edit</button></p><span>{[...profile.interests, ...profile.goals].join(", ") || "Not added"}</span></div>
                    </div>
                    <div className={styles.onboardingActions}>
                      <button type="button" onClick={() => setSkipProfileSetup(true)}>Continue to chat <ArrowUpRight size={15} /></button>
                    </div>
                  </section>
                )}

                {skipProfileSetup && (
                  <div className={styles.profileMessage}>
                    <span className={styles.welcomeIcon} data-orvexa-art="true"><span className={styles.orbitMotion}><OrbitMark className={styles.welcomeOrbit} /></span></span>
                    <p className={styles.eyebrow}>YOUR AMBITION. OUR STARTING POINT.</p>
                    <h3>What’s your<br /><span>next big step?</span></h3>
                    <p className={styles.welcomeCopy}>A new skill, a career move, or a stronger resume.<br />Start with what’s on your mind.</p>
                    {profileStatus === "complete" && <button className={styles.profileEditLink} type="button" onClick={() => setSkipProfileSetup(false)}>Review your saved profile</button>}
                    {profileStatus === "incomplete" && <button className={styles.profileEditLink} type="button" onClick={() => { setSkipProfileSetup(false); setProfileStep(0); }}>Set up your learner profile</button>}
                    <div className={styles.suggestions}>
                      {["Find my learning path", "Explore my career options", "Improve my resume"].map((text) => <button type="button" key={text} onClick={() => { setDraft(text); inputRef.current?.focus(); }}>{text}<ArrowUpRight size={16} /></button>)}
                    </div>
                  </div>
                )}
              </div>
              {profileStatus === "complete" && skipProfileSetup && (
                <div className={styles.composerArea}>
                  <p className={styles.notice} role="status">{notice || "Preview only — messages and microphone audio are not sent or recorded."}</p>
                  <form className={styles.composer} onSubmit={submitMessage}>
                    <textarea ref={inputRef} aria-label="Message ORVEXA" placeholder="What would you like to explore?" rows={1} maxLength={4000} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitMessage(event); } }} />
                    <button type="button" className={styles.micButton} aria-label="Voice preview information" onClick={() => setNotice("Voice conversations are not connected yet. Your microphone has not been activated.")}><Mic size={19} /></button>
                    <button type="submit" className={styles.sendButton} aria-label="Try sending a preview message" disabled={!draft.trim()}><ArrowUp size={21} /></button>
                  </form>
                  <p className={styles.composerFootnote}>Built for your possibilities. Designed around you.</p>
                </div>
              )}
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
