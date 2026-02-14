"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnet from "./Magnet";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectModal({ isOpen, isClosing, isExpanded, activeProject, text, lang, theme, onClose, onScroll, onWheel }) {
  const [isPrimarySceneImageLoaded, setIsPrimarySceneImageLoaded] = useState(false);
  const [isSecondarySceneImageLoaded, setIsSecondarySceneImageLoaded] = useState(false);

  const bodyRef = useRef(null);
  const introRef = useRef(null);
  
  const primarySceneRef = useRef(null);
  const secondarySceneRef = useRef(null);
  
  const primaryMediaRef = useRef(null);
  const secondaryMediaRef = useRef(null);

  const primaryLineRefs = useRef([]);
  const secondaryLineRefs = useRef([]);

  const noteLines = useMemo(() => {
    const maxLineLength = 35;
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
    if (lang === "bg") return ["Дизайнът е респонсив", "и оптимизиран за", "всички устройства."];
    return ["The design is responsive", "and optimized for", "all devices."];
  }, [lang]);

  useLayoutEffect(() => {
    if (!isOpen || !activeProject || !bodyRef.current) return;

    const scroller = bodyRef.current;
    
    const ctx = gsap.context(() => {
      // 1. ПАРАГРАФ АНИМАЦИЯ (БЪРЗО ИЗЧЕЗВАНЕ)
      const setupParagraphScroll = (scene) => {
        const paragraph = scene.querySelector('.scene-paragraph');
        gsap.to(paragraph, {
          y: "-60vh",
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: scene,
            scroller: scroller,
            start: "top top",
            end: "top -30%",
            scrub: true,
          }
        });
      };

      setupParagraphScroll(primarySceneRef.current);
      setupParagraphScroll(secondarySceneRef.current);

      // 2 & 3. МЕДИЯ И МАЛЪК ТЕКСТ (СЪКРАТЕН ПЪТ)
      const setupSceneFlow = (scene, media, introEl) => {
        if (!scene || !media) return;

        gsap.set(media, { 
          left: "50%",
          xPercent: -50,
          yPercent: -50,
          top: 0,
          y: "120vh", 
          autoAlpha: 0, 
          scale: 0.94,
          zIndex: 100
        });

        // STAGE 1: Peek
        ScrollTrigger.create({
          trigger: introEl || scene,
          scroller: scroller,
          start: introEl ? "bottom 40%" : "top 60%",
          onEnter: () => {
            gsap.to(media, {
              y: "90vh",
              autoAlpha: 1,
              duration: 0.6,
              ease: "power2.out",
              overwrite: "auto"
            });
          },
          onLeaveBack: () => {
            gsap.to(media, {
              y: "120vh",
              autoAlpha: 0,
              duration: 0.5,
              ease: "power2.in",
              overwrite: "auto"
            });
          }
        });

        // STAGE 2: Center Image (Много по-рано)
        ScrollTrigger.create({
          trigger: scene,
          scroller: scroller,
          start: "top -5%",
          onEnter: () => {
            gsap.to(media, {
              y: "46vh", 
              scale: 1,
              duration: 1,
              ease: "expo.out",
              overwrite: "auto"
            });
          },
          onLeaveBack: () => {
            gsap.to(media, {
              y: "90vh",
              scale: 0.96,
              duration: 0.8,
              ease: "power2.inOut",
              overwrite: "auto"
            });
          }
        });

        // STAGE 3: Small Text (Мигновено след центрирането)
        const noteEl = scene.querySelector('.modal-responsive-note');
        const lines = scene.querySelectorAll('.modal-responsive-line');
        
        gsap.timeline({
          scrollTrigger: {
            trigger: scene,
            scroller: scroller,
            start: "top -25%", 
            end: "top -70%",   
            scrub: true,
          }
        })
        .to(noteEl, { autoAlpha: 1, y: 0, duration: 0.1 })
        .to(lines, { autoAlpha: 1, y: 0, stagger: 0.05, ease: "none" });
      };

      setupSceneFlow(primarySceneRef.current, primaryMediaRef.current, introRef.current);
      setupSceneFlow(secondarySceneRef.current, secondaryMediaRef.current, null);

      setTimeout(() => ScrollTrigger.refresh(), 400);
    }, bodyRef);

    return () => ctx.revert();
  }, [isOpen, activeProject?.id, noteLines, responsiveLines]);

  return (
    <div className={`modal project-modal ${isOpen ? "is-open" : ""} ${isClosing ? "is-closing" : ""} ${isExpanded ? "is-expanded" : ""}`} aria-hidden={!isOpen && !isClosing} data-theme={theme}>
      <div className="modal-backdrop" onClick={onClose} />
      {activeProject && (
        <div className="modal-card" role="dialog" aria-modal="true" style={{ background: 'var(--surface)' }}>
          <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 500, background: 'inherit' }}>
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

          <div ref={bodyRef} className="modal-body" onScroll={onScroll} onWheel={onWheel} style={{ scrollBehavior: 'auto', paddingTop: 0, overflowX: 'hidden' }}>
            <div className="modal-content-wrap">
              
              <div ref={introRef} className="modal-intro" style={{ textAlign: 'center', padding: '12vh 20px 2vh' }}>
                <h2 className="modal-title" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.6rem)', marginBottom: '8px' }}>{activeProject[lang].title}</h2>
                <div className="modal-tags" style={{ opacity: 0.5, fontSize: '11px', letterSpacing: '0.1em' }}>{activeProject.tags.join(" • ")}</div>
              </div>

              {/* СЦЕНА 1 - Минимална височина */}
              <section ref={primarySceneRef} className="scene-container" style={{ height: '170vh', position: 'relative' }}>
                <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%' }}>
                  
                  <p className="scene-paragraph modal-desc" style={{ 
                    maxWidth: '1100px', 
                    textAlign: 'center', 
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '0 40px', 
                    position: 'absolute', 
                    top: '4vh',
                    zIndex: 10,
                    fontSize: 'clamp(1.8rem, 3.6vw, 3rem)', 
                    lineHeight: 1.2,
                    fontWeight: 500
                  }}>
                    {activeProject[lang].description}
                  </p>

                  <div ref={primaryMediaRef} className="modal-scroll-media modal-scroll-media-primary" style={{ position: 'absolute', zIndex: 100 }}>
                    <div className={`modal-media-wrap ${isPrimarySceneImageLoaded ? "is-loaded" : ""}`} style={{ background: '#fff' }}>
                      <img
                        src={activeProject.image}
                        alt={activeProject[lang].title}
                        className="modal-media-img"
                        onLoad={() => setIsPrimarySceneImageLoaded(true)}
                        style={{ maxHeight: '68vh', objectFit: 'contain' }}
                      />
                    </div>
                  </div>

                  <div className="modal-responsive-note modal-responsive-note-primary-cols" style={{ position: 'absolute', bottom: '8vh', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '1100px', padding: '0 40px', zIndex: 20, opacity: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                      {primaryNoteColumns.map((column, colIndex) => (
                        <div key={`col-${colIndex}`} className="modal-note-col">
                          {column.map((line, lineIndex) => {
                            const absIdx = colIndex === 0 ? lineIndex : primaryNoteColumns[0].length + lineIndex;
                            return (
                              <span key={absIdx} ref={el => primaryLineRefs.current[absIdx] = el} className="modal-responsive-line" style={{ display: 'block', opacity: 0, transform: 'translateY(10px)' }}>
                                {line}
                              </span>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* СЦЕНА 2 - Минимална височина */}
              <section ref={secondarySceneRef} className="scene-container" style={{ height: '170vh', position: 'relative', marginTop: '5vh' }}>
                <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%' }}>
                  
                  <p className="scene-paragraph modal-paragraph" style={{ 
                    maxWidth: '1100px', 
                    textAlign: 'center', 
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '0 40px', 
                    position: 'absolute', 
                    top: '4vh',
                    zIndex: 10,
                    fontSize: 'clamp(1.8rem, 3.6vw, 3rem)',
                    lineHeight: 1.2,
                    fontWeight: 500
                  }}>
                    {text.modalStory}
                  </p>

                  <div ref={secondaryMediaRef} className="modal-scroll-media modal-scroll-media-secondary" style={{ position: 'absolute', zIndex: 100 }}>
                    <div className={`modal-media-wrap ${isSecondarySceneImageLoaded ? "is-loaded" : ""}`} style={{ background: '#fff' }}>
                      <img
                        src={activeProject.modalImage || activeProject.image}
                        alt="Responsive"
                        className="modal-media-img"
                        onLoad={() => setIsSecondarySceneImageLoaded(true)}
                        style={{ maxHeight: '68vh', objectFit: 'contain' }}
                      />
                    </div>
                  </div>

                  <div className="modal-responsive-note" style={{ position: 'absolute', bottom: '8vh', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 20, opacity: 0 }}>
                    {responsiveLines.map((line, idx) => (
                      <span key={idx} ref={el => secondaryLineRefs.current[idx] = el} className="modal-responsive-line" style={{ display: 'block', opacity: 0, transform: 'translateY(10px)' }}>
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <div style={{ height: '10vh' }} />

            </div>
          </div>
        </div>
      )}
    </div>
  );
}