"use client";

import { ExternalLink, X } from "lucide-react";
import Magnet from "./Magnet";

export default function ProjectModal({ isOpen, isClosing, activeProject, text, lang, onClose, onScroll, onWheel }) {
  return (
    <div className={`modal ${isOpen ? "is-open" : ""} ${isClosing ? "is-closing" : ""}`} aria-hidden={!isOpen && !isClosing}>
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
              <img src={activeProject.image} alt={activeProject[lang].title} className="modal-media-img" />
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
