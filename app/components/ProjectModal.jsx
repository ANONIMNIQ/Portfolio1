"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import Magnet from "./Magnet";

export default function ProjectModal({ isOpen, isClosing, isExpanded, activeProject, text, lang, theme, onClose, onScroll, onWheel }) {
  const [isPrimarySceneImageLoaded, setIsPrimarySceneImageLoaded] = useState(false);
  const [isSecondarySceneImageLoaded, setIsSecondarySceneImageLoaded] = useState(false);
  const [secondaryImageSrc, setSecondaryImageSrc] = useState("");
  const [primarySceneProgress, setPrimarySceneProgress] = useState(0);
  const [secondarySceneProgress, setSecondarySceneProgress] = useState(0);
  const primarySceneRef = useRef(null);
  const secondarySceneRef = useRef(null);
  const bodyRef = useRef(null);
  const animationFrameRef = useRef(null);
  const primaryProgressRef = useRef(0);
  const secondaryProgressRef = useRef(0);
  const primaryTargetProgressRef = useRef(0);
  const secondaryTargetProgressRef = useRef(0);

  const primaryPhases = useMemo(() => {
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const zoom = clamp((primarySceneProgress - 0.14) / 0.28);
    const note = clamp((primarySceneProgress - 0.42) / 0.26);
    const follow = clamp((primarySceneProgress - 0.72) / 0.16);
    return { zoom, note, follow };
  }, [primarySceneProgress]);

  const secondaryPhases = useMemo(() => {
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const zoom = clamp((secondarySceneProgress - 0.16) / 0.28);
    const note = clamp((secondarySceneProgress - 0.44) / 0.26);
    return { zoom, note };
  }, [secondarySceneProgress]);

  const noteLines = useMemo(() => {
    const maxLineLength = 30;
    const words = text.modalTech.split(/\s+/).filter(Boolean);
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const next = currentLine ? `${currentLine} ${word}` : word;
      if (next.length > maxLineLength && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = next;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }, [text.modalTech]);

  const responsiveLines = useMemo(() => {
    if (lang === "bg") {
      return ["Дизайнът е респонсив", "и оптимизиран за", "всички устройства."];
    }
    return ["The design is responsive", "and optimized for", "all devices."];
  }, [lang]);

  const getSceneProgress = (scene, scroller) => {
    if (!scene || !scroller) return 0;
    const isPrimaryScene = scene.classList.contains("modal-scroll-scene-primary");
    const sceneTop = scene.offsetTop;
    const sceneHeight = scene.offsetHeight;
    const viewportHeight = scroller.clientHeight;
    const startOffset = isPrimaryScene ? 0.22 : 0.24;
    const endOffset = isPrimaryScene ? 0.2 : 0.18;
    const start = sceneTop - viewportHeight * startOffset;
    const end = sceneTop + sceneHeight - viewportHeight * endOffset;
    const range = Math.max(end - start, 1);
    const value = (scroller.scrollTop - start) / range;
    return Math.min(1, Math.max(0, value));
  };

  const scheduleProgressAnimation = () => {
    if (animationFrameRef.current) return;
    const animate = () => {
      const smoothing = 0.2;
      const snap = 0.0015;

      const nextPrimary =
        primaryProgressRef.current + (primaryTargetProgressRef.current - primaryProgressRef.current) * smoothing;
      const nextSecondary =
        secondaryProgressRef.current +
        (secondaryTargetProgressRef.current - secondaryProgressRef.current) * smoothing;

      const primaryDistance = Math.abs(primaryTargetProgressRef.current - nextPrimary);
      const secondaryDistance = Math.abs(secondaryTargetProgressRef.current - nextSecondary);

      primaryProgressRef.current = primaryDistance < snap ? primaryTargetProgressRef.current : nextPrimary;
      secondaryProgressRef.current = secondaryDistance < snap ? secondaryTargetProgressRef.current : nextSecondary;

      setPrimarySceneProgress(primaryProgressRef.current);
      setSecondarySceneProgress(secondaryProgressRef.current);

      if (primaryDistance < snap && secondaryDistance < snap) {
        animationFrameRef.current = null;
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const updateSceneProgresses = (scroller, immediate = false) => {
    if (!scroller) return;
    const nextPrimary = getSceneProgress(primarySceneRef.current, scroller);
    const nextSecondary = getSceneProgress(secondarySceneRef.current, scroller);

    primaryTargetProgressRef.current = nextPrimary;
    secondaryTargetProgressRef.current = nextSecondary;

    if (immediate) {
      primaryProgressRef.current = nextPrimary;
      secondaryProgressRef.current = nextSecondary;
      setPrimarySceneProgress(nextPrimary);
      setSecondarySceneProgress(nextSecondary);
      return;
    }

    scheduleProgressAnimation();
  };

  const handleBodyScroll = (event) => {
    onScroll?.(event);
    updateSceneProgresses(event.currentTarget);
  };

  useEffect(() => {
    setIsPrimarySceneImageLoaded(false);
    setIsSecondarySceneImageLoaded(false);
    setPrimarySceneProgress(0);
    setSecondarySceneProgress(0);
    primaryProgressRef.current = 0;
    secondaryProgressRef.current = 0;
    primaryTargetProgressRef.current = 0;
    secondaryTargetProgressRef.current = 0;
    setSecondaryImageSrc(activeProject?.modalImage || activeProject?.image || "");
  }, [activeProject?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = requestAnimationFrame(() => {
      updateSceneProgresses(bodyRef.current, true);
    });
    return () => cancelAnimationFrame(timer);
  }, [isOpen, activeProject?.id]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`modal project-modal ${isOpen ? "is-open" : ""} ${isClosing ? "is-closing" : ""} ${isExpanded ? "is-expanded" : ""}`} aria-hidden={!isOpen && !isClosing} data-theme={theme}>
      <div className="modal-backdrop" onClick={onClose} />
      {activeProject && (
        <div className="modal-card" role="dialog" aria-modal="true">
          <div className="modal-header">
            <div className="modal-header-left">
              <Magnet strength={0.1}>
                <button className="chip" style={{ border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  {text.liveSite} <ExternalLink size={10} />
                </button>
              </Magnet>
            </div>
            <div className="modal-header-right">
              <Magnet strength={0.2}>
                <button className="icon-btn solid" type="button" aria-label="Close project" onClick={onClose}>
                  <X size={14} />
                </button>
              </Magnet>
            </div>
          </div>

          <div ref={bodyRef} className="modal-body" onScroll={handleBodyScroll} onWheel={onWheel}>
            <div className="modal-content-wrap">
              <div className="modal-text">
                <h2 className="modal-title">{activeProject[lang].title}</h2>
                <div className="modal-tags">{activeProject.tags.join(" • ")}</div>
                <p className="modal-desc">{activeProject[lang].description}</p>
                <section ref={primarySceneRef} className="modal-scroll-scene modal-scroll-scene-primary" aria-label="Project visual reveal">
                  <div className="modal-scroll-stage modal-scroll-stage-right">
                    <div
                      className={`modal-scroll-media modal-scroll-media-primary ${isPrimarySceneImageLoaded ? "is-loaded" : ""}`}
                      style={{
                        transform: `translate3d(${(1 - primaryPhases.zoom) * 1}%, ${(1 - primaryPhases.zoom) * 3}px, 0) scale(${0.58 + primaryPhases.zoom * 0.42})`,
                        opacity: 1,
                      }}
                    >
                      <div className={`modal-media-wrap modal-media-wrap-primary ${isPrimarySceneImageLoaded ? "is-loaded" : ""}`}>
                        <div className="modal-media-skeleton" aria-hidden="true" />
                        <img
                          src={activeProject.image}
                          alt={activeProject[lang].title}
                          className={`modal-media-img ${isPrimarySceneImageLoaded ? "is-loaded" : ""}`}
                          onLoad={() => setIsPrimarySceneImageLoaded(true)}
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div className="modal-responsive-note modal-responsive-note-primary" aria-label={text.modalTech}>
                      {noteLines.map((line, index) => {
                        const lineProgress = Math.min(1, Math.max(0, primaryPhases.note * (noteLines.length + 0.75) - index));
                        const eased = Math.min(1, Math.max(0, lineProgress));
                        return (
                          <span
                            key={`${line}-${index}`}
                            className="modal-responsive-line"
                            style={{
                              opacity: eased,
                              transform: `translate3d(0, ${(1 - eased) * 14}px, 0)`,
                            }}
                          >
                            {line}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </section>
                <p
                  className="modal-paragraph modal-followup-paragraph"
                  style={{
                    opacity: primaryPhases.follow,
                    transform: `translate3d(0, ${(1 - primaryPhases.follow) * 28}px, 0)`,
                  }}
                >
                  {text.modalStory}
                </p>
                <section ref={secondarySceneRef} className="modal-scroll-scene modal-scroll-scene-secondary" aria-label="Responsive design visual reveal">
                  <div className="modal-scroll-stage modal-scroll-stage-left">
                    <div
                      className={`modal-scroll-media modal-scroll-media-secondary ${isSecondarySceneImageLoaded ? "is-loaded" : ""}`}
                      style={{
                        transform: `translate3d(${(1 - secondaryPhases.zoom) * 1}%, ${(1 - secondaryPhases.zoom) * 3}px, 0) scale(${0.6 + secondaryPhases.zoom * 0.4})`,
                        opacity: 1,
                      }}
                    >
                      <div className={`modal-media-wrap modal-media-wrap-secondary ${isSecondarySceneImageLoaded ? "is-loaded" : ""}`}>
                        <div className="modal-media-skeleton" aria-hidden="true" />
                        <img
                          src={secondaryImageSrc}
                          alt={activeProject[lang].title}
                          className={`modal-media-img ${isSecondarySceneImageLoaded ? "is-loaded" : ""}`}
                          onLoad={() => setIsSecondarySceneImageLoaded(true)}
                          onError={() => {
                            if (secondaryImageSrc !== activeProject.image) {
                              setSecondaryImageSrc(activeProject.image);
                              return;
                            }
                            setIsSecondarySceneImageLoaded(true);
                          }}
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div className="modal-responsive-note modal-responsive-note-secondary" aria-label={text.modalResponsive}>
                      {responsiveLines.map((line, index) => {
                        const lineProgress = Math.min(1, Math.max(0, secondaryPhases.note * (responsiveLines.length + 0.75) - index));
                        const eased = Math.min(1, Math.max(0, lineProgress));
                        return (
                          <span
                            key={`${line}-${index}`}
                            className="modal-responsive-line"
                            style={{
                              opacity: eased,
                              transform: `translate3d(0, ${(1 - eased) * 14}px, 0)`,
                            }}
                          >
                            {line}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
