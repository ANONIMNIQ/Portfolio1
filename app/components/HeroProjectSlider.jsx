"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

function HeroSlideCard({ project, depth, offset, isVisible, lang, onOpenProject, parallaxX, isFocused, onFocusedHover, onFocusedWheel }) {
  const [hoverOffset, setHoverOffset] = useState({ x: 0, y: 0 });

  const absDepth = Math.abs(depth);
  const baseX = 0;
  const baseY = offset === 0 ? 0 : `${offset > 0 ? "" : "-"}50vh`;
  const hoverY = isFocused ? hoverOffset.y : `calc(${baseY} + ${hoverOffset.y}px)`;
  const scale = offset === 0 ? 1 : 0.82;
  const opacity = offset === 0 ? 1 : 0.72;
  const effectiveParallaxX = isFocused ? parallaxX : 0;
  const depthFilter = absDepth === 0 ? "saturate(1) brightness(1)" : `saturate(${1 - absDepth * 0.08}) brightness(${1 - absDepth * 0.1})`;

  return (
    <motion.button
      className="hero-slide-card"
      type="button"
      onClick={() => onOpenProject(project)}
      onMouseMove={(event) => {
        if (!isFocused) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) * 0.08;
        const y = (event.clientY - (rect.top + rect.height / 2)) * 0.08;
        setHoverOffset({ x, y });
      }}
      onMouseEnter={() => {
        if (isFocused) onFocusedHover(true);
      }}
      onMouseLeave={() => {
        setHoverOffset({ x: 0, y: 0 });
        if (isFocused) onFocusedHover(false);
      }}
      onWheel={(event) => {
        if (!isFocused) return;
        event.preventDefault();
        onFocusedWheel(event.deltaY);
      }}
      initial={{ x: 760, y: baseY, scale: 0.84, opacity: 0, filter: `${depthFilter} blur(14px)` }}
      animate={
        isVisible
          ? { x: baseX + hoverOffset.x + effectiveParallaxX, y: hoverY, scale, opacity, filter: `${depthFilter} blur(0px)` }
          : { x: -700, y: baseY, scale: 0.84, opacity: 0, filter: `${depthFilter} blur(14px)` }
      }
      transition={{
        duration: isVisible ? 0.5 : 0.34,
        delay: isVisible ? absDepth * 0.06 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        zIndex: 30 - absDepth,
        pointerEvents: isFocused ? "auto" : "none",
      }}
      aria-label={`Open project ${project[lang].title}`}
    >
      <img src={project.image} alt={project[lang].title} className="hero-slide-image" />
      <span className="hero-slide-glow" />
    </motion.button>
  );
}

export default function HeroProjectSlider({ projects, lang, isVisible, onOpenProject, exitDirection = "left" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [parallaxX, setParallaxX] = useState(0);
  const [isFocusedHovered, setIsFocusedHovered] = useState(false);
  const lastWheelAtRef = useRef(0);

  const stack = useMemo(() => {
    return projects
      .map((project, index) => ({
        project,
        offset: index - activeIndex,
      }))
      .filter((item) => Math.abs(item.offset) <= 1)
      .sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));
  }, [projects, activeIndex]);

  const prev = () => {
    setActiveIndex((value) => Math.max(value - 1, 0));
  };

  const next = () => {
    setActiveIndex((value) => Math.min(value + 1, projects.length - 1));
  };

  const focusedProject = projects[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < projects.length - 1;
  const showTitle = isVisible && isFocusedHovered;

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

  useEffect(() => {
    setIsFocusedHovered(false);
  }, [activeIndex]);

  const handleWheelNavigation = (deltaY) => {
    const now = Date.now();
    if (now - lastWheelAtRef.current < 280) return;
    lastWheelAtRef.current = now;

    if (deltaY > 0) next();
    if (deltaY < 0) prev();
  };

  const hiddenAnimation = exitDirection === "up" ? { opacity: 0, x: 0, y: -280 } : { opacity: 0, x: -320, y: 0 };

  return (
    <motion.section
      className="hero-slider-shell"
      initial={{ opacity: 0, x: 220 }}
      animate={isVisible ? { opacity: 1, x: 0, y: 0 } : hiddenAnimation}
      transition={{ duration: isVisible ? 0.52 : 0.62, ease: [0.22, 1, 0.36, 1] }}
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
              isFocused={offset === 0}
              onFocusedHover={setIsFocusedHovered}
              onFocusedWheel={handleWheelNavigation}
            />
          ))}
        </div>

        <motion.div
          className="hero-slider-controls"
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={isVisible && !isFocusedHovered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ pointerEvents: isFocusedHovered ? "none" : "auto" }}
        >
          <button type="button" className="hero-slider-arrow" onClick={prev} aria-label="Previous project" disabled={!hasPrev}>
            <ChevronUp size={18} />
          </button>
          <button type="button" className="hero-slider-arrow" onClick={next} aria-label="Next project" disabled={!hasNext}>
            <ChevronDown size={18} />
          </button>
        </motion.div>

        <motion.div
          className="hero-slider-wheel-hint"
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={isVisible && isFocusedHovered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 8, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="wheel-hint-mouse" aria-hidden="true">
            <span className="wheel-hint-dot" />
          </span>
        </motion.div>

        <motion.div
          className="hero-slider-title"
          initial={{ opacity: 0, x: 26 }}
          animate={showTitle ? { opacity: 1, x: 0 } : { opacity: 0, x: 32 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          {focusedProject?.[lang].title}
        </motion.div>
      </div>
    </motion.section>
  );
}
