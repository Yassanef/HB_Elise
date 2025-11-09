/* global React, ReactDOM */

const { useState, useEffect, useMemo, useRef, useCallback } = React;

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

// diaporama.html lives inside `ressources/` and images are in ./photos_mims/
// Filenames have mixed extensions (.jpg/.JPG). We'll store base names and handle extension at render time.
const imageBaseNames = Array.from({ length: 36 }, (_, idx) =>
  `./photos_mims/photo_${String(idx + 1).padStart(2, "0")}`
);

const phrases = [
  "Chaque instant avec toi devient une douce évidence.",
  "Nos souvenirs sont des éclats de lumière qui ne s'éteignent jamais.",
  "Je t'aime dans chaque regard, dans chaque sourire, dans chaque souffle.",
  "Nos rires tissent des constellations dans le ciel de nos nuits.",
  "Ton sourire est le secret le mieux gardé de mon cœur.",
  "À deux, même le silence devient mélodie.",
  "Notre amour se décline en milliers de nuances pastel.",
  "Mon monde prend des couleurs quand tu es juste là.",
  "Tes yeux sont le miroir de nos plus beaux lendemains.",
  "Je t'aime à travers les saisons, le soleil et la pluie.",
  "Nos mains enlacées racontent l'histoire la plus douce.",
  "Chaque “je t'aime” murmuré est une promesse d'éternité."
];

const totalPhotos = imageBaseNames.length;

const backgroundTracks = [
  { id: 'frambosise', file: 'frambosise.m4a', title: 'Frambosise' },
  { id: 'histoire', file: 'histoire.m4a', title: 'Histoire' },
  { id: 'senora', file: 'senora.m4a', title: 'Señora' }
];

const BGM_STORAGE_KEYS = {
  last: 'bgm:lastTrack',
  volume: 'bgm:volume',
  skip: 'bgm:skipLast'
};

const resolveSongPath = (fileName) => {
  if (typeof window === 'undefined') {
    return `ressources/song/${fileName}`;
  }
  const path = window.location.pathname || '';
  if (path.includes('/ressources/')) {
    return `song/${fileName}`;
  }
  return `ressources/song/${fileName}`;
};

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildPhotoGroups() {
  const pool = shuffle(imageBaseNames);
  const groups = [];
  let cursor = 0;

  while (cursor < pool.length) {
    const remaining = pool.length - cursor;
    let groupSize;

    if (remaining === 4) {
      groupSize = 2;
    } else if (remaining === 3 || remaining === 2) {
      groupSize = remaining;
    } else {
      groupSize = Math.random() < 0.55 ? 3 : 2;
      if (remaining - groupSize === 1) {
        groupSize = groupSize === 3 ? 2 : 3;
      }
    }

    groups.push(pool.slice(cursor, cursor + groupSize));
    cursor += groupSize;
  }

  return groups;
}

