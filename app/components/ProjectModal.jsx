"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Magnet from "./Magnet";

gsap.registerPlugin(ScrollTrigger, Observer, ScrollSmoother);

export default function ProjectModal({ isOpen, isClosing, isExpanded, activeProject, text, lang, theme, onClose, onScroll, onWheel }) {
  const [isPrimarySceneImageLoaded, setIsPrimarySceneImageLoaded] = useState(false);
  const [isSecondarySceneImageLoaded, setIsSecondarySceneImageLoaded] = useState(false);
  const [secondaryImageSrc, setSecondaryImageSrc] = useState("");

  const bodyRef = useRef(null);
  const contentWrapRef = useRef(null);
  const primarySceneRef = useRef(null);
  const secondarySceneRef = useRef(null);
  const primaryMediaRef = useRef(null);
  const secondaryMediaRef = useRef(null);
  const primaryNoteRef = useRef(null);
  const secondaryNoteRef = useRef(null);
  const descriptionRef = useRef(null);
  const followupRef = useRef(null);
  const primaryLineRefs = useRef([]);
  const secondaryLineRefs = useRef([]);

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

  useEffect(() => {
    setIsPrimarySceneImageLoaded(false);
    setIsSecondarySceneImageLoaded(false);
    setSecondaryImageSrc(activeProject?.modalImage || activeProject?.image || "");
  }, [activeProject?.id]);

  useLayoutEffect(() => {
    if (!isOpen || !activeProject || !bodyRef.current || !contentWrapRef.current) return;

    const scroller = bodyRef.current;
    let observer;
    let smoother;

    const ctx = gsap.context(() => {
      const existingSmoother = ScrollSmoother.get();
      if (existingSmoother) existingSmoother.kill();

      smoother = ScrollSmoother.create({
        wrapper: scroller,
        content: contentWrapRef.current,
        smooth: 0.9,
        smoothTouch: 0.12,
        normalizeScroll: true,
        effects: false,
        ignoreMobileResize: true,
      });

      const primaryLines = primaryLineRefs.current.filter(Boolean);
      const secondaryLines = secondaryLineRefs.current.filter(Boolean);

      gsap.set(primaryMediaRef.current, {
        autoAlpha: 0,
        filter: "blur(14px)",
        scale: 0.58,
        xPercent: 1,
        y: 3,
        transformOrigin: "center top",
      });

      gsap.set(secondaryMediaRef.current, {
        autoAlpha: 0,
        filter: "blur(14px)",
        scale: 0.6,
        xPercent: 1,
        y: 3,
        transformOrigin: "center top",
      });

      gsap.set(primaryNoteRef.current, { autoAlpha: 0 });
      gsap.set(secondaryNoteRef.current, { autoAlpha: 0 });
      gsap.set(primaryLines, { autoAlpha: 0, y: 14 });
      gsap.set(secondaryLines, { autoAlpha: 0, y: 14 });
      gsap.set(descriptionRef.current, { y: 0, autoAlpha: 1 });
      gsap.set(followupRef.current, { y: 0, autoAlpha: 1 });

      gsap.timeline({
        scrollTrigger: {
          trigger: primarySceneRef.current,
          scroller,
          start: "top 84%",
          end: "bottom 44%",
          scrub: 0.55,
          invalidateOnRefresh: true,
        },
      })
        .to(
          primaryMediaRef.current,
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            scale: 1,
            xPercent: 0,
            y: 0,
            duration: 0.44,
            ease: "none",
          },
          0
        )
        .to(
          descriptionRef.current,
          {
            y: -24,
            autoAlpha: 0.88,
            duration: 0.32,
            ease: "none",
          },
          0.08
        )
        .to(
          primaryNoteRef.current,
          {
            autoAlpha: 1,
            duration: 0.08,
            ease: "none",
          },
          0.34
        )
        .to(
          primaryLines,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.2,
            stagger: 0.1,
            ease: "none",
          },
          0.36
        );

      gsap.timeline({
        scrollTrigger: {
          trigger: secondarySceneRef.current,
          scroller,
          start: "top 84%",
          end: "bottom 44%",
          scrub: 0.55,
          invalidateOnRefresh: true,
        },
      })
        .to(
          secondaryMediaRef.current,
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            scale: 1,
            xPercent: 0,
            y: 0,
            duration: 0.44,
            ease: "none",
          },
          0
        )
        .to(
          followupRef.current,
          {
            y: -22,
            autoAlpha: 0.9,
            duration: 0.3,
            ease: "none",
          },
          0.08
        )
        .to(
          secondaryNoteRef.current,
          {
            autoAlpha: 1,
            duration: 0.08,
            ease: "none",
          },
          0.34
        )
        .to(
          secondaryLines,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.22,
            stagger: 0.14,
            ease: "none",
          },
          0.36
        );

      observer = Observer.create({
        target: scroller,
        type: "wheel,touch",
        tolerance: 2,
        preventDefault: false,
        onChangeY: () => ScrollTrigger.update(),
      });

      ScrollTrigger.refresh();
    }, bodyRef);

    return () => {
      if (observer) observer.kill();
      if (smoother) smoother.kill();
      ctx.revert();
    };
  }, [isOpen, activeProject?.id, noteLines, responsiveLines]);

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

          <div ref={bodyRef} className="modal-body" onScroll={onScroll} onWheel={onWheel}>
            <div ref={contentWrapRef} className="modal-content-wrap">
              <div className="modal-text">
                <h2 className="modal-title">{activeProject[lang].title}</h2>
                <div className="modal-tags">{activeProject.tags.join(" • ")}</div>
                <p ref={descriptionRef} className="modal-desc">
                  {activeProject[lang].description}
                </p>

                <section ref={primarySceneRef} className="modal-scroll-scene modal-scroll-scene-primary" aria-label="Project visual reveal">
                  <div className="modal-scroll-stage modal-scroll-stage-right">
                    <div ref={primaryMediaRef} className={`modal-scroll-media modal-scroll-media-primary ${isPrimarySceneImageLoaded ? "is-loaded" : ""}`}>
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

                    <div ref={primaryNoteRef} className="modal-responsive-note modal-responsive-note-primary" aria-label={text.modalTech}>
                      {noteLines.map((line, index) => (
                        <span
                          key={`${line}-${index}`}
                          ref={(node) => {
                            primaryLineRefs.current[index] = node;
                          }}
                          className="modal-responsive-line"
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                <p ref={followupRef} className="modal-paragraph modal-followup-paragraph">
                  {text.modalStory}
                </p>

                <section ref={secondarySceneRef} className="modal-scroll-scene modal-scroll-scene-secondary" aria-label="Responsive design visual reveal">
                  <div className="modal-scroll-stage modal-scroll-stage-left">
                    <div ref={secondaryMediaRef} className={`modal-scroll-media modal-scroll-media-secondary ${isSecondarySceneImageLoaded ? "is-loaded" : ""}`}>
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

                    <div ref={secondaryNoteRef} className="modal-responsive-note modal-responsive-note-secondary" aria-label={text.modalResponsive}>
                      {responsiveLines.map((line, index) => (
                        <span
                          key={`${line}-${index}`}
                          ref={(node) => {
                            secondaryLineRefs.current[index] = node;
                          }}
                          className="modal-responsive-line"
                        >
                          {line}
                        </span>
                      ))}
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
