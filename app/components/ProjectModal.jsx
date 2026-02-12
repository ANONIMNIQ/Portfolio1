"use client";

import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import Magnet from "./Magnet";

export default function ProjectModal({ isOpen, isClosing, isExpanded, activeProject, text, lang, theme, onClose, onScroll, onWheel }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [activeProject?.id]);

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

          <div className="modal-body" onScroll={onScroll} onWheel={onWheel}>
            <div className="modal-content-wrap">
              <div className={`modal-media-wrap ${isImageLoaded ? "is-loaded" : ""}`}>
                <div className="modal-media-skeleton" aria-hidden="true" />
                <img
                  src={activeProject.image}
                  alt={activeProject[lang].title}
                  className={`modal-media-img ${isImageLoaded ? "is-loaded" : ""}`}
                  onLoad={() => setIsImageLoaded(true)}
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="modal-text">
                <h2 className="modal-title">{activeProject[lang].title}</h2>
                <div className="modal-tags">{activeProject.tags.join(" • ")}</div>
                <p className="modal-desc">{activeProject[lang].description}</p>
                <p className="modal-paragraph">{text.modalStory}</p>
                <p className="modal-paragraph">{text.modalTech}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
