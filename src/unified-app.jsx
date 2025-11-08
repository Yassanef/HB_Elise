/* global React, ReactDOM */

const { useState, useEffect, useMemo, useRef, useCallback, useLayoutEffect } = React;

const fallbackMotion = new Proxy(
  {},
  {
    get: (_target, tag) =>
      React.forwardRef((props, ref) => React.createElement(tag, { ref, ...props })),
  }
);

const FallbackAnimatePresence = ({ children }) => <>{children}</>;

const motionLib = typeof window !== "undefined" ? window.framerMotion : undefined;
const motion = motionLib?.motion ?? fallbackMotion;
const AnimatePresence = motionLib?.AnimatePresence ?? FallbackAnimatePresence;

const createRng = (seed = 1) => {
  let t = Math.floor((seed % 2147483647) || 1);
  return () => {
    t = (t * 48271) % 2147483647;
    return (t - 1) / 2147483646;
  };
};

const rectanglesOverlap = (a, b, buffer = 0) => {
  return !(
    a.left + a.width + buffer <= b.left ||
    b.left + b.width + buffer <= a.left ||
    a.top + a.height + buffer <= b.top ||
    b.top + b.height + buffer <= a.top
  );
};

const rawSlides = [
  { id: 1, text: "Coucou ! Je voulais t'écrire une lettre au final, mais tu connais mon écriture...", typewriter: true },
  { id: 2, text: "Donc je t'ai écrit ça ! Voilà pour toi  ^^", typewriter: true },

  { id: 3, text: "Pour ma copine d'amour, Élise 💖", typewriter: true, photos: ["photo_01.JPG", "photo_02.jpg", "photo_03.jpg"] },
  { id: 4, text: "T'es vraiment la personne la plus importante pour moi, et je suis tellement, tellement heureux de t'avoir trouvée", typewriter: true, photos: ["photo_04.JPG", "photo_05.JPG", "photo_06.JPG"] },
  { id: 5, text: "T'es la première pensée qui me traverse la tête le matin, et la dernière quand je me couche", typewriter: true, photos: ["photo_07.JPG", "photo_08.JPG", "photo_09.JPG"] },
  { id: 6, text: "Quand j'ai quelque chose de nouveau dans ma vie, c'est toujours toi la première personne à qui j'ai envie de le dire, et quand je pense à toi, j'ai ce sourire un peu bête", typewriter: true, photos: ["photo_10.JPG", "photo_11.JPG", "photo_12.JPG"] },
  { id: 7, text: "Tu me rends tellement heureux, et t'es tellement attentionnée, douce (dans tous les sens du terme) et mignonne 💗", typewriter: true, photos: ["photo_13.JPG", "photo_14.JPG", "photo_15.JPG"] },
  { id: 8, text: "Même quand on se prend la tête, tu restes toujours ma princesse d'amour, et je t'aimerai pour toujours", typewriter: true, photos: ["photo_16.jpg", "photo_17.JPG", "photo_18.JPG"] },
  { id: 9, text: "J'adore à quel point t'es motivée, déterminée (ou inflexible, ou tête dure, comme tu veux) dans ce que tu fais, et tu veux réussir, ce qui me rend fier d'être avec toi", typewriter: true, photos: ["photo_19.JPG", "photo_20.jpg", "photo_21.JPG"] },
  { id: 10, text: "Aussi parce que t'es super belle (je sais pas si je l'ai dit), et j'adore qu'on puisse rire de tout (ou presque)", typewriter: true, photos: ["photo_22.JPG", "photo_23.JPG", "photo_24.jpg"] },
  { id: 11, text: "Tu essaies même les trucs que j'aime, juste pour me faire plaisir, et tu me rends tellement heureux, je veux passer le reste de ma vie avec toi", typewriter: true, photos: ["photo_25.JPG", "photo_26.jpg", "photo_27.JPG"] },
  { id: 12, text: "Quand je te regarde, je ressens trop d'amour dans le ventre, et j'ai juste envie de t'embrasser 💘", typewriter: true, photos: ["photo_28.JPG", "photo_29.JPG", "photo_30.JPG"] },
  { id: 13, text: "T'es la meilleure copine que je pouvais rêver d'avoir, et je suis super reconnaissant pour ces 8 mois qu'on a passés ensemble", typewriter: true, photos: ["photo_31.JPG", "photo_32.JPG"] },
  { id: 14, text: "J'espère qu'il y en aura encore des dizaines d'autres, toujours avec toi, et je t'aime plus que tout 💞", typewriter: true, photos: ["photo_33.jpg", "photo_34.jpg"] },
  { id: 15, text: "- Yasser", typewriter: true, photos: ["photo_35.jpg", "photo_36.jpg"] },
];

const slides = rawSlides.map((slide, slideIndex) => ({
  ...slide,
  decoratedPhotos: (Array.isArray(slide.photos) ? slide.photos : []).map((fileName, photoIndex) => ({
    id: `${slideIndex}-${fileName}`,
    fileName,
    altFileName: fileName.endsWith(".jpg")
      ? fileName.replace(".jpg", ".JPG")
      : fileName.replace(".JPG", ".jpg"),
    rotate: Number((Math.random() * 10 - 5).toFixed(2)),
    xShift: Number((Math.random() * 20 - 10).toFixed(2)),
    yShift: Number((Math.random() * 16 - 8).toFixed(2)),
    delay: photoIndex * 0.15,
  })),
}));

const allPhotos = slides.flatMap((slide) => (Array.isArray(slide.photos) ? slide.photos : []));
const firstPhotoSlideIndex = slides.findIndex((slide) => Array.isArray(slide.photos) && slide.photos.length > 0);

const defaultParticleApi = {
  burst: () => {},
  celebrate: () => {},
  spray: () => {},
};

