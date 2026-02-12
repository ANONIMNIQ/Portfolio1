"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

function relativeDepth(index, activeIndex, total) {
  return (index - activeIndex + total) % total;
}

export default function HeroProjectSlider({ projects, lang, isVisible, onOpenProject }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const stack = useMemo(() => {
    const total = projects.length;
    return projects
      .map((project, index) => ({
        project,
        index,
        depth: relativeDepth(index, activeIndex, total),
      }))
      .filter((item) => item.depth < 4)
      .sort((a, b) => b.depth - a.depth);
  }, [projects, activeIndex]);

  const prev = () => {
    setActiveIndex((value) => (value - 1 + projects.length) % projects.length);
  };

  const next = () => {
    setActiveIndex((value) => (value + 1) % projects.length);
  };

  const focusedProject = projects[activeIndex];

  return (
    <motion.section
      className="hero-slider-shell"
      initial={{ opacity: 0, x: 220 }}
      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -320 }}
      transition={{ duration: isVisible ? 0.45 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden={!isVisible}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <div className="hero-slider-stage">
        <div className="hero-slider-stack" role="region" aria-label="Featured projects slider">
          {stack.map(({ project, index, depth }) => {
            const x = depth * 96;
            const y = depth * 12;
            const scale = 1 - depth * 0.08;
            const rotateY = -depth * 7;
            const opacity = 1 - depth * 0.15;

            return (
              <motion.button
                key={project.id}
                className="hero-slide-card"
                type="button"
                onClick={() => onOpenProject(project)}
                initial={{ x: 680 + depth * 80, y, scale: 0.84, rotateY: -18, opacity: 0 }}
                animate={isVisible ? { x, y, scale, rotateY, opacity } : { x: -560, y, scale: 0.84, rotateY: 10, opacity: 0 }}
                transition={{
                  duration: isVisible ? 0.42 : 0.3,
                  delay: isVisible ? depth * 0.08 : 0,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ zIndex: 20 - depth }}
                aria-label={`Open project ${project[lang].title}`}
              >
                <img src={project.image} alt={project[lang].title} className="hero-slide-image" />
                <span className="hero-slide-glow" />
              </motion.button>
            );
          })}
        </div>

        <motion.div className="hero-slider-title" initial={{ opacity: 0, y: 18 }} animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: 0.35, delay: isVisible ? 0.25 : 0 }}>
          {focusedProject?.[lang].title}
        </motion.div>

        <motion.div className="hero-slider-controls" initial={{ opacity: 0, y: 20 }} animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.35, delay: isVisible ? 0.3 : 0 }}>
          <button type="button" className="hero-slider-arrow" onClick={prev} aria-label="Previous project">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="hero-slider-arrow" onClick={next} aria-label="Next project">
            <ChevronRight size={18} />
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
