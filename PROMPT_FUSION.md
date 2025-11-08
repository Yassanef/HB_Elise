# 🎯 PROMPT POUR FUSION LETTRE D'AMOUR + DIAPORAMA

## 📦 SETUP TECHNIQUE EXISTANT

**Stack installée :**
- ✅ React 18 (via CDN dans `ressources/diaporama.html`)
- ✅ Framer Motion 10.16.3 (via CDN)
- ✅ Tailwind CSS 3.4.14 (build avec `npm run build:css`)
- ✅ Babel CLI (pour compiler JSX → JS)

**Configuration Tailwind (`tailwind.config.js`) :**
```javascript
content: ["./index.html", "./final.html", "./ressources/**/*.{html,js,jsx}", "./src/**/*.{js,jsx,ts,tsx}"]
theme.extend.colors: { blush, lilac, rosewood, petal }
```

**Build scripts disponibles :**
```bash
npm run build:css    # Compile src/tailwind.css → dist/tailwind.css
npm run build:js     # Compile src/*.jsx → dist/*.js
npm run build        # Les deux
```

**Ressources photos :**
- 36 photos dans `ressources/photos_mims/`
- Extensions mixtes : `.jpg` (minuscule) et `.JPG` (majuscule)
- Nommage : `photo_01.JPG` à `photo_36.jpg`

---

## 🎯 OBJECTIF DE LA FUSION

Intégrer le diaporama photo dans `index.html` en conservant toutes les fonctionnalités existantes de la lettre d'amour interactive.

---

## 📐 SPÉCIFICATIONS PRÉCISES

### **1. Structure du contenu**

**Règle ABSOLUE :**
- **CHAQUE phrase doit être accompagnée de 2 ou 3 photos**
- **TOUTES les 36 photos doivent être utilisées EXACTEMENT UNE FOIS** (pas de réutilisation)
- **~13-14 slides au total** (1 slide = 1 phrase + 2-3 photos)

**Répartition mathématique :**
```
36 photos ÷ ~13 slides = ~2.77 photos/slide
→ Alternance de slides avec 2 ou 3 photos pour utiliser pile 36 photos
→ Exemple : 10 slides × 3 photos + 3 slides × 2 photos = 36 photos
```

**Format du tableau de contenu :**
```javascript
const slides = [
  {
    text: "Pour ma copine d'amour, Elise",
    typewriter: true,
    photos: ['photo_01.JPG', 'photo_02.jpg', 'photo_03.jpg']  // 3 photos
  },
  {
    text: "T'es vraiment la personne la plus importante...",
    typewriter: true,
    photos: ['photo_04.JPG', 'photo_05.JPG']  // 2 photos
  },
  // ... 11-12 slides supplémentaires
  {
    text: "- Yasser",
    typewriter: true,
    photos: ['photo_35.jpg', 'photo_36.jpg']  // dernières photos
  }
];
```

**IMPORTANT :** 
- Les 13 phrases actuelles de `script.js` doivent être conservées
- Chaque phrase doit être assignée à 2-3 photos (pas plus, pas moins)
- Aucune photo ne doit être utilisée deux fois

---

### **2. Architecture technique**

**Approche recommandée : React intégré dans index.html**

**Fichiers à créer/modifier :**

1. **`src/unified-app.jsx`** (nouveau fichier React)
   - Composant principal qui gère le flow phrase + photos
   - État : index du slide courant, mode auto-play, vitesse typewriter
   - Logique typewriter intégrée (ou réutilisée depuis script.js)
   - Affichage conditionnel des photos avec Framer Motion

2. **`index.html`** (modifier)
   - Charger React, ReactDOM, Framer Motion (CDN)
   - Charger `dist/tailwind.css`
   - Charger `dist/unified-app.js` (compilé depuis JSX)
   - Conserver le `<canvas id="particles">` pour les particules
   - Ajouter `<div id="root">` pour le montage React
   - Garder le bouton `#bigNextBtn` (géré par React ou JS vanilla)

3. **`script.js`** (modifier ou extraire)
   - **Option A :** Garder uniquement la logique canvas/particules
   - **Option B :** Intégrer tout dans React et supprimer script.js

4. **`styles.css`** (compléter)
   - Ajouter les styles pour les photos (si non-Tailwind)
   - Conserver les styles du bouton "Suivant", particules, etc.

