"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import IntroLoader from "./components/IntroLoader";
import EmojiBurst from "./components/EmojiBurst";
import MenuOverlay from "./components/MenuOverlay";
import AboutOverlay from "./components/AboutOverlay";
import ContactModal from "./components/ContactModal";
import ProjectsPanel from "./components/ProjectsPanel";
import ProjectModal from "./components/ProjectModal";
import VisualAside from "./components/VisualAside";
import { useWebGLBackground } from "./hooks/useWebGLBackground";
import { copy, EMOJIS, projects } from "./lib/siteData";

export default function Home() {
  const canvasRef = useRef(null);
  const collapseIntentRef = useRef(false);
  const maxVhRef = useRef(0);

  const [activeProject, setActiveProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastCollapseAt, setLastCollapseAt] = useState(0);
  const [showProjects, setShowProjects] = useState(false);
  const [theme, setTheme] = useState("one");

  const [lang, setLang] = useState("bg");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const [showLoader, setShowLoader] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [burstItems, setBurstItems] = useState([]);
  const [isSmallViewport, setIsSmallViewport] = useState(false);

  const text = copy[lang];
  const hiddenByOverlay = isMenuOpen || showProjects || isModalOpen || isAboutOpen || isContactOpen;
  const showProjectsLike = showProjects || isAboutOpen || isContactOpen;

  useWebGLBackground(canvasRef, !showLoader);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1024px)");
    const syncViewport = () => setIsSmallViewport(media.matches);
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    const setViewportHeight = () => {
      const vvHeight = window.visualViewport?.height ?? 0;
      const current = Math.max(window.innerHeight, vvHeight || 0, document.documentElement.clientHeight || 0);
      maxVhRef.current = Math.max(maxVhRef.current, current);
      document.documentElement.style.setProperty("--app-vh", `${maxVhRef.current}px`);
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    window.visualViewport?.addEventListener("resize", setViewportHeight);

    return () => {
      window.removeEventListener("resize", setViewportHeight);
      window.visualViewport?.removeEventListener("resize", setViewportHeight);
    };
  }, []);

  useEffect(() => {
    if (isSmallViewport && isExpanded) {
      setIsExpanded(false);
      collapseIntentRef.current = false;
    }
  }, [isSmallViewport, isExpanded]);

  useEffect(() => {
    if (!showLoader) {
      const timer = setTimeout(() => setHasLoadedOnce(true), 3500);
      return () => clearTimeout(timer);
    }
  }, [showLoader]);

  const triggerEmojiBurst = () => {
    const items = [];
    for (let i = 0; i < 100; i += 1) {
      const side = i < 50 ? "left" : "right";
      items.push({
        id: `${Date.now()}-${Math.random()}`,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        side,
        delay: Math.random() * 0.4,
        rotation: Math.random() * 720,
        scale: 0.3 + Math.random() * 0.5,
      });
    }

    setBurstItems(items);
    setTimeout(() => setBurstItems([]), 5000);
  };

  const openProjectModal = (project) => {
    setActiveProject(project);
    setTheme(project.theme);
    requestAnimationFrame(() => {
      setIsModalOpen(true);
      triggerEmojiBurst();
    });
  };

  const closeProjectModal = () => {
    collapseIntentRef.current = false;
    setIsClosing(true);
    setIsModalOpen(false);
    setTimeout(() => {
      setActiveProject(null);
      setTheme("one");
      setIsExpanded(false);
      setIsClosing(false);
    }, 450);
  };

  const handleModalScroll = (event) => {
    if (isSmallViewport) return;

    const target = event.currentTarget;
    if (target.scrollTop > 20 && !isExpanded) {
      collapseIntentRef.current = false;
      setIsExpanded(true);
    } else if (target.scrollTop <= 2 && isExpanded && collapseIntentRef.current) {
      collapseIntentRef.current = false;
      setIsExpanded(false);
      setLastCollapseAt(Date.now());
    }
  };

  const handleModalWheel = (event) => {
    if (isSmallViewport) return;

    const target = event.currentTarget;
    const isAtTop = target.scrollTop <= 2;
    const hasScrollableOverflow = target.scrollHeight > target.clientHeight + 1;

    if (isExpanded && event.deltaY < 0 && (isAtTop || !hasScrollableOverflow)) {
      collapseIntentRef.current = false;
      setIsExpanded(false);
      setLastCollapseAt(Date.now());
      return;
    }

    if (event.deltaY < 0 && target.scrollTop <= 16) {
      collapseIntentRef.current = true;
    } else if (event.deltaY > 0) {
      collapseIntentRef.current = false;
    }

    const cooldownPassed = Date.now() - lastCollapseAt > 220;
    if (!isExpanded && target.scrollTop <= 0 && event.deltaY < 0 && cooldownPassed) {
      closeProjectModal();
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showLoader && <IntroLoader onComplete={() => setShowLoader(false)} />}
      </AnimatePresence>

      <EmojiBurst items={burstItems} />

      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenProjects={() => setShowProjects(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
        text={text}
      />

      <AboutOverlay isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} text={text} />

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} text={text} />

      <motion.div
        initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 } }}
        className={`app ${isModalOpen ? "modal-open" : ""} ${isExpanded ? "modal-expanded" : ""} ${isClosing ? "modal-closing" : ""} ${showProjects ? "projects-visible" : "projects-hidden"}`}
        data-theme={theme}
      >
        <VisualAside
          canvasRef={canvasRef}
          showLangSwitch={!hiddenByOverlay && hasLoadedOnce}
          showInfoTrigger={!hiddenByOverlay && hasLoadedOnce}
          hasLoadedOnce={hasLoadedOnce}
          lang={lang}
          onToggleLang={() => setLang((value) => (value === "bg" ? "en" : "bg"))}
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenProjects={() => setShowProjects(true)}
          showProjectsLike={showProjectsLike}
          isMenuOpen={isMenuOpen}
        />

        <AnimatePresence mode="wait">
          {showProjects && (
            <ProjectsPanel
              key="projects-panel"
              projects={projects}
              onOpenProject={openProjectModal}
              setShowProjects={setShowProjects}
              isModalOpen={isModalOpen}
              isContactOpen={isContactOpen}
              lang={lang}
              text={text}
              onOpenContact={() => setIsContactOpen(true)}
              onThemeChange={setTheme}
              isSmallViewport={isSmallViewport}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSmallViewport && showProjects && !isModalOpen && !isContactOpen && (
            <motion.div className="content-close-wrap-mobile" initial={{ scale: 0.72, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { delay: 0.62, duration: 0.34, ease: [0.34, 1.56, 0.64, 1] } }} exit={{ scale: 0.85, opacity: 0, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}>
              <button className="content-close" type="button" aria-label="Hide projects" onClick={() => setShowProjects(false)}>
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <ProjectModal
          isOpen={isModalOpen}
          isClosing={isClosing}
          activeProject={activeProject}
          text={text}
          lang={lang}
          onClose={closeProjectModal}
          onScroll={handleModalScroll}
          onWheel={handleModalWheel}
        />
      </motion.div>
    </>
  );
}
