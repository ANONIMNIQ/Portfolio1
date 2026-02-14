"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import Magnet from "./Magnet";

gsap.registerPlugin(ScrollTrigger, Observer);

export default function ProjectModal({ isOpen, isClosing, isExpanded, activeProject, text, lang, theme, onClose, onScroll, onWheel }) {
  const [isPrimarySceneImageLoaded, setIsPrimarySceneImageLoaded] = useState(false);
  const [isSecondarySceneImageLoaded, setIsSecondarySceneImageLoaded] = useState(false);
  const [secondaryImageSrc, setSecondaryImageSrc] = useState("");

  const bodyRef = useRef(null);
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
    if (!isOpen || !activeProject || !bodyRef.current) return;

    const scroller = bodyRef.current;
    let observer;

    const ctx = gsap.context(() => {
      const primaryLines = primaryLineRefs.current.filter(Boolean);
      const secondaryLines = secondaryLineRefs.current.filter(Boolean);

      const computeMediaOffsets = (element) => {
        gsap.set(element, { x: 0, y: 0, clearProps: "scale,filter,xPercent" });
        const rect = element.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const centerX = scrollerRect.left + scroller.clientWidth / 2;
        const finalCenterX = rect.left + rect.width / 2;

        const hiddenTop = scrollerRect.top + scroller.clientHeight + rect.height * 0.18;
        const peekTop = scrollerRect.top + scroller.clientHeight - rect.height * 0.5;
        const centeredTop = scrollerRect.top + (scroller.clientHeight - rect.height) / 2;

        return {
          xCenter: centerX - finalCenterX,
          yHidden: hiddenTop - rect.top,
          yPeek: peekTop - rect.top,
          yCenter: centeredTop - rect.top,
        };
      };

      const buildSceneTimelines = (mediaEl, paragraphEl, revealRef, lines, isPrimary = true) => {
        const m = computeMediaOffsets(mediaEl);
        const leftNudge = -Math.min(96, Math.max(44, scroller.clientWidth * 0.058));
        const finalX = m.xCenter + leftNudge;
        const finalY = m.yCenter;

        gsap.set(mediaEl, {
          autoAlpha: 0,
          x: m.xCenter,
          y: m.yHidden,
        });

        gsap.set(revealRef.current, { autoAlpha: 0 });
        gsap.set(lines, { autoAlpha: 0, y: 14 });
        gsap.set(paragraphEl, { yPercent: 0, autoAlpha: 1 });

        const revealTl = gsap.timeline({ paused: true }).to(mediaEl, {
          autoAlpha: 1,
          x: m.xCenter,
          y: m.yPeek,
          duration: 0.56,
          ease: "power2.out",
        });

        const settleTl = gsap.timeline({ paused: true }).to(
          mediaEl,
          {
            x: m.xCenter,
            y: m.yCenter,
            duration: 0.46,
            ease: "power2.out",
          },
          0
        ).to(
          mediaEl,
          {
            x: finalX,
            y: finalY,
            duration: 0.42,
            ease: "power2.out",
          },
          0.46
        );

        ScrollTrigger.create({
          trigger: paragraphEl,
          scroller,
          start: "top top",
          end: "top top",
          invalidateOnRefresh: true,
          onEnter: () => revealTl.play(),
          onEnterBack: () => revealTl.play(),
          onLeaveBack: () => revealTl.reverse(),
        });

        ScrollTrigger.create({
          trigger: paragraphEl,
          scroller,
          start: "bottom top",
          end: "bottom top",
          invalidateOnRefresh: true,
          onEnter: () => settleTl.play(),
          onEnterBack: () => settleTl.play(),
          onLeaveBack: () => settleTl.reverse(),
        });

        gsap.timeline({
          scrollTrigger: {
            trigger: paragraphEl,
            scroller,
            start: "bottom top",
            end: "bottom top+=360",
            scrub: 0.86,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        }).to(
          revealRef.current,
          {
            autoAlpha: 1,
            duration: 0.06,
            ease: "none",
          },
          0
        ).to(
          lines,
          {
            autoAlpha: 1,
            y: 0,
            duration: isPrimary ? 0.22 : 0.24,
            stagger: isPrimary ? 0.12 : 0.16,
            ease: "none",
          },
          0.02
        );
      };

      buildSceneTimelines(primaryMediaRef.current, descriptionRef.current, primaryNoteRef, primaryLines, true);
      buildSceneTimelines(secondaryMediaRef.current, followupRef.current, secondaryNoteRef, secondaryLines, false);

      observer = Observer.create({
        target: scroller,
        type: "wheel,touch,pointer",
        tolerance: 1,
        preventDefault: false,
        onChangeY: () => ScrollTrigger.update(),
      });

      ScrollTrigger.refresh();
    }, bodyRef);

    return () => {
      if (observer) observer.kill();
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
            <div className="modal-content-wrap">
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
