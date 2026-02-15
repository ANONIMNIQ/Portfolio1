"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Magnet from "./Magnet";

gsap.registerPlugin(ScrollTrigger);

export default function ProjectModal({ isOpen, isClosing, isExpanded, activeProject, text, lang, theme, onClose, onScroll, onWheel }) {
  const [isMobile, setIsMobile] = useState(false);
  const [primaryImageWidth, setPrimaryImageWidth] = useState(0);
  const bodyRef = useRef(null);
  const introRef = useRef(null);
  const primaryImgRef = useRef(null);
  const cardRef = useRef(null);
  
  const primarySceneRef = useRef(null);
  const secondarySceneRef = useRef(null);
  
  const primaryMediaRef = useRef(null);
  const secondaryMediaRef = useRef(null);

  // Дефиниране на градиентите според темата
  const gradients = useMemo(() => ({
    one: {
      light: "linear-gradient(135deg, #fff5f7 0%, #ffe0e6 100%)",
      dark: "linear-gradient(135deg, #ffd1dc 0%, #ffb6c1 100%)"
    },
    two: {
      light: "linear-gradient(135deg, #f3f0ff 0%, #e0e6ff 100%)",
      dark: "linear-gradient(135deg, #e6e6ff 0%, #ccccff 100%)"
    },
    three: {
      light: "linear-gradient(135deg, #eefaf8 0%, #d0f5f0 100%)",
      dark: "linear-gradient(135deg, #d0f0e8 0%, #b0e0d8 100%)"
    }
  }), []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (primaryImgRef.current) {
        setPrimaryImageWidth(primaryImgRef.current.offsetWidth);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

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
    if (!isOpen || !activeProject || !bodyRef.current || isMobile) return;

    const scroller = bodyRef.current;
    const card = cardRef.current;
    const currentThemeGradients = gradients[theme] || gradients.one;
    
    const ctx = gsap.context(() => {
      // Анимация на фона на модала
      gsap.to(card, {
        background: currentThemeGradients.dark,
        ease: "none",
        scrollTrigger: {
          trigger: secondarySceneRef.current,
          scroller: scroller,
          start: "top 80%",
          end: "top 20%",
          scrub: true,
        }
      });

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

      const setupSceneFlow = (scene, media, introEl, isPrimary = true) => {
        if (!scene || !media) return;

        const wrap = media.querySelector('.modal-media-wrap');
        
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

        gsap.set(wrap, {
          opacity: 0.6,
          boxShadow: "0 15px 35px rgba(0,0,0,0.25), 0 5px 15px rgba(0,0,0,0.1)"
        });

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
            gsap.to(wrap, {
              opacity: 1,
              boxShadow: isPrimary 
                ? "0 40px 100px rgba(0,0,0,0.25), 0 10px 40px rgba(0,0,0,0.12)"
                : "0 30px 80px rgba(0,0,0,0.2), 0 8px 30px rgba(0,0,0,0.1)",
              duration: 1,
              ease: "power2.out"
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
            gsap.to(wrap, {
              opacity: 0.6,
              boxShadow: "0 15px 35px rgba(0,0,0,0.25), 0 5px 15px rgba(0,0,0,0.1)",
              duration: 0.8,
              ease: "power2.inOut"
            });
          }
        });

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

      setupSceneFlow(primarySceneRef.current, primaryMediaRef.current, introRef.current, true);
      setupSceneFlow(secondarySceneRef.current, secondaryMediaRef.current, null, false);

      setTimeout(() => ScrollTrigger.refresh(), 400);
    }, bodyRef);

    return () => ctx.revert();
  }, [isOpen, activeProject?.id, isMobile, noteLines, responsiveLines, theme, gradients]);

  return (
    <div className={`modal project-modal ${isOpen ? "is-open" : ""} ${isClosing ? "is-closing" : ""} ${isExpanded ? "is-expanded" : ""}`} aria-hidden={!isOpen && !isClosing} data-theme={theme}>
      <div className="modal-backdrop" onClick={onClose} />
      {activeProject && (
        <div ref={cardRef} className="modal-card" role="dialog" aria-modal="true" style={{ background: gradients[theme]?.light || 'var(--surface)' }}>
          <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 500, background: 'transparent' }}>
            <div className="modal-header-left">
              {activeProject.link && (
                <Magnet strength={0.1}>
                  <a 
                    href={activeProject.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="chip" 
                    style={{ border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", textDecoration: 'none' }}
                  >
                    {text.liveSite} <ExternalLink size={10} />
                  </a>
                </Magnet>
              )}
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
            <div className="modal-content-wrap" style={{ padding: isMobile ? '0 20px' : '0' }}>
              
              {isMobile ? (
                <div className="mobile-layout" style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '40px 0 80px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', color: 'var(--ink)' }}>{activeProject[lang].title}</h2>
                    <div style={{ opacity: 0.6, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{activeProject.tags.join(" • ")}</div>
                  </div>

                  <p style={{ fontSize: '1.15rem', lineHeight: 1.4, color: 'var(--ink-dark)', fontWeight: 500 }}>
                    {activeProject[lang].description}
                  </p>

                  <div style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={activeProject.image} alt={activeProject[lang].title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                    {noteLines.map((line, i) => <span key={i}>{line}</span>)}
                  </div>

                  <div style={{ height: '1px', background: 'var(--line)' }} />

                  <p style={{ fontSize: '1.15rem', lineHeight: 1.4, color: 'var(--ink-dark)', fontWeight: 500 }}>
                    {text.modalStory}
                  </p>

                  <div style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.15)', borderRadius: '18px', overflow: 'hidden', width: '80%', alignSelf: 'center' }}>
                    <img src={activeProject.modalImage || activeProject.image} alt="Mobile view" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--ink-dark)', fontWeight: 500 }}>
                    {responsiveLines.join(" ")}
                  </div>
                </div>
              ) : (
                <>
                  <div ref={introRef} className="modal-intro" style={{ textAlign: 'center', padding: '12vh 20px 2vh' }}>
                    <h2 className="modal-title" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.6rem)', marginBottom: '8px' }}>{activeProject[lang].title}</h2>
                    <div className="modal-tags" style={{ opacity: 0.5, fontSize: '11px', letterSpacing: '0.1em' }}>{activeProject.tags.join(" • ")}</div>
                  </div>

                  <section ref={primarySceneRef} className="scene-container" style={{ height: '170vh', position: 'relative' }}>
                    <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%' }}>
                      <p className="scene-paragraph modal-desc" style={{ 
                        maxWidth: '1100px', textAlign: 'center', left: '50%', transform: 'translateX(-50%)',
                        padding: '0 40px', position: 'absolute', top: '4vh', zIndex: 10,
                        fontSize: 'clamp(1.8rem, 3.6vw, 3rem)', lineHeight: 1.2, fontWeight: 500, color: 'var(--ink-dark)'
                      }}>
                        {activeProject[lang].description}
                      </p>
                      <div ref={primaryMediaRef} className="modal-scroll-media modal-scroll-media-primary" style={{ position: 'absolute', zIndex: 100, width: 'fit-content' }}>
                        <div className="modal-media-wrap is-loaded" style={{ background: 'transparent', borderRadius: '12px' }}>
                          <img 
                            ref={primaryImgRef}
                            src={activeProject.image} 
                            alt={activeProject[lang].title} 
                            className="modal-media-img" 
                            onLoad={(e) => setPrimaryImageWidth(e.target.offsetWidth)}
                            style={{ maxHeight: '74vh', width: 'auto', objectFit: 'contain', opacity: 1, filter: 'none', borderRadius: '12px' }} 
                          />
                        </div>
                      </div>
                      <div className="modal-responsive-note modal-responsive-note-primary-cols" style={{ 
                        position: 'absolute', bottom: '6vh', left: '50%', transform: 'translateX(-50%)', 
                        width: primaryImageWidth ? `${primaryImageWidth}px` : 'var(--project-media-width)', 
                        maxWidth: '100%', padding: '0', zIndex: 20, opacity: 0, textAlign: 'left'
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                          <div className="modal-note-col">
                            {primaryNoteColumns[0].map((line, i) => (
                              <span key={i} className="modal-responsive-line" style={{ display: 'block', opacity: 0, transform: 'translateY(10px)', fontSize: '0.95rem' }}>{line}</span>
                            ))}
                          </div>
                          <div className="modal-note-col">
                            {primaryNoteColumns[1].map((line, i) => (
                              <span key={i} className="modal-responsive-line" style={{ display: 'block', opacity: 0, transform: 'translateY(10px)', fontSize: '0.95rem' }}>{line}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section ref={secondarySceneRef} className="scene-container" style={{ height: '170vh', position: 'relative', marginTop: '5vh' }}>
                    <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%' }}>
                      <p className="scene-paragraph modal-paragraph" style={{ 
                        maxWidth: '1100px', textAlign: 'center', left: '50%', transform: 'translateX(-50%)',
                        padding: '0 40px', position: 'absolute', top: '4vh', zIndex: 10,
                        fontSize: 'clamp(1.8rem, 3.6vw, 3rem)', lineHeight: 1.2, fontWeight: 500, color: 'var(--ink-dark)'
                      }}>
                        {text.modalStory}
                      </p>
                      <div ref={secondaryMediaRef} className="modal-scroll-media modal-scroll-media-secondary" style={{ position: 'absolute', zIndex: 100, width: 'fit-content' }}>
                        <div className="modal-media-wrap is-loaded" style={{ background: 'transparent', borderRadius: '18px' }}>
                          <img src={activeProject.modalImage || activeProject.image} alt="Responsive" className="modal-media-img" style={{ maxHeight: '74vh', width: 'auto', objectFit: 'contain', opacity: 1, filter: 'none', borderRadius: '18px' }} />
                        </div>
                      </div>
                      <div className="modal-responsive-note" style={{ position: 'absolute', bottom: '8vh', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 20, opacity: 0 }}>
                        {responsiveLines.map((line, idx) => (
                          <span key={idx} className="modal-responsive-line" style={{ display: 'block', opacity: 0, transform: 'translateY(10px)', fontSize: '0.95rem' }}>{line}</span>
                        ))}
                      </div>
                    </div>
                  </section>
                </>
              )}

              <div style={{ height: '10vh' }} />

            </div>
          </div>
        </div>
      )}
    </div>
  );
}