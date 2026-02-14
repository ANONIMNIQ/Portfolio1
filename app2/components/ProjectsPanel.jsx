"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import Magnet from "./Magnet";

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] } },
};

export default function ProjectsPanel({ projects, onOpenProject, setShowProjects, isModalOpen, isContactOpen, lang, text, onOpenContact, onThemeChange, isSmallViewport = false }) {
  return (
    <motion.section
      className="content"
      aria-label="Portfolio content"
      initial={{ x: "100%" }}
      animate={{ x: isModalOpen || isContactOpen ? "100%" : 0, opacity: isModalOpen || isContactOpen ? 0 : 1 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div className="content-inner" variants={listVariants} initial="hidden" animate="show">
        <motion.div className="top-row" variants={itemVariants}>
          <span className="kicker">{text.portfolioYear}</span>
          <span className="date">{text.brand}</span>
        </motion.div>
        <motion.h1 variants={itemVariants}>{text.heroTitle}</motion.h1>
        <motion.div className="meta" variants={itemVariants}>
          {text.meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </motion.div>
        <motion.div className="divider" variants={itemVariants} />

        <motion.article className="note" variants={itemVariants}>
          <p>{text.note}</p>
          <button className="link" onClick={onOpenContact}>
            {text.startProject}
          </button>
        </motion.article>

        <motion.div className="emotion" variants={itemVariants}>
          <span className="tag">{text.selectedProjects}</span>
        </motion.div>

        <div className="project-list">
          {projects.map((project, idx) => (
            <motion.button
              key={project.id}
              className="project-card"
              data-theme={project.theme}
              type="button"
              onClick={() => onOpenProject(project)}
              onMouseEnter={() => onThemeChange(project.theme)}
              variants={itemVariants}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1], delay: 0.2 + idx * 0.05 }}
            >
              <div className="project-info">
                <h2>{project[lang].title}</h2>
                <p>{project[lang].subtitle}</p>
                <div className="project-action">
                  <span className="arrow">↳</span>
                  <span className="text">{text.fullView}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.footer className="content-footer" variants={itemVariants}>
          <span>{text.copyright}</span>
        </motion.footer>
      </motion.div>

      {!isSmallViewport && (
        <motion.div className="content-close-wrap" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { delay: 0.8, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } }}>
          <Magnet strength={0.3}>
            <button className="content-close" type="button" aria-label="Hide projects" onClick={() => setShowProjects(false)}>
              <X size={20} />
            </button>
          </Magnet>
        </motion.div>
      )}
    </motion.section>
  );
}
