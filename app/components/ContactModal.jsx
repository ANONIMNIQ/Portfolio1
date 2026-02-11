"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Magnet from "./Magnet";

export default function ContactModal({ isOpen, onClose, text }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className={`modal ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
      <div className="modal-backdrop" onClick={onClose} />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="modal-card contact-modal-card"
            role="dialog"
            aria-modal="true"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: "linear-gradient(135deg, #f8f8ff 0%, #eef0ff 100%)" }}
          >
            <div className="modal-header">
              <div className="modal-header-left">
                <span className="chip">{text.contacts}</span>
              </div>
              <div className="modal-header-right">
                <Magnet strength={0.2}>
                  <button className="icon-btn solid" onClick={onClose} aria-label="Close contact">
                    <X size={14} />
                  </button>
                </Magnet>
              </div>
            </div>

            <div className="modal-body contact-modal-body" style={{ padding: "48px 64px 64px" }}>
              <div className="modal-text" style={{ maxWidth: "600px", margin: "0 auto" }}>
                <h2 className="modal-title" style={{ textAlign: "center", marginBottom: "40px" }}>
                  {text.contactTitle}
                </h2>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "40px 0", color: "var(--ink)" }}>
                      <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>{text.contactSuccess}</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      style={{ display: "grid", gap: "32px" }}
                      onSubmit={(event) => {
                        event.preventDefault();
                        setSubmitted(true);
                        setTimeout(() => {
                          setSubmitted(false);
                          onClose();
                        }, 3000);
                      }}
                    >
                      <div>
                        <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", display: "block", marginBottom: "8px" }}>
                          {text.contactName}
                        </label>
                        <input type="text" required style={{ width: "100%", padding: "12px 0", background: "transparent", border: "none", borderBottom: "1px solid var(--line)", fontFamily: "inherit", fontSize: "18px", outline: "none" }} />
                      </div>

                      <div>
                        <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", display: "block", marginBottom: "8px" }}>
                          {text.contactEmail}
                        </label>
                        <input type="email" required style={{ width: "100%", padding: "12px 0", background: "transparent", border: "none", borderBottom: "1px solid var(--line)", fontFamily: "inherit", fontSize: "18px", outline: "none" }} />
                      </div>

                      <div>
                        <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--muted)", display: "block", marginBottom: "8px" }}>
                          {text.contactMessage}
                        </label>
                        <textarea required rows="3" style={{ width: "100%", padding: "12px 0", background: "transparent", border: "none", borderBottom: "1px solid var(--line)", fontFamily: "inherit", fontSize: "18px", outline: "none", resize: "none" }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                        <Magnet strength={0.2}>
                          <button type="submit" className="projects-trigger" style={{ width: "auto", height: "auto", padding: "16px 40px", borderRadius: "999px", fontSize: "14px", gap: "12px" }}>
                            {text.contactSend} <ArrowRight size={16} />
                          </button>
                        </Magnet>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