const HandCursor = () => {
  const cursorRef = useRef(null);
  const supportsCustomCursor = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (!window.matchMedia) return true;
    try {
      return !window.matchMedia("(pointer: coarse)").matches;
    } catch (error) {
      return true;
    }
  }, []);

  useEffect(() => {
    if (!supportsCustomCursor) {
      return undefined;
    }

  const root = document.documentElement;
  root.classList.add("custom-cursor-active", "cursor-hand");
  root.classList.remove("cursor-foot");

    const cursorEl = cursorRef.current;
    if (!cursorEl) {
      return () => {
        root.classList.remove("custom-cursor-active");
      };
    }

    let rafId = 0;
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;

    const updateTransform = (x, y) => {
      lastX = x;
      lastY = y;
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        cursorEl.style.setProperty("--cursor-x", `${lastX}px`);
        cursorEl.style.setProperty("--cursor-y", `${lastY}px`);
        rafId = 0;
      });
    };

    const show = () => {
      cursorEl.dataset.hidden = "false";
    };

    const hide = () => {
      cursorEl.dataset.hidden = "true";
    };

  const interactiveSelector = "button, a, input[type=\"range\"], .btn, .love-control-button, .big-next-btn, .photo-card, .photo-lightbox, .photo-lightbox-close";

    const updateVariant = (target) => {
      if (!target || typeof target.closest !== "function") {
        cursorEl.dataset.variant = "default";
        return;
      }
      if (target.closest && target.closest(".love-controls.is-dragging")) {
        cursorEl.dataset.variant = "dragging";
        return;
      }
      if (target.closest && target.closest(".love-controls")) {
        cursorEl.dataset.variant = "drag";
        return;
      }
      cursorEl.dataset.variant = target.closest(interactiveSelector) ? "interactive" : "default";
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return;
      show();
      updateTransform(event.clientX, event.clientY);
      updateVariant(event.target);
    };

    const handlePointerDown = (event) => {
      if (event.pointerType === "touch") return;
      cursorEl.dataset.active = "true";
    };

    const handlePointerUp = (event) => {
      if (event.pointerType === "touch") return;
      cursorEl.dataset.active = "false";
      window.requestAnimationFrame(() => {
        const element = document.elementFromPoint ? document.elementFromPoint(lastX, lastY) : null;
        updateVariant(element);
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hide();
      }
    };

    const handleMouseLeave = (event) => {
      if (!event.relatedTarget) {
        hide();
      }
    };

    updateTransform(lastX, lastY);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    window.addEventListener("blur", hide, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      root.classList.remove("custom-cursor-active", "cursor-hand");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("blur", hide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [supportsCustomCursor]);

  if (!supportsCustomCursor) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="custom-hand-cursor"
      data-hidden="true"
      data-active="false"
      data-variant="default"
      aria-hidden="true"
    />
  );
};

