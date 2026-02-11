const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.2 }
);

const revealItems = document.querySelectorAll(".reveal");
revealItems.forEach((item) => revealObserver.observe(item));

const canvas = document.getElementById("webgl-canvas");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const modal = document.querySelector(".modal");
const modalBackdrop = document.querySelector(".modal-backdrop");
const modalClose = document.querySelector(".modal-close");
const modalCard = document.querySelector(".modal-card");
const modalMedia = document.querySelector(".modal-media");
const modalTitle = document.querySelector(".modal-title");
const modalTags = document.querySelector(".modal-tags");
const modalDesc = document.querySelector(".modal-desc");

const projectCards = document.querySelectorAll(".project-card");
const themes = ["one", "two", "three"];

const openModal = (card) => {
  if (!modal) return;
  const { title, desc, tags, image } = card.dataset;
  const index = Array.from(projectCards).indexOf(card);

  modalTitle.textContent = title || "";
  modalDesc.textContent = desc || "";
  modalTags.textContent = tags || "";

  if (modalCard) {
    const rect = card.getBoundingClientRect();
    const originX = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const originY = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    modalCard.style.setProperty("--origin-x", `${originX}%`);
    modalCard.style.setProperty("--origin-y", `${originY}%`);
  }

  if (image) {
    modalMedia.style.backgroundImage = `url('${image}')`;
    modalMedia.style.backgroundSize = "cover";
    modalMedia.style.backgroundPosition = "center";
  } else {
    modalMedia.style.backgroundImage = "";
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.body.style.overflow = "hidden";
  document.body.dataset.theme = themes[index] || "one";
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  document.body.style.overflow = "";
  document.body.dataset.theme = "";
};

projectCards.forEach((card) => {
  card.addEventListener("click", () => openModal(card));
  card.addEventListener("mouseenter", () => {
    const index = Array.from(projectCards).indexOf(card);
    document.body.dataset.theme = themes[index] || "one";
  });
  card.addEventListener("mouseleave", () => {
    if (!modal.classList.contains("is-open")) {
      document.body.dataset.theme = "";
    }
  });
});

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", closeModal);
}

if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

if (canvas && window.THREE) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_intensity: { value: prefersReducedMotion ? 0.2 : 1.0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_intensity;
      varying vec2 vUv;

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;
        vec2 p = uv * 2.0 - 1.0;
        float r = length(p);

        vec3 deep = vec3(0.05, 0.05, 0.09);
        vec3 magenta = vec3(0.62, 0.16, 0.27);
        vec3 violet = vec3(0.38, 0.18, 0.46);

        float t = u_time * 0.06;
        float wave = sin((uv.y + t) * 6.283) * 0.08;
        float mix1 = smoothstep(0.1, 0.9, uv.x + wave * 0.6);
        float mix2 = smoothstep(0.1, 0.9, 1.0 - uv.y + wave);

        vec3 color = mix(deep, magenta, mix1);
        color = mix(color, violet, mix2 * 0.8);

        float grain = noise(uv * (u_resolution / 120.0) + t) - 0.5;
        color += grain * 0.18 * u_intensity;

        float vignette = smoothstep(1.2, 0.25, r);
        gl_FragColor = vec4(color, 1.0) * vignette;
      }
    `,
    transparent: true,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(mesh);

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    uniforms.u_resolution.value.set(width, height);
  };

  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();

  const animate = () => {
    if (!prefersReducedMotion) {
      uniforms.u_time.value = clock.getElapsedTime();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
}
