"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

function signedCyclicOffset(index, activeIndex, total) {
  const forward = (index - activeIndex + total) % total;
  const backward = forward - total;
  return Math.abs(backward) < Math.abs(forward) ? backward : forward;
}

function HeroSlideCard({ project, depth, offset, isVisible, lang, onOpenProject, parallaxX }) {
  const [hoverOffset, setHoverOffset] = useState({ x: 0, y: 0 });

  const absDepth = Math.abs(depth);
  const baseX = 0;
  const baseY = offset * 250;
  const scale = 1 - absDepth * 0.08;
  const opacity = 1 - absDepth * 0.2;
  const depthParallaxFactor = 1 - absDepth * 0.18;

  return (
    <motion.button
      className="hero-slide-card"
      type="button"
      onClick={() => onOpenProject(project)}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) * 0.08;
        const y = (event.clientY - (rect.top + rect.height / 2)) * 0.08;
        setHoverOffset({ x, y });
      }}
      onMouseLeave={() => setHoverOffset({ x: 0, y: 0 })}
      initial={{ x: 760, y: baseY + offset * 60, scale: 0.84, opacity: 0 }}
      animate={
        isVisible
          ? { x: baseX + hoverOffset.x + parallaxX * depthParallaxFactor, y: baseY + hoverOffset.y, scale, opacity }
          : { x: -700, y: baseY, scale: 0.84, opacity: 0 }
      }
      transition={{
        duration: isVisible ? 0.42 : 0.3,
        delay: isVisible ? absDepth * 0.06 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        zIndex: 30 - absDepth,
        filter: absDepth === 0 ? "none" : `saturate(${1 - absDepth * 0.08}) brightness(${1 - absDepth * 0.1})`,
      }}
      aria-label={`Open project ${project[lang].title}`}
    >
      <img src={project.image} alt={project[lang].title} className="hero-slide-image" />
      <span className="hero-slide-glow" />
    </motion.button>
  );
}

export default function HeroProjectSlider({ projects, lang, isVisible, onOpenProject }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [parallaxX, setParallaxX] = useState(0);

  const stack = useMemo(() => {
    const total = projects.length;
    return projects
      .map((project, index) => ({
        project,
        offset: signedCyclicOffset(index, activeIndex, total),
      }))
      .filter((item) => Math.abs(item.offset) <= 2)
      .sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));
  }, [projects, activeIndex]);

  const prev = () => {
    setActiveIndex((value) => (value - 1 + projects.length) % projects.length);
  };

  const next = () => {
    setActiveIndex((value) => (value + 1) % projects.length);
  };

  const focusedProject = projects[activeIndex];

  useEffect(() => {
    if (!isVisible) {
      setParallaxX(0);
      return undefined;
    }

    const onMouseMove = (event) => {
      const centerX = window.innerWidth / 2;
      const normalized = (event.clientX - centerX) / centerX;
      setParallaxX(normalized * 18);
    };

    const onMouseLeave = () => setParallaxX(0);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [isVisible]);

  return (
    <motion.section
      className="hero-slider-shell"
      initial={{ opacity: 0, x: 220 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -320 }}
      transition={{ duration: isVisible ? 0.45 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={!isVisible}
      style={{ pointerEvents: "none" }}
    >
      <div className="hero-slider-stage">
        <div className="hero-slider-stack" role="region" aria-label="Featured projects slider">
          {stack.map(({ project, offset }) => (
            <HeroSlideCard
              key={project.id}
              project={project}
              depth={offset}
              offset={offset}
              isVisible={isVisible}
              lang={lang}
              onOpenProject={onOpenProject}
              parallaxX={parallaxX}
            />
          ))}
        </div>

        <motion.div className="hero-slider-controls" initial={{ opacity: 0, y: 20 }} animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.35, delay: isVisible ? 0.3 : 0 }}>
          <button type="button" className="hero-slider-arrow" onClick={prev} aria-label="Previous project">
            <ChevronUp size={18} />
          </button>
          <button type="button" className="hero-slider-arrow" onClick={next} aria-label="Next project">
            <ChevronDown size={18} />
          </button>
        </motion.div>

        <motion.div className="hero-slider-title" initial={{ opacity: 0, x: 24 }} animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }} transition={{ duration: 0.35, delay: isVisible ? 0.25 : 0 }}>
          {focusedProject?.[lang].title}
        </motion.div>
      </div>
    </motion.section>
  );
}