function useParticleEngine(canvasId = "particles") {
  const apiRef = useRef({ ...defaultParticleApi });

  useEffect(() => {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) {
      return () => {};
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return () => {};
    }

    const particles = [];
    let animationFrame = 0;
    let lastTime = performance.now();
    let running = true;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    const createHeart = (x, y) => {
      particles.push({
        type: "heart",
        x,
        y,
        vx: rand(-0.3, 0.3),
        vy: rand(-1.1, -0.4),
        life: rand(2200, 4200),
        size: rand(10, 24),
        t: 0,
        rot: rand(-0.4, 0.4),
      });
    };

    const createConfetti = (x, y) => {
      const colors = ["#ffd6e0", "#f6e7ff", "#ffe9d6", "#fef3c7", "#f7d5f0"];
      particles.push({
        type: "confetti",
        x,
        y,
        vx: rand(-0.6, 0.6),
        vy: rand(0.4, 1.2),
        life: rand(4200, 7200),
        size: rand(6, 11),
        t: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: rand(-1, 1),
      });
    };

    const tick = (ts) => {
      if (!running) return;
      const dt = ts - lastTime;
      lastTime = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.t += dt;
        const progress = p.t / p.life;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        if (p.type === "heart") {
          p.x += p.vx * (dt / 16);
          p.y += p.vy * (dt / 16);
          p.vy -= 0.002 * (dt / 16);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot + Math.sin(p.t / 200) * 0.08);
          const scale = 1 - progress * 0.35;
          ctx.scale(scale, scale);
          const size = p.size;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 150, 185, ${1 - progress})`;
          ctx.moveTo(0, -size / 6);
          ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 6, 0, size);
          ctx.bezierCurveTo(size, size / 6, size / 2, -size / 2, 0, -size / 6);
          ctx.fill();
          ctx.restore();
        } else {
          p.x += p.vx * (dt / 16);
          p.y += p.vy * (dt / 16);
          p.vy += 0.002 * (dt / 16);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot + p.t / 600);
          ctx.globalAlpha = 1 - progress * 0.6;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      }

      animationFrame = requestAnimationFrame(tick);
    };

    const baseInterval = setInterval(() => {
      createHeart(rand(40, window.innerWidth - 40), window.innerHeight + 20);
    }, 1300);

    const heartBurst = (x = window.innerWidth / 2, y = window.innerHeight / 2, count = 3) => {
      for (let i = 0; i < count; i += 1) {
        setTimeout(() => {
          createHeart(x + rand(-60, 60), y + rand(-40, 40));
        }, i * 80);
      }
    };

    const celebration = () => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      for (let i = 0; i < 60; i += 1) {
        setTimeout(() => {
          createHeart(rand(0, window.innerWidth), -rand(0, 200));
        }, i * 24);
      }
      for (let i = 0; i < 36; i += 1) {
        setTimeout(() => {
          createHeart(cx + rand(-200, 200), cy + rand(-80, 160));
        }, 800 + i * 40);
      }
      for (let i = 0; i < 70; i += 1) {
        setTimeout(() => {
          createConfetti(rand(0, window.innerWidth), rand(-60, 60));
        }, i * 60);
      }
    };

    const gentleSpray = () => {
      const cx = window.innerWidth / 2 + rand(-80, 80);
      const cy = window.innerHeight / 2 + rand(-40, 40);
      heartBurst(cx, cy, 4);
    };

    const handleResize = () => resizeCanvas();

    resizeCanvas();
    window.addEventListener("resize", handleResize, { passive: true });
    animationFrame = requestAnimationFrame(tick);

    apiRef.current.burst = heartBurst;
    apiRef.current.celebrate = celebration;
    apiRef.current.spray = gentleSpray;

    return () => {
      running = false;
      window.removeEventListener("resize", handleResize);
      clearInterval(baseInterval);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      apiRef.current = { ...defaultParticleApi };
    };
  }, [canvasId]);

  return apiRef.current;
}

function ensureLoveBackground() {
  if (typeof document === "undefined") return;
  const existing = document.querySelector(".love-bg");
  if (existing) return;
  const container = document.createElement("div");
  container.className = "love-bg";
  const frag = document.createDocumentFragment();
  const total = 30;
  for (let i = 0; i < total; i += 1) {
    const span = document.createElement("span");
    span.className = "love-word";
    span.textContent = "je t'aime";
    span.style.left = `${Math.random() * 100}%`;
    span.style.top = `${Math.random() * 100}%`;
    span.style.fontSize = `${0.85 + Math.random() * 1.35}rem`;
    span.style.opacity = (0.16 + Math.random() * 0.24).toFixed(2);
    span.style.animationDelay = `${(Math.random() * 18).toFixed(2)}s`;
    span.style.transform = `rotate(${(Math.random() * 18 - 9).toFixed(2)}deg) scale(${(0.86 + Math.random() * 0.24).toFixed(2)})`;
    frag.appendChild(span);
  }
  container.appendChild(frag);
  document.body.appendChild(container);
}

function highlightImportant(text, importantWords = []) {
  let result = text;
  importantWords.forEach((word) => {
    if (!word) return;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, "gi");
    result = result.replace(regex, '<span class="important">$1</span>');
  });
  return result.replace(/\n/g, "<br>");
}

const BigButtonState = {
  Hidden: "hidden",
  Visible: "visible",
};

const sliderMin = 10;
const sliderMax = 70;
const sliderStep = 0.25;
const autoDelay = 2800;

const PhotoStage = ({ photos, seed, onOpenLightbox }) => {
  const stageRef = useRef(null);
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);
  const [layout, setLayout] = useState({ left: [], right: [] });
  const [loadedMap, setLoadedMap] = useState({});

  const stageData = useMemo(() => {
    if (!Array.isArray(photos) || photos.length === 0) {
      return { left: [], right: [] };
    }

    const normalizedSeed = Number.isFinite(seed) ? Math.floor(seed) || Date.now() : Date.now();
    const rng = createRng(normalizedSeed);
    const shuffled = photos.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let targetCount;
    if (shuffled.length <= 1) {
      targetCount = shuffled.length;
    } else if (shuffled.length === 2) {
      targetCount = 2;
    } else {
      targetCount = rng() < 0.5 ? 2 : 3;
      targetCount = Math.min(targetCount, shuffled.length);
    }

    const selection = shuffled.slice(0, targetCount);

    const shuffleWithRng = (items) => {
      const copy = items.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    let left = [];
    let right = [];

    if (selection.length === 1) {
      left = selection.slice();
    } else if (selection.length === 2) {
      left = [selection[0]];
      right = [selection[1]];
    } else if (selection.length >= 3) {
      const twoLeft = rng() < 0.5;
      if (twoLeft) {
        left = selection.slice(0, 2);
        right = [selection[2]];
      } else {
        left = [selection[0]];
        right = selection.slice(1, 3);
      }
      for (let i = 3; i < selection.length; i += 1) {
        (rng() < 0.5 ? left : right).push(selection[i]);
      }
    }

    left = shuffleWithRng(left);
    right = shuffleWithRng(right);

    return { left, right };
  }, [photos, seed]);

  const computeLayout = useCallback(() => {
    const stageEl = stageRef.current;
    const leftZone = leftZoneRef.current;
    const rightZone = rightZoneRef.current;

    if (!stageEl || !leftZone || !rightZone) {
      return;
    }

    const stageHeight = stageEl.clientHeight;
    const leftRect = leftZone.getBoundingClientRect();
    const rightRect = rightZone.getBoundingClientRect();

    if (!stageHeight || !leftRect.height || !rightRect.height) {
      return;
    }

    const buildSideLayout = (zone, items, seedOffset, nextOrder) => {
      if (!items.length) return [];
      const zoneRect = zone.getBoundingClientRect();
      const zoneHeight = zoneRect.height;
      const zoneWidth = zoneRect.width;
      if (!zoneHeight || !zoneWidth) return [];

      const localSeed = Math.floor((Number.isFinite(seed) ? seed : Date.now()) + seedOffset * 917);
      const localRng = createRng(localSeed);

      const margin = Math.max(22, zoneHeight * 0.05);
      const slots = Math.max(1, items.length);
      const verticalRoom = Math.max(zoneHeight - margin * 2, zoneHeight * 0.62);
      const slotHeight = verticalRoom / slots;
  // Ensure card width never exceeds viewport minus some padding so images never overflow screen
  const viewportSafeMax = (typeof window !== 'undefined') ? Math.max(240, window.innerWidth - 120) : zoneWidth;
  const baseWidth = Math.min(zoneWidth, Math.max(160, Math.min(viewportSafeMax, Math.max(zoneWidth * 0.98, zoneWidth - 6))));
  const heightBySlots = Math.min(slotHeight, Math.max(160, slotHeight - margin * 0.3));
      const heightByWidth = baseWidth * 1.34;
      let cardHeight = Math.min(heightByWidth, heightBySlots);
      if (heightBySlots >= 220) {
        cardHeight = Math.max(240, cardHeight);
      } else {
        cardHeight = Math.max(180, cardHeight);
      }
      const gap = Math.max((zoneHeight - cardHeight * items.length) / (items.length + 1), margin * 0.3);
      let cursor = gap;

      return items.map((photo, index) => {
        const jitter = Math.min(gap * 0.4, 28);
        const offset = (localRng() - 0.5) * jitter;
        let top = cursor + offset;
        top = Math.max(margin * 0.35, Math.min(zoneHeight - cardHeight - margin * 0.35, top));
        cursor += cardHeight + gap;

        const order = nextOrder();
        return {
          key: `${photo.id}-${seedOffset}-${index}`,
          photo,
          top,
          width: baseWidth,
          height: cardHeight,
          rotate: (localRng() - 0.5) * 10,
          scale: 0.96 + localRng() * 0.08,
          delay: order * 0.12,
          side: seedOffset === 11 ? "left" : "right",
        };
      });
    };

    let order = 0;
    const nextOrder = () => {
      order += 1;
      return order - 1;
    };

    const leftLayout = buildSideLayout(leftZone, stageData.left, 11, nextOrder);
    const rightLayout = buildSideLayout(rightZone, stageData.right, 23, nextOrder);

    setLayout({ left: leftLayout, right: rightLayout });
  }, [stageData, seed]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    let frame;

    const schedule = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        computeLayout();
      });
    };

    schedule();

    const handleResize = () => schedule();
    window.addEventListener("resize", handleResize, { passive: true });

    let observer;
    if (window.ResizeObserver) {
      observer = new ResizeObserver(schedule);
      if (stageRef.current) observer.observe(stageRef.current);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
    };
  }, [computeLayout]);

  useEffect(() => {
    computeLayout();
  }, [computeLayout]);

  // reset loaded flags when photos change
  useEffect(() => {
    setLoadedMap({});
  }, [photos]);

  // memoized handler to mark image as loaded
  const handleImageLoad = useCallback((fileName) => {
    if (!fileName) return;
    setLoadedMap((m) => (m[fileName] ? m : { ...m, [fileName]: true }));
  }, []);

  return (
    <div ref={stageRef} className="photo-stage" aria-hidden="true">
      <div ref={leftZoneRef} className="photo-zone photo-zone-left">
        <AnimatePresence>
          {layout.left.map((item) => (
            <motion.figure
              key={item.key}
              className="photo-card"
              style={{
                width: `${item.width}px`,
                height: `${item.height}px`,
                top: `${item.top}px`,
                left: "50%",
                marginLeft: `${-item.width / 2}px`,
              }}
              initial={{ opacity: 0, x: -64, y: 28, scale: item.scale * 0.82, rotate: item.rotate - 6 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: item.scale, rotate: item.rotate }}
              exit={{ opacity: 0, x: -46, y: -24, scale: item.scale * 0.88, rotate: item.rotate - 4 }}
              transition={{ type: "spring", stiffness: 120, damping: 18, delay: item.delay }}
              onDoubleClick={(e) => { e.stopPropagation(); onOpenLightbox?.(item.photo); }}
              title="Double-clique pour agrandir"
            >
              <div className="photo-frame">
                <motion.img
                  src={`ressources/photos_mims/${item.photo.fileName}`}
                  alt="Souvenir a deux"
                  loading={item.delay === 0 ? 'eager' : 'lazy'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: loadedMap[item.photo.fileName] ? 1 : 0 }}
                  transition={{ duration: 0.46, ease: 'easeOut', delay: item.delay }}
                  onLoad={() => handleImageLoad(item.photo.fileName)}
                  onDoubleClick={(e) => { e.stopPropagation(); onOpenLightbox?.(item.photo); }}
                  onError={(event) => {
                    if (event.target.dataset.altTried) return;
                    event.target.dataset.altTried = "true";
                    event.target.src = `ressources/photos_mims/${item.photo.altFileName}`;
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <span className="photo-glow" aria-hidden="true" />
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>

      <div ref={rightZoneRef} className="photo-zone photo-zone-right">
        <AnimatePresence>
          {layout.right.map((item) => (
            <motion.figure
              key={item.key}
              className="photo-card"
              style={{
                width: `${item.width}px`,
                height: `${item.height}px`,
                top: `${item.top}px`,
                left: "50%",
                marginLeft: `${-item.width / 2}px`,
              }}
              initial={{ opacity: 0, x: 64, y: 28, scale: item.scale * 0.82, rotate: item.rotate + 6 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: item.scale, rotate: item.rotate }}
              exit={{ opacity: 0, x: 46, y: -24, scale: item.scale * 0.88, rotate: item.rotate + 4 }}
              transition={{ type: "spring", stiffness: 120, damping: 18, delay: item.delay }}
              onDoubleClick={(e) => { e.stopPropagation(); onOpenLightbox?.(item.photo); }}
              title="Double-clique pour agrandir"
            >
              <div className="photo-frame">
                <motion.img
                  src={`ressources/photos_mims/${item.photo.fileName}`}
                  alt="Souvenir a deux"
                  loading={item.delay === 0 ? 'eager' : 'lazy'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: loadedMap[item.photo.fileName] ? 1 : 0 }}
                  transition={{ duration: 0.46, ease: 'easeOut', delay: item.delay }}
                  onLoad={() => handleImageLoad(item.photo.fileName)}
                  onDoubleClick={(e) => { e.stopPropagation(); onOpenLightbox?.(item.photo); }}
                  onError={(event) => {
                    if (event.target.dataset.altTried) return;
                    event.target.dataset.altTried = "true";
                    event.target.src = `ressources/photos_mims/${item.photo.altFileName}`;
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <span className="photo-glow" aria-hidden="true" />
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const UnifiedLoveApp = () => {
  const defaultTypewriterSpeed = 31;
  const initialSliderValue = Math.min(sliderMax, Math.max(sliderMin, sliderMin + sliderMax - defaultTypewriterSpeed));
  const initialTypewriterSpeed = Math.max(sliderMin, sliderMax + sliderMin - initialSliderValue);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState(slides[0].typewriter ? "" : slides[0].text);
  const [isTyping, setIsTyping] = useState(slides[0].typewriter);
  const [slideReady, setSlideReady] = useState(!slides[0].typewriter);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [turboEnabled, setTurboEnabled] = useState(false);
  const [typewriterSpeed, setTypewriterSpeed] = useState(initialTypewriterSpeed);
  const [speedSliderValue, setSpeedSliderValue] = useState(initialSliderValue);
  const [buttonState, setButtonState] = useState(BigButtonState.Hidden);
  const [buttonStyles, setButtonStyles] = useState({ left: "50%", top: "auto", bottom: "24px", right: "auto", "--rot": "0deg" });
  const [uiVisible, setUiVisible] = useState(true);
  const [decorSeed, setDecorSeed] = useState(0);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [controlPosition, setControlPosition] = useState(null);
  const [controlsDragging, setControlsDragging] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [audioReplayKey, setAudioReplayKey] = useState(0);

  const autoTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingRunRef = useRef(0);
  const finalCelebrationRef = useRef(false);
  const preloadedPhotosRef = useRef(false);
  const floatingButtonRef = useRef(null);
  const controlsRef = useRef(null);
  const transitionTimersRef = useRef([]);
  const transitionActiveRef = useRef(false);
  const pendingRevealRef = useRef(null);
  const volumeRef = useRef(volume);
  const audioBankRef = useRef({});
  const activeAudioRef = useRef(null);
  const pendingAudioRef = useRef(null);
  const particles = useParticleEngine();
  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex];
  const currentSlideId = currentSlide?.id;
  const isFinalSlide = currentIndex === totalSlides - 1;
  const baseSlideSeed = useMemo(() => Math.random() * 1e9, [currentSlide.id]);
  const stageSeed = useMemo(() => Math.floor(baseSlideSeed + decorSeed * 9973), [baseSlideSeed, decorSeed]);
  const fadeDuration = 320;

  const stopActiveAudio = useCallback(() => {
    const active = activeAudioRef.current;
    if (active) {
      try {
        active.pause();
        active.currentTime = 0;
      } catch (error) {
        // ignore audio stop errors
      }
      if (pendingAudioRef.current === active) {
        pendingAudioRef.current = null;
      }
      activeAudioRef.current = null;
    }
  }, []);

  useEffect(() => {
    volumeRef.current = volume;
    Object.values(audioBankRef.current).forEach((audio) => {
      if (audio) {
        audio.volume = volume;
      }
    });
  }, [volume]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const map = {};
    slides.forEach((slide) => {
      const audio = new Audio(`ressources/Voc/${slide.id}.m4a`);
      audio.preload = "auto";
      audio.volume = volumeRef.current;
      map[slide.id] = audio;
    });
    audioBankRef.current = map;

    return () => {
      Object.values(audioBankRef.current).forEach((audio) => {
        if (!audio) return;
        try {
          audio.pause();
          audio.currentTime = 0;
          audio.src = "";
          audio.removeAttribute("src");
        } catch (error) {
          // ignore cleanup errors
        }
      });
      audioBankRef.current = {};
      activeAudioRef.current = null;
      pendingAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const resumePending = () => {
      const pending = pendingAudioRef.current;
      if (pending) {
        pending.currentTime = 0;
        pending.volume = volumeRef.current;
        const attempt = pending.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(() => {});
        }
        pendingAudioRef.current = null;
      }
    };

    window.addEventListener("pointerdown", resumePending);
    window.addEventListener("keydown", resumePending);

    return () => {
      window.removeEventListener("pointerdown", resumePending);
      window.removeEventListener("keydown", resumePending);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!currentSlideId) return undefined;

    const audios = audioBankRef.current;
    const nextAudio = audios ? audios[currentSlideId] : undefined;
    const previousAudio = activeAudioRef.current;

    if (previousAudio && previousAudio !== nextAudio) {
      previousAudio.pause();
      previousAudio.currentTime = 0;
      if (pendingAudioRef.current === previousAudio) {
        pendingAudioRef.current = null;
      }
    }

    if (!nextAudio) {
      activeAudioRef.current = null;
      return undefined;
    }

    nextAudio.currentTime = 0;
    nextAudio.volume = volumeRef.current;

    const playPromise = nextAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch((error) => {
        if (error?.name === "NotAllowedError" || error?.name === "AbortError" || error?.name === "NotSupportedError") {
          pendingAudioRef.current = nextAudio;
        }
      });
    }

    activeAudioRef.current = nextAudio;

    return () => {
      if (pendingAudioRef.current === nextAudio) {
        pendingAudioRef.current = null;
      }
      if (activeAudioRef.current === nextAudio) {
        nextAudio.pause();
        nextAudio.currentTime = 0;
        activeAudioRef.current = null;
      }
    };
  }, [audioReplayKey, currentSlideId]);

  // Preload all photos once the user reaches the 2nd slide (index 1).
  // This starts the full preload earlier to reduce perceived latency.
  useEffect(() => {
    if (preloadedPhotosRef.current) return;
    const triggerIndex = 1; // start full preload at second slide (index 1)
    if (currentIndex >= triggerIndex) {
      preloadedPhotosRef.current = true;
      allPhotos.forEach((photo) => {
        const img = new Image();
        img.src = `ressources/photos_mims/${photo}`;
      });
    }
  }, [currentIndex]);

  // Also proactively preload current + next slide photos (if any) to reduce perceived latency
  const preloadPhoto = useCallback((fileName) => {
    if (!fileName) return;
    if (preloadedPhotosRef.current === true) return; // if we've done full preload, skip
    try {
      const img = new Image();
      img.src = `ressources/photos_mims/${fileName}`;
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // preload photos for current slide and next slide
    const slide = slides[currentIndex];
    const next = slides[Math.min(slides.length - 1, currentIndex + 1)];
    if (slide && Array.isArray(slide.photos)) {
      slide.photos.forEach(preloadPhoto);
    }
    if (next && Array.isArray(next.photos)) {
      next.photos.forEach(preloadPhoto);
    }
  }, [currentIndex, preloadPhoto]);

  const clampWithinViewport = useCallback((left, top, width, height, margin = 12) => {
    if (typeof window === "undefined") {
      return { left, top };
    }
    const viewportWidth = window.innerWidth || 0;
    const viewportHeight = window.innerHeight || 0;
    const maxLeft = Math.max(margin, viewportWidth - width - margin);
    const maxTop = Math.max(margin, viewportHeight - height - margin);
    return {
      left: Math.min(Math.max(margin, left), maxLeft),
      top: Math.min(Math.max(margin, top), maxTop),
    };
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxPhoto(null);
  }, []);

  const handleOpenLightbox = useCallback((photo) => {
    if (!photo) return;
    setLightboxPhoto({ ...photo });
  }, []);

  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current) {
      clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const clearTransitionTimers = useCallback(() => {
    transitionTimersRef.current.forEach((timer) => clearTimeout(timer));
    transitionTimersRef.current = [];
  }, []);

  useEffect(() => () => {
    clearTransitionTimers();
  }, [clearTransitionTimers]);

  const startSlideTransition = useCallback(
    (targetIndex) => {
      if (transitionActiveRef.current) return;
      const nextIndex = Math.max(0, Math.min(targetIndex, totalSlides - 1));
      if (nextIndex === currentIndex) return;

      transitionActiveRef.current = true;
      pendingRevealRef.current = nextIndex;
      clearAutoTimer();
      clearTransitionTimers();
      stopActiveAudio();
      setUiVisible(false);
      setButtonState(BigButtonState.Hidden);

      const changeTimer = setTimeout(() => {
        setCurrentIndex(nextIndex);
        setDecorSeed((value) => value + 1);
      }, fadeDuration);

      const settleTimer = setTimeout(() => {
        transitionActiveRef.current = false;
      }, fadeDuration + 60);

      transitionTimersRef.current.push(changeTimer, settleTimer);
    },
    [clearAutoTimer, clearTransitionTimers, currentIndex, fadeDuration, stopActiveAudio, totalSlides]
  );

  useEffect(() => {
    if (!lightboxPhoto || typeof window === "undefined") {
      return undefined;
    }

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    let previousOverflow;
    const doc = typeof document !== "undefined" ? document : null;
    if (doc) {
      previousOverflow = doc.body.style.overflow;
      doc.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      if (doc) {
        doc.body.style.overflow = previousOverflow ?? "";
      }
    };
  }, [lightboxPhoto, closeLightbox]);

  useEffect(() => {
    ensureLoveBackground();
  }, []);

  // NOTE: we no longer preload all images on mount. Images will be preloaded lazily
  // once the user reaches the first slide that contains photos (see effect inside component).

  useEffect(() => {
    typingRunRef.current += 1;
    const runId = typingRunRef.current;

    const clearTypingTimeout = () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };

    clearTypingTimeout();
    setSlideReady(false);

    if (!currentSlide?.typewriter) {
      setTypedText(currentSlide?.text ?? "");
      setIsTyping(false);
      setTimeout(() => setSlideReady(true), 60);
      return () => clearTypingTimeout();
    }

    setTypedText("");
    setIsTyping(true);

    let position = 0;
    const content = currentSlide.text ?? "";

    const step = () => {
      if (typingRunRef.current !== runId) return;
      if (position > content.length) {
        setTypedText(content);
        setIsTyping(false);
        setSlideReady(true);
        return;
      }
      setTypedText(content.slice(0, position));
      position += 1;
  const base = Math.max(sliderMin, typewriterSpeed);
      const multiplier = turboEnabled ? 0.01 : 1;
      const delay = Math.max(1, Math.round(base * multiplier)) + Math.floor(Math.random() * 18);
      typingTimeoutRef.current = setTimeout(step, delay);
    };

    typingTimeoutRef.current = setTimeout(step, 120);

    return () => {
      clearTypingTimeout();
    };
  }, [currentSlide, typewriterSpeed, turboEnabled]);

  useEffect(() => {
    if (!slideReady) return undefined;
    if (pendingRevealRef.current === currentIndex) {
      const timer = setTimeout(() => {
        setUiVisible(true);
        pendingRevealRef.current = null;
      }, 90);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [slideReady, currentIndex]);

  const handleNext = useCallback(() => {
    if (isTyping || transitionActiveRef.current) return;
    clearAutoTimer();
    if (currentIndex >= totalSlides - 1) {
      stopActiveAudio();
      window.location.href = "final.html";
      return;
    }
    startSlideTransition(currentIndex + 1);
  }, [isTyping, currentIndex, totalSlides, clearAutoTimer, startSlideTransition, stopActiveAudio]);

  const handlePrev = useCallback(() => {
    if (isTyping || transitionActiveRef.current) return;
    clearAutoTimer();
    pendingRevealRef.current = null;
    setUiVisible(true);
    stopActiveAudio();
    setCurrentIndex((index) => {
      const next = Math.max(0, index - 1);
      if (next !== index) {
        setDecorSeed((value) => value + 1);
      }
      return next;
    });
  }, [clearAutoTimer, isTyping, stopActiveAudio]);

  const handleRestart = useCallback(() => {
    if (transitionActiveRef.current) return;
    clearAutoTimer();
    pendingRevealRef.current = 0;
    finalCelebrationRef.current = false;
    setDecorSeed((value) => value + 1);
    setUiVisible(true);
    stopActiveAudio();
    setAudioReplayKey((value) => value + 1);
    setCurrentIndex(0);
  }, [clearAutoTimer, stopActiveAudio]);

  useEffect(() => {
    clearAutoTimer();
    if (!autoplayEnabled || !slideReady || currentIndex >= totalSlides - 1 || transitionActiveRef.current) {
      return undefined;
    }
    autoTimerRef.current = setTimeout(() => {
      handleNext();
    }, autoDelay);

    return () => {
      clearAutoTimer();
    };
  }, [autoplayEnabled, slideReady, currentIndex, totalSlides, handleNext, clearAutoTimer]);

  const repositionFloatingButton = useCallback(() => {
    const button = floatingButtonRef.current;
    if (!button || typeof window === "undefined") return;

    const margin = 48;
    const { innerWidth, innerHeight } = window;
    const rect = button.getBoundingClientRect();
    const width = rect.width || 220;
    const height = rect.height || 80;

  const controls = document.querySelector(".love-controls");
    const phraseZone = document.querySelector(".phrase-zone");
    const avoidZones = [];
    const cards = Array.from(document.querySelectorAll(".photo-card"));

    cards.forEach((card) => {
      const rectCard = card.getBoundingClientRect();
      avoidZones.push({
        left: rectCard.left - 18,
        top: rectCard.top - 18,
        right: rectCard.right + 18,
        bottom: rectCard.bottom + 18,
      });
    });

    if (controls) {
      const controlsRect = controls.getBoundingClientRect();
      avoidZones.push({
        left: controlsRect.left - 16,
        top: controlsRect.top - 20,
        right: controlsRect.right + 16,
        bottom: controlsRect.bottom + 20,
      });
    }

    const columnRanges = [];
    const columnGap = 36;

    if (phraseZone) {
      const phraseRect = phraseZone.getBoundingClientRect();
      avoidZones.push({
        left: phraseRect.left - 16,
        top: 0,
        right: phraseRect.right + 16,
        bottom: innerHeight,
      });

      const centerLeft = Math.max(margin, phraseRect.left - columnGap);
      const centerRight = Math.min(innerWidth - margin, phraseRect.right + columnGap);
      const leftEnd = Math.min(centerLeft - width, innerWidth - margin - width);
      if (leftEnd - margin > 10) {
        columnRanges.push({ start: margin, end: leftEnd });
      }

      const rightStart = Math.max(centerRight, margin);
      const rightEnd = innerWidth - margin - width;
      if (rightEnd - rightStart > 10) {
        columnRanges.push({ start: rightStart, end: rightEnd });
      }
    }

    if (!columnRanges.length) {
      const fallbackEnd = innerWidth - margin - width;
      if (fallbackEnd - margin > 10) {
        columnRanges.push({ start: margin, end: fallbackEnd });
      }
    }

    const pickColumn = () => {
      if (!columnRanges.length) return undefined;
      if (columnRanges.length === 1) return columnRanges[0];
      return columnRanges[Math.floor(Math.random() * columnRanges.length)];
    };

    const pickValueInRange = (range) => {
      if (!range) return undefined;
      const span = Math.max(0, range.end - range.start);
      const offset = span > 0 ? Math.random() * span : 0;
      return range.start + offset;
    };

    const fitsViewport = (pos) => (
      pos.left >= margin &&
      pos.top >= margin &&
      pos.right <= innerWidth - margin &&
      pos.bottom <= innerHeight - margin
    );

    const seedRange = pickColumn();
    let x = pickValueInRange(seedRange);
    if (typeof x !== "number" || Number.isNaN(x)) {
      x = Math.max(margin, innerWidth / 2 - width / 2);
    }
    let y = margin + Math.random() * Math.max(1, innerHeight - height - margin * 2);
    let attempt = 0;

    while (attempt < 90) {
      const range = pickColumn();
      const available = range ? Math.max(range.end - range.start, 0) : Math.max(1, innerWidth - width - margin * 2);
      const candidateLeft = range
        ? range.start + (available > 0 ? Math.random() * available : 0)
        : margin + Math.random() * available;
      const candidateTop = margin + Math.random() * Math.max(1, innerHeight - height - margin * 2);
      const candidate = {
        left: candidateLeft,
        top: candidateTop,
        right: candidateLeft + width,
        bottom: candidateTop + height,
      };

      const collides = avoidZones.some((zone) => !(
        candidate.right < zone.left ||
        candidate.left > zone.right ||
        candidate.bottom < zone.top ||
        candidate.top > zone.bottom
      ));

      if (!collides && fitsViewport(candidate)) {
        x = candidateLeft;
        y = candidateTop;
        break;
      }

      attempt += 1;

      if (attempt === 60 && controls) {
        const controlsRect = controls.getBoundingClientRect();
        const targetRange = range ?? columnRanges[0];
        const bestStart = targetRange ? targetRange.start : margin;
        const bestEnd = targetRange ? targetRange.end : innerWidth - margin - width;
        const clampedCenter = controlsRect.left + (controlsRect.width - width) / 2;
        x = Math.min(bestEnd, Math.max(bestStart, clampedCenter));
        y = Math.max(margin, controlsRect.top - height - 18);
      }
    }

    if (attempt >= 90) {
      const widestRange = columnRanges.reduce((acc, range) => {
        if (!acc) return range;
        return range.end - range.start > acc.end - acc.start ? range : acc;
      }, null);

      if (widestRange) {
        const center = (widestRange.start + widestRange.end) / 2;
        x = Math.min(widestRange.end, Math.max(widestRange.start, center - width / 2));
      } else {
        x = Math.max(margin, Math.min(innerWidth - margin - width, x));
      }

      if (controls) {
        const controlsRect = controls.getBoundingClientRect();
        y = Math.max(margin, controlsRect.top - height - 18);
      } else {
        y = Math.max(margin, Math.min(innerHeight - margin - height, y));
      }
    }

    const rotation = `${(Math.random() * 10 - 5).toFixed(2)}deg`;
    setButtonStyles({
      left: `${x}px`,
      top: `${y}px`,
      bottom: "auto",
      right: "auto",
      "--rot": rotation,
    });
  }, []);

  const handleControlsPointerDown = useCallback(
    (event) => {
      const controls = controlsRef.current;
      if (!controls || !uiVisible) return;
      if (!event.isPrimary || (typeof event.button === "number" && event.button !== 0)) return;
      if (event.pointerType === "pen" && event.button !== 0) return;
      if (event.target.closest("button, input, label")) return;

      const rect = controls.getBoundingClientRect();
      const dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
        width: rect.width,
        height: rect.height,
        baseLeft: rect.left,
        baseTop: rect.top,
        engaged: false,
      };

      if (controls.setPointerCapture) {
        controls.setPointerCapture(dragState.pointerId);
      }

      const updatePosition = (clientX, clientY) => {
        const nextLeft = clientX - dragState.offsetX;
        const nextTop = clientY - dragState.offsetY;
        const clamped = clampWithinViewport(nextLeft, nextTop, dragState.width, dragState.height);
        setControlPosition((prev) => {
          if (prev && Math.abs(prev.left - clamped.left) < 0.5 && Math.abs(prev.top - clamped.top) < 0.5) {
            return prev;
          }
          return clamped;
        });
      };

      const handleMove = (moveEvent) => {
        if (moveEvent.pointerId !== dragState.pointerId) return;
        const deltaX = moveEvent.clientX - dragState.startX;
        const deltaY = moveEvent.clientY - dragState.startY;
        if (!dragState.engaged) {
          if (Math.hypot(deltaX, deltaY) < 6) {
            return;
          }
          dragState.engaged = true;
          setControlsDragging(true);
          const baseClamped = clampWithinViewport(dragState.baseLeft, dragState.baseTop, dragState.width, dragState.height);
          setControlPosition((prev) => prev ?? baseClamped);
        }

        moveEvent.preventDefault();
        updatePosition(moveEvent.clientX, moveEvent.clientY);
      };

      const endDrag = (endEvent) => {
        if (endEvent.pointerId !== dragState.pointerId) return;
        if (controls.releasePointerCapture) {
          controls.releasePointerCapture(dragState.pointerId);
        }
        controls.removeEventListener("pointermove", handleMove);
        controls.removeEventListener("pointerup", endDrag);
        controls.removeEventListener("pointercancel", endDrag);

        if (dragState.engaged) {
          endEvent.preventDefault();
          setControlsDragging(false);
          setControlPosition((prev) => {
            const source = prev ?? clampWithinViewport(dragState.baseLeft, dragState.baseTop, dragState.width, dragState.height);
            const clamped = clampWithinViewport(source.left, source.top, dragState.width, dragState.height);
            if (prev && Math.abs(prev.left - clamped.left) < 0.5 && Math.abs(prev.top - clamped.top) < 0.5) {
              return prev;
            }
            return clamped;
          });
        } else {
          setControlsDragging(false);
        }
      };

      controls.addEventListener("pointermove", handleMove);
      controls.addEventListener("pointerup", endDrag);
      controls.addEventListener("pointercancel", endDrag);
    },
    [clampWithinViewport, uiVisible]
  );

  useEffect(() => {
    if (!slideReady || !uiVisible) {
      setButtonState(BigButtonState.Hidden);
      return;
    }
    repositionFloatingButton();
    setButtonState(BigButtonState.Visible);
  }, [slideReady, currentIndex, repositionFloatingButton, uiVisible, decorSeed]);

  useEffect(() => {
    const handleResize = () => {
      if (buttonState === BigButtonState.Visible && uiVisible) {
        repositionFloatingButton();
      }
      if (controlPosition) {
        const controls = controlsRef.current;
        if (controls) {
          const rect = controls.getBoundingClientRect();
          const clamped = clampWithinViewport(controlPosition.left, controlPosition.top, rect.width, rect.height);
          if (Math.abs(clamped.left - controlPosition.left) > 0.5 || Math.abs(clamped.top - controlPosition.top) > 0.5) {
            setControlPosition(clamped);
          }
        }
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [buttonState, repositionFloatingButton, uiVisible, controlPosition, clampWithinViewport]);

  useEffect(() => {
    if (!slideReady) return;
    if (isFinalSlide) {
      if (!finalCelebrationRef.current) {
        finalCelebrationRef.current = true;
        particles.celebrate();
      }
    } else {
      finalCelebrationRef.current = false;
      if (Math.random() < 0.35) {
        particles.spray();
      }
    }
  }, [slideReady, isFinalSlide, particles]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Enter" || event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNext, handlePrev]);

  const formattedText = isTyping
    ? typedText.replace(/\n/g, "<br>")
    : highlightImportant(currentSlide.text, currentSlide.important);

  const progressPercent = ((currentIndex + 1) / totalSlides) * 100;

  const onSliderChange = (event) => {
    const value = Number(event.target.value);
    setSpeedSliderValue(value);
    const computed = Math.max(sliderMin, sliderMax + sliderMin - value);
    setTypewriterSpeed(computed);
  };

  const onVolumeChange = (event) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) return;
    const clamped = Math.min(100, Math.max(0, value));
    setVolume(clamped / 100);
  };

  const displaySpeedRaw = Math.max(0.01, typewriterSpeed * (turboEnabled ? 0.01 : 1));
  const isWholeDisplayValue = Math.abs(displaySpeedRaw - Math.round(displaySpeedRaw)) < 1e-6;
  const displaySpeed = displaySpeedRaw.toLocaleString("fr-FR", {
    minimumFractionDigits: isWholeDisplayValue ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const volumeSliderValue = Math.round(Math.min(100, Math.max(0, volume * 100)));
  const displayVolume = volumeSliderValue;

  const controlsStyle = useMemo(() => {
    if (!controlPosition) {
      return undefined;
    }
    return {
      left: `${controlPosition.left}px`,
      top: `${controlPosition.top}px`,
      bottom: "auto",
      right: "auto",
      transform: "translate(0, 0)",
    };
  }, [controlPosition]);

  return (
    <div className="app-shell" aria-live="polite">
      <PhotoStage photos={currentSlide.decoratedPhotos} seed={stageSeed} onOpenLightbox={handleOpenLightbox} />

      <section className="phrase-zone" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          <motion.h1
            key={currentSlide.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="phrase"
            role="presentation"
          >
            <span dangerouslySetInnerHTML={{ __html: formattedText }} />
            {isTyping && <span className="typewriter-caret" aria-hidden="true" />}
          </motion.h1>
        </AnimatePresence>
      </section>

      <div
        ref={controlsRef}
        className={`love-controls ${uiVisible ? "is-visible" : "is-hidden"}${controlPosition ? " is-floating" : ""}${controlsDragging ? " is-dragging" : ""}`}
        role="toolbar"
        aria-label="Contrôles du diaporama"
        style={controlsStyle}
        onPointerDown={handleControlsPointerDown}
      >
        <div className="love-control-col love-button-col">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Précédent"
            className="love-control-button love-circle"
            disabled={currentIndex === 0 || isTyping}
          >
            ◀
          </button>
        </div>

        <div className="love-control-col love-button-col">
          <button
            type="button"
            onClick={() => {
              const nextState = !autoplayEnabled;
              setAutoplayEnabled(nextState);
              if (!nextState) {
                clearAutoTimer();
              }
            }}
            aria-label="Lecture automatique"
            aria-pressed={autoplayEnabled}
            className={`love-control-button${autoplayEnabled ? " is-active" : ""}`}
          >
            Auto
          </button>
        </div>

        <div className="love-control-col love-slider-col">
          <input
            id="speedRange"
            type="range"
            min={sliderMin}
            max={sliderMax}
            value={speedSliderValue}
            step={sliderStep}
            onChange={onSliderChange}
            aria-label="Vitesse de la machine à écrire"
            className="love-speed-slider"
          />
          <label htmlFor="speedRange" className="love-control-cap">
            Vitesse ({displaySpeed} ms)
          </label>
        </div>

        <div className="love-control-col love-slider-col">
          <input
            id="volumeRange"
            type="range"
            min={0}
            max={100}
            value={volumeSliderValue}
            step={1}
            onChange={onVolumeChange}
            aria-label="Volume du message audio"
            className="love-speed-slider love-volume-slider"
          />
          <label htmlFor="volumeRange" className="love-control-cap">
            Volume ({displayVolume}%)
          </label>
        </div>

        <div className="love-control-col love-button-col">
          <button
            type="button"
            onClick={() => setTurboEnabled((value) => !value)}
            aria-label="Mode turbo"
            aria-pressed={turboEnabled}
            className={`love-control-button${turboEnabled ? " is-active" : ""}`}
          >
            Turbo
          </button>
        </div>

        <div className="love-control-col love-button-col">
          <button
            type="button"
            onClick={handleRestart}
            aria-label="Recommencer"
            className="love-control-button"
          >
            Replay
          </button>
        </div>

        <div className="love-control-col love-progress-col">
          <div className="love-progress-wrap">
            <div className="love-progress">
              <div className="love-progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
            <span id="progressText" className="love-progress-text" aria-live="polite">
              {currentIndex + 1} / {totalSlides}
            </span>
          </div>
        </div>
      </div>

      <footer className="signature">made with 💖 by Yasser</footer>

      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            className="photo-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Photo agrandie"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={closeLightbox}
            onDoubleClick={closeLightbox}
          >
            <motion.figure
              className="photo-lightbox-inner"
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -30 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" className="photo-lightbox-close" onClick={closeLightbox} aria-label="Fermer la photo agrandie">
                ×
              </button>
              <div className="photo-lightbox-media">
                <img
                  src={`ressources/photos_mims/${lightboxPhoto.fileName}`}
                  alt="Souvenir agrandi"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                  onError={(event) => {
                    if (event.target.dataset.altTried) return;
                    event.target.dataset.altTried = "true";
                    event.target.src = `ressources/photos_mims/${lightboxPhoto.altFileName}`;
                  }}
                />
              </div>
              <figcaption className="photo-lightbox-caption">
                <strong>Souvenir agrandi</strong>
                <span className="photo-lightbox-hint">Double-clique ou tape en dehors pour fermer</span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        ref={floatingButtonRef}
        style={{ ...buttonStyles }}
        className={`big-next-btn ${isFinalSlide ? "final-mode" : ""} ${uiVisible && buttonState === BigButtonState.Visible ? "is-visible" : "is-hidden"}`}
        onClick={() => {
          if (isFinalSlide) {
            stopActiveAudio();
            window.location.href = "final.html";
            return;
          }
          handleNext();
          particles.burst();
        }}
      >
        {isFinalSlide ? "Fêter 🎉" : "Suivant 💖"}
      </button>

      <HandCursor />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<UnifiedLoveApp />);
