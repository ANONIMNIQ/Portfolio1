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
  const primaryStageRef = useRef(null);
  const secondaryStageRef = useRef(null);
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

  const primaryNoteColumns = useMemo(() => {
    const middle = Math.ceil(noteLines.length / 2);
    return [noteLines.slice(0, middle), noteLines.slice(middle)];
  }, [noteLines]);

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

      const buildSceneTimelines = (stageEl, mediaEl, paragraphEl, revealRef, lines, isPrimary = true) => {
        const finalXPercent = 0;
        let autoScrollTween = null;

        gsap.set(mediaEl, {
          autoAlpha: 0,
          x: 0,
          y: 0,
          xPercent: 0,
          yPercent: 126,
          filter: "drop-shadow(0 0 0 rgba(17, 24, 39, 0))",
        });

        gsap.set(revealRef.current, { autoAlpha: 0 });
        gsap.set(lines, { autoAlpha: 0, y: 14 });
        gsap.set(paragraphEl, { yPercent: 0, autoAlpha: 1 });

        const revealTl = gsap.timeline({ paused: true }).to(mediaEl, {
          autoAlpha: 1,
          yPercent: 10,
          duration: 0.68,
          ease: "power2.out",
        }).to(mediaEl, {
          filter: "drop-shadow(0 34px 62px rgba(17, 24, 39, 0.34))",
          duration: 0.42,
          ease: "power1.out",
        }, 0);

        const settleToCenterTl = gsap.timeline({ paused: true }).to(mediaEl, {
          autoAlpha: 1,
          yPercent: 0,
          xPercent: 0,
          filter: "drop-shadow(0 18px 34px rgba(17, 24, 39, 0.22))",
          duration: 0.52,
          ease: "power2.inOut",
        });

        const settleTl = gsap.timeline({ paused: true }).to(
          mediaEl,
          {
            autoAlpha: 1,
            xPercent: finalXPercent,
            duration: 0.44,
            ease: "power2.out",
          },
          0
        ).to(
          mediaEl,
          {
            filter: "drop-shadow(0 12px 24px rgba(17, 24, 39, 0.16))",
            duration: 0.38,
            ease: "power1.out",
          },
          0
        );

        ScrollTrigger.create({
          trigger: paragraphEl,
          scroller,
          start: "top top",
          end: "bottom top",
          pin: stageEl,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: () => revealTl.play(),
          onEnterBack: () => {
            settleTl.pause(0);
            settleToCenterTl.pause(0);
            revealTl.play();
          },
          onLeaveBack: () => {
            settleTl.pause(0);
            settleToCenterTl.pause(0);
            revealTl.reverse();
          },
        });

        ScrollTrigger.create({
          trigger: paragraphEl,
          scroller,
          start: "bottom top+=8",
          end: "bottom top+=8",
          invalidateOnRefresh: true,
          onEnter: () => {
            revealTl.progress(1);
            settleToCenterTl.play();
            settleTl.play();

            if (autoScrollTween) autoScrollTween.kill();
            const stageRect = stageEl.getBoundingClientRect();
            const scrollerRect = scroller.getBoundingClientRect();
            const centerDelta = stageRect.top + stageRect.height / 2 - (scrollerRect.top + scroller.clientHeight / 2);
            const targetScrollTop = Math.max(0, scroller.scrollTop + centerDelta);

            autoScrollTween = gsap.to(scroller, {
              scrollTop: targetScrollTop,
              duration: 0.58,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
          onEnterBack: () => {
            if (autoScrollTween) autoScrollTween.kill();
            settleTl.reverse();
            settleToCenterTl.reverse();
          },
          onLeaveBack: () => {
            if (autoScrollTween) autoScrollTween.kill();
            settleTl.reverse();
            settleToCenterTl.reverse();
          },
        });

        gsap.timeline({
          scrollTrigger: {
            trigger: stageEl,
            scroller,
            start: "center center",
            end: isPrimary ? "+=1180" : "+=920",
            scrub: 0.92,
            fastScrollEnd: false,
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

      buildSceneTimelines(primaryStageRef.current, primaryMediaRef.current, descriptionRef.current, primaryNoteRef, primaryLines, true);
      buildSceneTimelines(secondaryStageRef.current, secondaryMediaRef.current, followupRef.current, secondaryNoteRef, secondaryLines, false);

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
                  <div ref={primaryStageRef} className="modal-scroll-stage modal-scroll-stage-right">
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

                    <div ref={primaryNoteRef} className="modal-responsive-note modal-responsive-note-primary modal-responsive-note-primary-cols" aria-label={text.modalTech}>
                      {primaryNoteColumns.map((column, colIndex) => (
                        <div key={`col-${colIndex}`} className="modal-note-col">
                          {column.map((line, lineIndex) => {
                            const absoluteIndex = colIndex === 0 ? lineIndex : primaryNoteColumns[0].length + lineIndex;
                            return (
                              <span
                                key={`${line}-${absoluteIndex}`}
                                ref={(node) => {
                                  primaryLineRefs.current[absoluteIndex] = node;
                                }}
                                className="modal-responsive-line"
                              >
                                {line}
                              </span>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <p ref={followupRef} className="modal-paragraph modal-followup-paragraph">
                  {text.modalStory}
                </p>

                <section ref={secondarySceneRef} className="modal-scroll-scene modal-scroll-scene-secondary" aria-label="Responsive design visual reveal">
                  <div ref={secondaryStageRef} className="modal-scroll-stage modal-scroll-stage-left">
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