function decoratePhotos(group) {
  return group.map((base, index) => ({
    id: `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    // try lowercase first, fallback to uppercase via onError handler
    src: `${base}.jpg`,
    altSrc: `${base}.JPG`,
    rotate: Number((Math.random() * 10 - 5).toFixed(2)),
    xShift: Number((Math.random() * 20 - 10).toFixed(2)),
    yShift: Number((Math.random() * 16 - 8).toFixed(2)),
    delay: index * 0.12 + 0.1,
  }));
}

function createDeck() {
  const groups = buildPhotoGroups();
  return {
    groups,
    index: 0,
  };
}

const PhotoSlide = ({ photos }) => (
  <div className="mt-6 flex flex-wrap items-center justify-center gap-7">
    {photos.map((photo) => (
      <motion.figure
        key={photo.id}
        style={{ rotate: photo.rotate, x: photo.xShift, y: photo.yShift }}
        initial={{ opacity: 0, y: 18, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.9 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: photo.delay }}
        className="relative w-60 max-w-[70vw]"
      >
        <div className="overflow-hidden rounded-[26px] border border-white/70 shadow-2xl shadow-rose-200/50 bg-white/95">
          <img
            src={photo.src}
            alt="Souvenir à deux"
            className="h-64 w-full object-cover"
            loading="lazy"
            onError={(e) => {
              if (e.target.dataset.altTried) return;
              e.target.dataset.altTried = "true";
              e.target.src = photo.altSrc;
            }}
          />
        </div>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-10 w-32 rounded-full bg-white/50 blur-xl" />
      </motion.figure>
    ))}
  </div>
);

const App = () => {
  const [deck, setDeck] = useState(createDeck);
  const [slideKey, setSlideKey] = useState(0);
  const [phraseOrder, setPhraseOrder] = useState(() => shuffle([...phrases]));
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [bgmVolume, setBgmVolume] = useState(() => {
    if (typeof window === 'undefined') return 0.6;
    try {
      const stored = window.localStorage?.getItem(BGM_STORAGE_KEYS.volume);
      if (stored !== null) {
        const parsed = Number.parseFloat(stored);
        if (Number.isFinite(parsed)) {
          return Math.min(1, Math.max(0, parsed));
        }
      }
    } catch (error) {
      /* ignore */
    }
    return 0.6;
  });
  const [bgmTrackId, setBgmTrackId] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage?.getItem(BGM_STORAGE_KEYS.last) ?? null;
    } catch (error) {
      return null;
    }
  });
  const bgmAudioRef = useRef(null);
  const pendingBgmRef = useRef(null);
  const bgmVolumeRef = useRef(bgmVolume);
  const bgmTrackIdRef = useRef(bgmTrackId);

  const selectBackgroundTrack = useCallback((options = {}) => {
    const audio = bgmAudioRef.current;
    if (!audio) {
      return null;
    }

    const { preferDifferent = false, excludeCurrent = false } = options;
    const exclusion = new Set();

    if (preferDifferent) {
      try {
        const last = window.localStorage?.getItem(BGM_STORAGE_KEYS.last);
        if (last) {
          exclusion.add(last);
        }
      } catch (error) {
        /* ignore */
      }
      if (bgmTrackIdRef.current) {
        exclusion.add(bgmTrackIdRef.current);
      }
    }

    if (excludeCurrent && bgmTrackIdRef.current) {
      exclusion.add(bgmTrackIdRef.current);
    }

    let pool = backgroundTracks.slice();
    if (pool.length > 1 && exclusion.size) {
      pool = pool.filter((track) => !exclusion.has(track.id));
      if (!pool.length) {
        pool = backgroundTracks.slice();
      }
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    if (!chosen) {
      return null;
    }

  audio.src = resolveSongPath(chosen.file);
    audio.currentTime = 0;
    audio.volume = bgmVolumeRef.current;

    const attempt = audio.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt
        .then(() => {
          pendingBgmRef.current = null;
        })
        .catch((error) => {
          if (error?.name === 'NotAllowedError' || error?.name === 'AbortError' || error?.name === 'NotSupportedError') {
            pendingBgmRef.current = audio;
          }
        });
    } else {
      pendingBgmRef.current = null;
    }

    setBgmTrackId(chosen.id);
    bgmTrackIdRef.current = chosen.id;

    try {
      window.localStorage?.setItem(BGM_STORAGE_KEYS.last, chosen.id);
    } catch (error) {
      /* ignore */
    }

    return chosen.id;
  }, [setBgmTrackId]);

  const currentGroup = deck.groups[deck.index] ?? [];
  const currentPhotos = useMemo(
    () => decoratePhotos(currentGroup),
    [deck.groups, deck.index]
  );

  const bgmTrackTitle = useMemo(() => {
    const track = backgroundTracks.find((item) => item.id === bgmTrackId);
    return track?.title ?? null;
  }, [bgmTrackId]);

  const bgmVolumePercent = Math.round(Math.min(100, Math.max(0, bgmVolume * 100)));

  const photosSeen = useMemo(() => {
    if (deck.groups.length === 0) {
      return 0;
    }
    return deck.groups.slice(0, deck.index + 1).reduce((sum, group) => sum + group.length, 0);
  }, [deck.groups, deck.index]);

  const isExhausted = deck.index >= deck.groups.length - 1 && deck.groups.length > 0;
  const displayPhrase = isExhausted
    ? "Merci d'avoir feuilleté notre boîte à tendresse."
    : phraseOrder[phraseIndex % phraseOrder.length];

  useEffect(() => {
    imageBaseNames.forEach((base) => {
      // Preload both possible casings to avoid flashes
      const img1 = new Image();
      img1.src = `${base}.jpg`;
      const img2 = new Image();
      img2.src = `${base}.JPG`;
    });
  }, []);

  useEffect(() => {
    bgmVolumeRef.current = bgmVolume;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem(BGM_STORAGE_KEYS.volume, bgmVolume.toFixed(2));
      } catch (error) {
        /* ignore */
      }
    }

    const audio = bgmAudioRef.current;
    if (audio) {
      audio.volume = bgmVolume;
    }
  }, [bgmVolume]);

  useEffect(() => {
    bgmTrackIdRef.current = bgmTrackId ?? null;
  }, [bgmTrackId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const audio = new Audio();
    audio.loop = true;
    audio.volume = bgmVolumeRef.current;
    bgmAudioRef.current = audio;

    let preferDifferent = false;
    try {
      const skip = window.sessionStorage?.getItem(BGM_STORAGE_KEYS.skip) === '1';
      if (skip) {
        preferDifferent = true;
        window.sessionStorage.removeItem(BGM_STORAGE_KEYS.skip);
      }
    } catch (error) {
      /* ignore */
    }

    selectBackgroundTrack({ preferDifferent });

    const cleanup = () => {
      pendingBgmRef.current = null;
      if (bgmAudioRef.current === audio) {
        bgmAudioRef.current = null;
      }
      audio.pause();
      audio.src = '';
    };

    const lifecycleCleanup = () => cleanup();
    window.addEventListener('pagehide', lifecycleCleanup, { once: true });
    window.addEventListener('beforeunload', lifecycleCleanup, { once: true });

    return () => {
      window.removeEventListener('pagehide', lifecycleCleanup);
      window.removeEventListener('beforeunload', lifecycleCleanup);
      cleanup();
    };
  }, [selectBackgroundTrack]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const resumePending = () => {
      const pending = pendingBgmRef.current;
      if (!pending) {
        return;
      }
      pending.volume = bgmVolumeRef.current;
      const attempt = pending.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {});
      }
      pendingBgmRef.current = null;
    };

    window.addEventListener('pointerdown', resumePending, { passive: true });
    window.addEventListener('keydown', resumePending);

    return () => {
      window.removeEventListener('pointerdown', resumePending);
      window.removeEventListener('keydown', resumePending);
    };
  }, []);

  const handleBgmVolumeChange = useCallback((event) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
      return;
    }
    const nextVolume = Math.min(1, Math.max(0, value / 100));
    setBgmVolume(nextVolume);
  }, []);

  const handleChangeTrack = useCallback(() => {
    selectBackgroundTrack({ preferDifferent: true, excludeCurrent: true });
  }, [selectBackgroundTrack]);

  const handleNext = () => {
    if (isExhausted) {
      return;
    }

    setDeck((prev) => ({
      groups: prev.groups,
      index: Math.min(prev.index + 1, prev.groups.length - 1),
    }));
    setSlideKey((key) => key + 1);
    setPhraseIndex((idx) => (idx + 1) % phraseOrder.length);
  };

  const handleRestart = () => {
    const freshDeck = createDeck();
    setDeck(freshDeck);
    setSlideKey((key) => key + 1);
    setPhraseOrder(shuffle([...phrases]));
    setPhraseIndex(0);
  };

  return (
    <main className="relative w-full max-w-5xl rounded-3xl p-6 sm:p-10 md:p-12 text-rosewood bg-white/65 backdrop-blur-xl shadow-2xl">
      <section className="glow relative">
        <div className="text-center">
          <p className="text-sm font-medium tracking-[0.4em] uppercase text-rose-400/80">
            Nos souvenirs
          </p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={`${phraseIndex}-${isExhausted ? "end" : "phrase"}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="mt-3 text-3xl sm:text-4xl md:text-5xl font-display text-rosewood/95"
            >
              {displayPhrase}
            </motion.h1>
          </AnimatePresence>

          <p className="mt-4 text-rosewood/70 text-sm sm:text-base">
            {photosSeen} / {totalPhotos} souvenirs dévoilés
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slideKey}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <PhotoSlide photos={currentPhotos} />
          </motion.div>
        </AnimatePresence>
      </section>

      <section className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={isExhausted}
          className="px-10 py-3 rounded-full bg-gradient-to-r from-petal to-lilac text-rosewood font-semibold shadow-lg shadow-rose-200/60 hover:shadow-xl hover:shadow-rose-200/70 transition-transform duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExhausted ? "Fin du diaporama" : "Next 💞"}
        </button>
        <button
          type="button"
          onClick={handleRestart}
          className="px-6 py-3 rounded-full border border-white/70 bg-white/70 text-rosewood font-medium shadow-sm hover:bg-white/90 transition-colors duration-200"
        >
          Rejouer
        </button>
      </section>

          <section className="mt-8 mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-3xl bg-white/70 p-5 text-center shadow-xl backdrop-blur-sm">
            <header className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400/80">
                Fond musical
              </p>
              <p className="love-bgm-track text-sm" aria-live="polite">
                {bgmTrackTitle ? `Lecture : ${bgmTrackTitle}` : "Lecture : —"}
              </p>
            </header>
            <button
              type="button"
              onClick={handleChangeTrack}
              className="love-control-button"
            >
              Changer 🎵
            </button>
            <label htmlFor="diaporamaBgmVolume" className="bgm-volume-label w-full">
              <span>Volume ({bgmVolumePercent}%)</span>
              <input
                id="diaporamaBgmVolume"
                type="range"
                min="0"
                max="100"
                step="1"
                value={bgmVolumePercent}
                onChange={handleBgmVolumeChange}
                className="love-speed-slider love-volume-slider"
                aria-label="Volume de la musique de fond"
              />
            </label>
          </section>

      {isExhausted && (
        <p className="mt-6 text-center text-sm text-rosewood/60">
          Toutes les photos ont été parcourues une fois. Clique sur “Rejouer” pour recommencer avec un nouvel ordre.
        </p>
      )}
    </main>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
