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
  const [primaryRevealProgress, setPrimaryRevealProgress] = useState(0);
  const [secondaryRevealProgress, setSecondaryRevealProgress] = useState(0);
  const [primaryNoteGateProgress, setPrimaryNoteGateProgress] = useState(0);
  const [secondaryNoteGateProgress, setSecondaryNoteGateProgress] = useState(0);
  const [primaryAutoZoomProgress, setPrimaryAutoZoomProgress] = useState(0);
  const [secondaryAutoZoomProgress, setSecondaryAutoZoomProgress] = useState(0);
  const primarySceneRef = useRef(null);
  const secondarySceneRef = useRef(null);
  const bodyRef = useRef(null);
  const descriptionRef = useRef(null);
  const followupRef = useRef(null);
  const primaryMediaRef = useRef(null);
  const secondaryMediaRef = useRef(null);
  const animationFrameRef = useRef(null);
  const primaryAutoRafRef = useRef(null);
  const secondaryAutoRafRef = useRef(null);
  const primaryProgressRef = useRef(0);
  const secondaryProgressRef = useRef(0);
  const primaryTargetProgressRef = useRef(0);
  const secondaryTargetProgressRef = useRef(0);
  const primaryAutoTriggeredRef = useRef(false);
  const secondaryAutoTriggeredRef = useRef(false);

  const primaryPhases = useMemo(() => {
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const zoom = clamp((primarySceneProgress - 0.14) / 0.28);
    const note = clamp((primarySceneProgress - 0.28) / 0.34);
    const follow = clamp((primarySceneProgress - 0.72) / 0.16);
    return { zoom, note, follow };
  }, [primarySceneProgress]);

  const secondaryPhases = useMemo(() => {
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const zoom = clamp((secondarySceneProgress - 0.16) / 0.28);
    const note = clamp((secondarySceneProgress - 0.3) / 0.34);
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
    const endOffset = isPrimaryScene ? 0.34 : 0.32;
    const start = sceneTop - viewportHeight * startOffset;
    const end = sceneTop + sceneHeight - viewportHeight * endOffset;
    const range = Math.max(end - start, 1);
    const value = (scroller.scrollTop - start) / range;
    return Math.min(1, Math.max(0, value));
  };

  const getRevealProgress = (scene, scroller) => {
    if (!scene || !scroller) return 0;
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const sceneTopInViewport = scene.offsetTop - scroller.scrollTop;
    const viewportHeight = scroller.clientHeight;
    const start = viewportHeight * 0.98;
    const end = viewportHeight * 0.62;
    return clamp((start - sceneTopInViewport) / Math.max(start - end, 1));
  };

  const getParagraphExitProgress = (paragraph, scroller) => {
    if (!paragraph || !scroller) return 0;
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const paragraphRect = paragraph.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const start = scrollerRect.top + 28;
    const end = scrollerRect.top - 18;
    return clamp((start - paragraphRect.bottom) / Math.max(start - end, 1));
  };

  const isFullyVisibleInScroller = (element, scroller, threshold = 6) => {
    if (!element || !scroller) return false;
    const elementRect = element.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    return (
      elementRect.top >= scrollerRect.top + threshold &&
      elementRect.bottom <= scrollerRect.bottom - threshold
    );
  };

  const triggerAutoZoom = (scene) => {
    const duration = 620;
    const easeOut = (t) => 1 - (1 - t) * (1 - t) * (1 - t);

    if (scene === "primary") {
      if (primaryAutoTriggeredRef.current) return;
      primaryAutoTriggeredRef.current = true;
      if (primaryAutoRafRef.current) cancelAnimationFrame(primaryAutoRafRef.current);
      const startTs = performance.now();
      const step = (ts) => {
        const elapsed = ts - startTs;
        const t = Math.min(1, elapsed / duration);
        setPrimaryAutoZoomProgress(easeOut(t));
        if (t < 1) {
          primaryAutoRafRef.current = requestAnimationFrame(step);
        } else {
          primaryAutoRafRef.current = null;
        }
      };
      primaryAutoRafRef.current = requestAnimationFrame(step);
      return;
    }

    if (secondaryAutoTriggeredRef.current) return;
    secondaryAutoTriggeredRef.current = true;
    if (secondaryAutoRafRef.current) cancelAnimationFrame(secondaryAutoRafRef.current);
    const startTs = performance.now();
    const step = (ts) => {
      const elapsed = ts - startTs;
      const t = Math.min(1, elapsed / duration);
      setSecondaryAutoZoomProgress(easeOut(t));
      if (t < 1) {
        secondaryAutoRafRef.current = requestAnimationFrame(step);
      } else {
        secondaryAutoRafRef.current = null;
      }
    };
    secondaryAutoRafRef.current = requestAnimationFrame(step);
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
    const nextPrimaryReveal = getRevealProgress(primarySceneRef.current, scroller);
    const nextSecondaryReveal = getRevealProgress(secondarySceneRef.current, scroller);
    const nextPrimaryGate = getParagraphExitProgress(descriptionRef.current, scroller);
    const nextSecondaryGate = getParagraphExitProgress(followupRef.current, scroller);

    primaryTargetProgressRef.current = nextPrimary;
    secondaryTargetProgressRef.current = nextSecondary;

    if (immediate) {
      primaryProgressRef.current = nextPrimary;
      secondaryProgressRef.current = nextSecondary;
      setPrimarySceneProgress(nextPrimary);
      setSecondarySceneProgress(nextSecondary);
      setPrimaryRevealProgress(nextPrimaryReveal);
      setSecondaryRevealProgress(nextSecondaryReveal);
      setPrimaryNoteGateProgress(nextPrimaryGate);
      setSecondaryNoteGateProgress(nextSecondaryGate);
      return;
    }

    setPrimaryRevealProgress(nextPrimaryReveal);
    setSecondaryRevealProgress(nextSecondaryReveal);
    setPrimaryNoteGateProgress(nextPrimaryGate);
    setSecondaryNoteGateProgress(nextSecondaryGate);

    if (!primaryAutoTriggeredRef.current && isFullyVisibleInScroller(primaryMediaRef.current, scroller, 6)) {
      triggerAutoZoom("primary");
    }
    if (!secondaryAutoTriggeredRef.current && isFullyVisibleInScroller(secondaryMediaRef.current, scroller, 6)) {
      triggerAutoZoom("secondary");
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
    setPrimaryRevealProgress(0);
    setSecondaryRevealProgress(0);
    setPrimaryNoteGateProgress(0);
    setSecondaryNoteGateProgress(0);
    setPrimaryAutoZoomProgress(0);
    setSecondaryAutoZoomProgress(0);
    primaryProgressRef.current = 0;
    secondaryProgressRef.current = 0;
    primaryTargetProgressRef.current = 0;
    secondaryTargetProgressRef.current = 0;
    primaryAutoTriggeredRef.current = false;
    secondaryAutoTriggeredRef.current = false;
    if (primaryAutoRafRef.current) {
      cancelAnimationFrame(primaryAutoRafRef.current);
      primaryAutoRafRef.current = null;
    }
    if (secondaryAutoRafRef.current) {
      cancelAnimationFrame(secondaryAutoRafRef.current);
      secondaryAutoRafRef.current = null;
    }
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
      if (primaryAutoRafRef.current) {
        cancelAnimationFrame(primaryAutoRafRef.current);
        primaryAutoRafRef.current = null;
      }
      if (secondaryAutoRafRef.current) {
        cancelAnimationFrame(secondaryAutoRafRef.current);
        secondaryAutoRafRef.current = null;
      }
    };
  }, []);

  const effectivePrimaryZoom = Math.max(primaryPhases.zoom, primaryAutoZoomProgress);
  const effectiveSecondaryZoom = Math.max(secondaryPhases.zoom, secondaryAutoZoomProgress);
  const primaryNoteDriver = Math.max(primaryPhases.note, primaryNoteGateProgress * 0.56 + primaryRevealProgress * 0.28);
  const secondaryNoteDriver = Math.max(secondaryPhases.note, secondaryNoteGateProgress * 0.56 + secondaryRevealProgress * 0.28);
  const effectivePrimaryNote = Math.min(1, Math.max(0, primaryNoteDriver));
  const effectiveSecondaryNote = Math.min(1, Math.max(0, secondaryNoteDriver));

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
                <p
                  ref={descriptionRef}
                  className="modal-desc"
                  style={{
                    transform: `translate3d(0, -${primaryAutoZoomProgress * 26}px, 0)`,
                    opacity: 1 - primaryAutoZoomProgress * 0.14,
                  }}
                >
                  {activeProject[lang].description}
                </p>
                <section ref={primarySceneRef} className="modal-scroll-scene modal-scroll-scene-primary" aria-label="Project visual reveal">
                  <div className="modal-scroll-stage modal-scroll-stage-right">
                    <div
                      ref={primaryMediaRef}
                      className={`modal-scroll-media modal-scroll-media-primary ${isPrimarySceneImageLoaded ? "is-loaded" : ""}`}
                      style={{
                        transform: `translate3d(${(1 - effectivePrimaryZoom) * 1}%, ${(1 - effectivePrimaryZoom) * 3}px, 0) scale(${0.58 + effectivePrimaryZoom * 0.42})`,
                        opacity: primaryRevealProgress,
                        filter: `blur(${(1 - primaryRevealProgress) * 14}px)`,
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
                        const stagger = 0.1;
                        const window = 0.24;
                        const start = index * stagger;
                        const lineProgress = Math.min(1, Math.max(0, (effectivePrimaryNote - start) / window));
                        const eased = lineProgress * lineProgress * (3 - 2 * lineProgress);
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
                  ref={followupRef}
                  className="modal-paragraph modal-followup-paragraph"
                  style={{
                    opacity: primaryPhases.follow * (1 - secondaryAutoZoomProgress * 0.12),
                    transform: `translate3d(0, ${(1 - primaryPhases.follow) * 28 - secondaryAutoZoomProgress * 22}px, 0)`,
                  }}
                >
                  {text.modalStory}
                </p>
                <section ref={secondarySceneRef} className="modal-scroll-scene modal-scroll-scene-secondary" aria-label="Responsive design visual reveal">
                  <div className="modal-scroll-stage modal-scroll-stage-left">
                    <div
                      ref={secondaryMediaRef}
                      className={`modal-scroll-media modal-scroll-media-secondary ${isSecondarySceneImageLoaded ? "is-loaded" : ""}`}
                      style={{
                        transform: `translate3d(${(1 - effectiveSecondaryZoom) * 1}%, ${(1 - effectiveSecondaryZoom) * 3}px, 0) scale(${0.6 + effectiveSecondaryZoom * 0.4})`,
                        opacity: secondaryRevealProgress,
                        filter: `blur(${(1 - secondaryRevealProgress) * 14}px)`,
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
                        const stagger = 0.16;
                        const window = 0.28;
                        const start = index * stagger;
                        const lineProgress = Math.min(1, Math.max(0, (effectiveSecondaryNote - start) / window));
                        const eased = lineProgress * lineProgress * (3 - 2 * lineProgress);
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