5. **`package.json`** (ajouter script)
   ```json
   "scripts": {
     "build:unified": "babel ./src/unified-app.jsx --out-file ./dist/unified-app.js"
   }
   ```

---

### **3. Fonctionnalités UI/UX**

#### **Affichage d'un slide :**
```
┌─────────────────────────────────────┐
│  [Phrase en typewriter ou statique] │  ← Centré, grande typo manuscrite
│                                     │
│   ┌────┐  ┌────┐  ┌────┐          │  ← 2-3 photos alignées
│   │img │  │img │  │img │          │     avec rotation/décalage
│   └────┘  └────┘  └────┘          │
│                                     │
│   ┌─────────────┐                  │  ← Contrôles centrés
│   │ ◀ Auto ⚙ Turbo Replay Progress│
│   └─────────────┘                  │
└─────────────────────────────────────┘

[Bouton "Suivant 💖" positionné aléatoirement]
[Canvas particules en arrière-plan]
[Fond "je t'aime" animé]
```

#### **Animations photos (Framer Motion) :**
```jsx
<motion.figure
  initial={{ opacity: 0, y: 20, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: -20, scale: 0.95 }}
  transition={{ duration: 0.6, delay: index * 0.15 }}
  style={{ 
    rotate: `${Math.random() * 10 - 5}deg`,
    x: Math.random() * 20 - 10,
    y: Math.random() * 16 - 8
  }}
>
  <img src={`ressources/photos_mims/${photo}`} ... />
</motion.figure>
```

**Gestion extensions mixtes (.jpg/.JPG) :**
```jsx
<img 
  src={`ressources/photos_mims/${photo}`}
  onError={(e) => {
    if (e.target.dataset.tried) return;
    e.target.dataset.tried = "true";
    // Essayer l'autre extension
    const alt = photo.endsWith('.jpg') 
      ? photo.replace('.jpg', '.JPG')
      : photo.replace('.JPG', '.jpg');
    e.target.src = `ressources/photos_mims/${alt}`;
  }}
/>
```

---

### **4. Fonctionnalités à CONSERVER (100%)**

#### **Contrôles existants :**
- ✅ **Bouton Précédent** (`◀`) : revenir au slide précédent
- ✅ **Bouton Auto** : lecture automatique (2.8s entre slides)
- ✅ **Slider de vitesse** : ajuste la vitesse du typewriter (10-150ms)
- ✅ **Bouton Turbo** : mode ultra-rapide (× 0.01)
- ✅ **Bouton Restart** : recommence à zéro
- ✅ **Barre de progression** : visuelle + texte "5 / 13"

#### **Bouton "Suivant" volant :**
- Se repositionne aléatoirement après chaque clic
- Évite le centre (rayon de 280px autour du milieu)
- Rotation aléatoire (-6° à +6°)
- Texte : "Suivant 💖" (slides normaux) ou "Fêter 🎉" (dernier slide)
- Sur le dernier slide → redirection vers `final.html`

#### **Particules canvas :**
- Cœurs qui montent en continu (interval 1.3s)
- Explosion de cœurs + confettis sur le slide final
- Petite explosion aléatoire (35% de chance) après chaque phrase

#### **Fond animé :**
- "je t'aime" répété 30 fois en arrière-plan
- Positions aléatoires, opacité 0.16-0.40, rotations aléatoires
- Animation de pulse (18s)

#### **Navigation clavier :**
- `Enter` : avancer
- `ArrowRight` : avancer
- `ArrowLeft` : reculer

#### **Accessibilité :**
- Tous les boutons ont `aria-label`
- `aria-live="polite"` sur la zone de phrase
- `aria-pressed` sur le bouton Auto

---

### **5. Préchargement des images**

**Stratégie :**
```javascript
// Au montage du composant React
useEffect(() => {
  const allPhotos = slides.flatMap(s => s.photos);
  allPhotos.forEach(photo => {
    const img = new Image();
    img.src = `ressources/photos_mims/${photo}`;
  });
}, []);
```

---

### **6. Responsive Design**

**Mobile (< 640px) :**
- Photos empilées verticalement (1 colonne)
- Taille max : 70vw
- Contrôles en colonne

**Tablet (640px - 1024px) :**
- Photos sur 2 colonnes si 3 photos
- Contrôles en ligne compacte

**Desktop (> 1024px) :**
- Photos en ligne (flex-row)
- Contrôles espacés

---

