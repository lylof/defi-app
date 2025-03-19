# Guide d'implémentation pour l'accessibilité

Ce guide explique comment utiliser les composants et utilitaires d'accessibilité fournis pour créer des interfaces accessibles dans l'application LPT Défis.

## Table des matières

1. [Principes fondamentaux](#principes-fondamentaux)
2. [Composants accessibles](#composants-accessibles)
3. [Formulaires accessibles](#formulaires-accessibles)
4. [Images et icônes](#images-et-icônes)
5. [Navigation au clavier](#navigation-au-clavier)
6. [Tests d'accessibilité](#tests-daccessibilité)

## Principes fondamentaux

Pour assurer l'accessibilité de l'application, suivez ces principes fondamentaux :

- Utilisez des éléments HTML sémantiques appropriés
- Ajoutez des attributs ARIA lorsque nécessaire, mais préférez la sémantique HTML native
- Assurez-vous que tous les éléments interactifs sont accessibles au clavier
- Fournissez des textes alternatifs pour tous les contenus non textuels
- Maintenez un contraste suffisant entre le texte et l'arrière-plan

## Composants accessibles

### AccessibleIcon

Ce composant permet de rendre les icônes et SVG accessibles en ajoutant automatiquement les attributs ARIA appropriés.

```tsx
import { AccessibleIcon } from "@/lib/utils/accessibility";
import { Clock } from "lucide-react";

// Pour une icône décorative (masquée des lecteurs d'écran)
<AccessibleIcon>
  <Clock className="h-4 w-4" />
</AccessibleIcon>

// Pour une icône informative (annoncée par les lecteurs d'écran)
<AccessibleIcon decorative={false} label="Temps restant: 2 heures">
  <Clock className="h-4 w-4" />
</AccessibleIcon>
```

### AccessibleSvg

Ce composant permet de rendre les SVG accessibles en ajoutant automatiquement les attributs ARIA et les balises `<title>` et `<desc>`.

```tsx
import { AccessibleSvg } from "@/lib/utils/accessibility";

// Pour un SVG décoratif
<AccessibleSvg className="h-5 w-5 text-yellow-500">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
</AccessibleSvg>

// Pour un SVG informatif
<AccessibleSvg 
  decorative={false}
  title="Étoile d'or" 
  description="Indique que l'utilisateur a atteint le niveau or"
  className="h-5 w-5 text-yellow-500"
>
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
</AccessibleSvg>
```

## Formulaires accessibles

### AccessibleFormField

Ce composant facilite la création de champs de formulaire accessibles en combinant le label, le champ et les messages d'erreur avec les attributs ARIA appropriés.

```tsx
import { AccessibleFormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

<AccessibleFormField
  id="email"
  label="Adresse email"
  description="Nous ne partagerons jamais votre email avec des tiers."
  error={errors.email?.message}
  required
>
  <Input type="email" placeholder="vous@exemple.fr" />
</AccessibleFormField>
```

### Attributs ARIA pour les formulaires

Pour les cas où vous ne pouvez pas utiliser `AccessibleFormField`, utilisez l'utilitaire `getAriaAttributes` :

```tsx
import { getAriaAttributes } from "@/lib/utils/accessibility";

const ariaAttrs = getAriaAttributes({
  isRequired: true, 
  hasError: !!error,
  errorId: "email-error",
  descriptionId: "email-description"
});

<Input
  id="email"
  type="email"
  {...ariaAttrs}
/>
```

## Images et icônes

### Images informatives

Pour les images qui transmettent des informations importantes, utilisez toujours un attribut `alt` descriptif :

```tsx
<Image 
  src="/images/graphique-progression.png" 
  alt="Graphique montrant une progression de 70% sur les défis de la semaine" 
  width={400} 
  height={300} 
/>
```

### Images décoratives

Pour les images purement décoratives, utilisez un attribut `alt` vide et `aria-hidden="true"` :

```tsx
<Image 
  src="/images/decoration.png" 
  alt="" 
  aria-hidden="true"
  width={400} 
  height={300} 
/>
```

## Navigation au clavier

### SkipLink

Utilisez le composant `SkipLink` dans vos layouts pour permettre aux utilisateurs de clavier de sauter directement au contenu principal :

```tsx
import { SkipLink } from "@/components/ui/skip-link";

<>
  <SkipLink />
  <header>...</header>
  <main id="main-content">
    {/* Contenu principal */}
  </main>
</>
```

### Ordre de tabulation

Assurez-vous que l'ordre de tabulation est logique et prévisible. Évitez d'utiliser `tabIndex` avec des valeurs positives.

```tsx
// À éviter
<div tabIndex={1}>Premier</div>
<div tabIndex={2}>Deuxième</div>

// Préférer l'ordre naturel du DOM
<button>Premier</button>
<button>Deuxième</button>
```

## Tests d'accessibilité

### Analyseur d'accessibilité

Utilisez régulièrement l'analyseur d'accessibilité pour vérifier votre code :

```bash
# Analyser le code pour trouver des problèmes d'accessibilité
npm run a11y

# Analyser et obtenir des suggestions de correction détaillées
npm run a11y:fix
```

### Tests manuels

Testez votre application avec le clavier uniquement et avec des lecteurs d'écran comme NVDA ou VoiceOver pour vous assurer qu'elle est utilisable par tous.

### Liste de vérification

Avant de soumettre votre code, vérifiez que :

- Tous les éléments interactifs sont accessibles au clavier
- Tous les éléments non textuels ont des alternatives textuelles
- Les messages d'erreur sont liés à leurs champs correspondants
- Le contraste des couleurs est suffisant
- La structure de la page est logique et utilise des éléments sémantiques
- Les animations peuvent être désactivées via `prefers-reduced-motion` 