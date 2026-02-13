"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import Magnet from "./Magnet";

export default function ProjectModal({ isOpen, isClosing, isExpanded, activeProject, text, lang, theme, onClose, onScroll, onWheel }) {
  const [isSceneImageLoaded, setIsSceneImageLoaded] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0);
  const sceneRef = useRef(null);
  const bodyRef = useRef(null);

  const phases = useMemo(() => {
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const image = clamp(sceneProgress / 0.55);
    const note = clamp((sceneProgress - 0.6) / 0.3);
    return { image, note };
  }, [sceneProgress]);

  const noteLines = useMemo(() => {
    return text.modalTech
      .split(/(?<=[.!?])\s+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [text.modalTech]);

  const updateSceneProgress = (scroller) => {
    if (!sceneRef.current || !scroller) return;

    const sceneTop = sceneRef.current.offsetTop;
    const sceneHeight = sceneRef.current.offsetHeight;
    const viewportHeight = scroller.clientHeight;
    const start = sceneTop - viewportHeight * 0.52;
    const end = sceneTop + sceneHeight - viewportHeight * 0.48;
    const range = Math.max(end - start, 1);
    const value = (scroller.scrollTop - start) / range;
    const clamped = Math.min(1, Math.max(0, value));

    setSceneProgress(clamped);
  };

  const handleBodyScroll = (event) => {
    onScroll?.(event);
    updateSceneProgress(event.currentTarget);
  };

  useEffect(() => {
    setIsSceneImageLoaded(false);
    setSceneProgress(0);
  }, [activeProject?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = requestAnimationFrame(() => {
      updateSceneProgress(bodyRef.current);
    });
    return () => cancelAnimationFrame(timer);
  }, [isOpen, activeProject?.id]);

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
                <p className="modal-paragraph">{text.modalStory}</p>
                <section ref={sceneRef} className="modal-scroll-scene" aria-label="Project visual reveal">
                  <div className="modal-scroll-stage">
                    <div
                      className={`modal-scroll-media ${isSceneImageLoaded ? "is-loaded" : ""}`}
                      style={{
                        transform: `translate3d(-${(1 - phases.image) * 116}%, 0, 0)`,
                        opacity: 0.2 + phases.image * 0.8,
                      }}
                    >
                      <div className={`modal-media-wrap ${isSceneImageLoaded ? "is-loaded" : ""}`}>
                        <div className="modal-media-skeleton" aria-hidden="true" />
                        <img
                          src={activeProject.image}
                          alt={activeProject[lang].title}
                          className={`modal-media-img ${isSceneImageLoaded ? "is-loaded" : ""}`}
                          onLoad={() => setIsSceneImageLoaded(true)}
                          loading="eager"
                          decoding="async"
                        />
                      </div>
                    </div>
                    <div className="modal-responsive-note" aria-label={text.modalTech}>
                      {noteLines.map((line, index) => {
                        const lineProgress = Math.min(1, Math.max(0, phases.note * noteLines.length - index));
                        return (
                          <span
                            key={`${line}-${index}`}
                            className="modal-responsive-line"
                            style={{
                              opacity: lineProgress,
                              transform: `translate3d(0, ${(1 - lineProgress) * 18}px, 0)`,
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