### **7. Style Tailwind à utiliser**

**Carte principale :**
```jsx
<div className="card relative w-full max-w-4xl mx-auto p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl">
```

**Phrase :**
```jsx
<h1 className="text-4xl md:text-5xl font-['Caveat'] text-rosewood/95 text-center mb-8">
  {currentSlide.text}
</h1>
```

**Container photos :**
```jsx
<div className="flex flex-wrap justify-center items-center gap-6 mt-8">
```

**Photo individuelle :**
```jsx
<figure className="relative w-64 max-w-[70vw]">
  <div className="overflow-hidden rounded-3xl border-2 border-white/80 shadow-2xl bg-white/95">
    <img className="w-full h-72 object-cover" ... />
  </div>
  {/* Ombre projetée */}
  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-white/40 blur-xl rounded-full" />
</figure>
```

---

### **8. Gestion du dernier slide**

**Comportement final :**
```javascript
if (currentIndex === slides.length - 1) {
  // Afficher "Joyeux anniversaire Elise ! 💖💖💖"
  // Déclencher explosion de particules
  // Bouton devient "Fêter 🎉"
  // Au clic → window.location.href = 'final.html'
}
```

---

### **9. Plan d'implémentation en 6 étapes**

**Étape 1 : Préparer le contenu**
- Créer le tableau `slides` avec les 13 phrases
- Répartir les 36 photos (vérifier qu'on utilise toutes une fois)
- Exemple : 10 slides × 3 photos + 3 slides × 2 photos = 36

**Étape 2 : Créer le composant React principal**
- `src/unified-app.jsx`
- État : `currentIndex`, `autoplayEnabled`, `typewriterSpeed`, `turboMode`
- Hooks : `useState`, `useEffect` (préchargement, typewriter)

**Étape 3 : Intégrer le typewriter**
- Logique de typing lettre par lettre
- Utiliser `typewriterSpeed` et `turboMultiplier`
- Afficher un curseur clignotant pendant la frappe

**Étape 4 : Afficher les photos avec Framer Motion**
- Composant `<PhotoSlide photos={currentSlide.photos} />`
- Rotations/décalages aléatoires (mais cohérents pour un slide)
- Animations d'entrée/sortie

**Étape 5 : Intégrer les contrôles + bouton volant**
- Boutons prev/next/auto/turbo/restart
- Slider de vitesse
- Barre de progression
- Bouton "Suivant" avec repositionnement aléatoire

**Étape 6 : Particules canvas + fond animé**
- Script séparé (ou intégré dans React)
- Canvas en position fixed z-index -1
- Fonction `createHeart()`, `createConfetti()`
- Fond "je t'aime" généré dynamiquement

---

### **10. Exemple de structure de fichier `slides`**

```javascript
// src/unified-app.jsx ou src/content.js

const slides = [
  {
    id: 1,
    text: "Pour ma copine d'amour, Elise",
    typewriter: true,
    photos: ['photo_01.JPG', 'photo_02.jpg', 'photo_03.jpg']
  },
  {
    id: 2,
    text: "T'es vraiment la personne la plus importante pour moi...",
    typewriter: true,
    photos: ['photo_04.JPG', 'photo_05.JPG', 'photo_06.JPG']
  },
  {
    id: 3,
    text: "T'es la premiere pensee qui me traverse la tete le matin...",
    typewriter: true,
    photos: ['photo_07.JPG', 'photo_08.JPG']  // 2 photos ici
  },
  // ... continuer jusqu'à 13 slides
  {
    id: 13,
    text: "- Yasser",
    typewriter: true,
    photos: ['photo_35.jpg', 'photo_36.jpg']
  }
];

// Vérification : slides.flatMap(s => s.photos).length === 36
```

---

## ✅ CRITÈRES DE VALIDATION

**Avant de considérer le projet terminé, vérifier :**
1. ✅ Les 13 phrases d'origine sont toutes présentes
2. ✅ Chaque phrase est accompagnée de 2 ou 3 photos
3. ✅ Les 36 photos sont utilisées exactement une fois (aucune en double, aucune oubliée)
4. ✅ Le typewriter fonctionne avec vitesse ajustable
5. ✅ Le bouton "Suivant" se déplace aléatoirement à chaque clic
6. ✅ Les particules (cœurs) apparaissent en continu
7. ✅ Le mode auto-play fonctionne
8. ✅ La barre de progression affiche "X / 13"
9. ✅ Le dernier slide redirige vers `final.html`
10. ✅ Les photos ont des rotations/décalages aléatoires
11. ✅ Les animations Framer Motion sont fluides
12. ✅ Le design est responsive (mobile/tablet/desktop)
13. ✅ Pas de console errors liés aux extensions .jpg/.JPG
14. ✅ Navigation clavier (Enter, flèches) fonctionne

---

## 🚀 COMMANDES POUR BUILD FINAL

```bash
# 1. Compiler le JSX en JS
npm run build:js

# 2. Compiler Tailwind CSS
npm run build:css

# 3. Ou les deux d'un coup
npm run build

# 4. Ouvrir index.html dans le navigateur
open index.html  # macOS
xdg-open index.html  # Linux
```

---

## 🎨 PALETTE DE COULEURS (Tailwind config)

```javascript
blush: '#FFE8F3'      // Rose très pâle
lilac: '#F3ECFF'      // Lilas pâle
rosewood: '#5A2F50'   // Violet foncé (texte)
petal: '#FFD7E8'      // Rose pétale
```

---

## 📝 NOTES IMPORTANTES

1. **Chemins des photos :**
   - Depuis `index.html` : `ressources/photos_mims/photo_XX.jpg`
   - Extensions mixtes : prévoir un fallback .jpg ↔ .JPG

2. **Police manuscrite :**
   - Déjà chargée dans index.html : Google Fonts "Caveat" et "Dancing Script"
   - Utiliser `font-['Caveat']` ou `font-['Dancing_Script']` dans Tailwind

3. **Canvas particules :**
   - Doit rester en arrière-plan (z-index: -1)
   - Ne pas bloquer les interactions avec le contenu

4. **Performance :**
   - Précharger toutes les 36 images au montage
   - Utiliser `loading="lazy"` sur les images hors viewport
   - Optimiser les animations Framer Motion (useReducedMotion)

5. **Accessibilité :**
   - Alt text sur les photos : "Souvenir à deux"
   - Aria-labels sur tous les boutons
   - Navigation clavier complète

---

## 🎯 RÉSULTAT FINAL ATTENDU

L'utilisateur ouvre `index.html` et voit :
1. **Première phrase** qui s'écrit lettre par lettre
2. **En dessous : 2-3 photos** qui apparaissent avec animation
3. **Bouton "Suivant 💖"** qui se déplace aléatoirement
4. **Particules de cœurs** qui montent doucement en arrière-plan
5. **Fond avec "je t'aime"** en filigrane animé
6. **Contrôles en bas** : prev, auto, vitesse, turbo, restart, progression
7. Clic sur "Suivant" → **transition fluide** vers la phrase + photos suivantes
8. Après 13 slides → **message final** + explosion de particules + redirection vers `final.html`

---

## 💬 MODÈLE RECOMMANDÉ

**Claude 3.5 Sonnet (nouveau)** ✅

**Raisons :**
- Excellent pour React + Framer Motion + Tailwind
- Comprend les architectures UI complexes
- Gère bien la logique d'état (slides, typewriter, animations)
- Créatif sur les transitions/animations
- Attention aux détails (fallback .jpg/.JPG, préchargement, responsive)

---

## 📋 CHECKLIST FINALE POUR LE DÉVELOPPEUR

- [ ] Créer `src/unified-app.jsx` avec le composant principal
- [ ] Répartir les 36 photos sur 13 slides (vérifier la somme)
- [ ] Modifier `index.html` pour charger React/Framer/Tailwind
- [ ] Intégrer la logique typewriter dans React
- [ ] Créer le composant `<PhotoSlide>` avec Framer Motion
- [ ] Implémenter le bouton "Suivant" volant (repositionnement aléatoire)
- [ ] Intégrer les contrôles (prev, auto, speed, turbo, restart)
- [ ] Gérer le canvas particules (cœurs + confettis)
- [ ] Générer le fond "je t'aime" dynamiquement
- [ ] Ajouter le préchargement des images
- [ ] Tester le responsive (mobile/tablet/desktop)
- [ ] Vérifier les fallbacks .jpg/.JPG
- [ ] Tester la navigation clavier
- [ ] Build final : `npm run build`
- [ ] Test complet dans le navigateur
- [ ] Commit + push sur GitHub

---

**Bon courage pour l'implémentation ! 🚀💖**
