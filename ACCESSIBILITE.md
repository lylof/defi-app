# Accessibilité de l'application LPT Défis

## Sommaire
1. [Introduction](#introduction)
2. [Améliorations implémentées](#améliorations-implémentées)
3. [Bonnes pratiques à maintenir](#bonnes-pratiques-à-maintenir)
4. [Prochaines étapes](#prochaines-étapes)
5. [Ressources](#ressources)

## Introduction

Ce document présente les mesures prises pour rendre l'application LPT Défis accessible conformément aux normes WCAG 2.1 (Web Content Accessibility Guidelines) niveau AA. L'accessibilité numérique est essentielle pour garantir que tous les utilisateurs, y compris les personnes en situation de handicap, puissent naviguer, comprendre et interagir avec notre application.

## Améliorations implémentées

### 1. Structure sémantique renforcée

- **Composants principaux** : Utilisation appropriée des éléments sémantiques (`section`, `region`, `heading`) pour structurer le contenu
- **Cartes de défis** : Attributs `role="region"` et `aria-labelledby` pour associer correctement les titres aux contenus
- **Formulaires** : Structure optimisée avec `fieldset`, `legend` et attributs `aria-describedby` pour les messages d'erreur

### 2. Navigation au clavier

- **Focus visibles** : Styles de focus améliorés et cohérents sur tous les éléments interactifs
- **Ordre logique** : Séquence de tabulation naturelle suivant la structure visuelle des pages
- **Raccourcis** : Ajout d'attributs `tabIndex` stratégiques pour les sections importantes
- **Skip links** : Liens d'évitement pour accéder directement au contenu principal

### 3. Attributs ARIA

- **Libellés explicites** : Attributs `aria-label` pour les boutons et contrôles sans texte visible
- **États dynamiques** : Attributs `aria-pressed`, `aria-expanded`, `aria-selected` pour indiquer les états des composants
- **Régions importantes** : Attributs `role` appropriés pour les tableaux, barres de progression et widgets interactifs
- **Notifications** : Système d'annonces pour les changements d'état importants avec `aria-live`

### 4. Support des lecteurs d'écran

- **Textes alternatifs** : Attributs `alt` descriptifs pour toutes les images et visuels informatifs
- **Contenus cachés** : Classes `.sr-only` pour fournir des informations additionnelles aux lecteurs d'écran
- **Icônes décoratives** : Attribut `aria-hidden="true"` pour les éléments purement décoratifs
- **Landmarks** : Balisage des sections principales avec les rôles de régions appropriés

### 5. Formulaires accessibles

- **Étiquettes explicites** : Association claire entre les champs et leurs étiquettes avec `htmlFor`
- **Validation** : Messages d'erreur liés aux champs correspondants avec `aria-describedby`
- **Instructions** : Indications sur le format attendu et les champs obligatoires
- **Rétroaction visuelle** : Indication claire des champs valides, invalides et en cours de saisie

## Bonnes pratiques à maintenir

### Structure et sémantique

- Utiliser les éléments HTML5 sémantiques appropriés (`<nav>`, `<main>`, `<section>`, `<article>`)
- Maintenir une hiérarchie logique des titres (`<h1>` à `<h6>`)
- Éviter de réutiliser des composants UI pour des fonctions différentes de celles pour lesquelles ils ont été conçus

### Navigation et interactions

- S'assurer que tous les éléments interactifs sont accessibles au clavier
- Maintenir un ordre de tabulation logique et prévisible
- Fournir un feedback visuel et sonore pour les actions importantes
- Permettre l'arrêt ou la pause des animations et des transitions
- Éviter les actions déclenchées uniquement par le survol ou des gestes complexes

### Contenu visuel et design

- Maintenir un contraste suffisant entre le texte et l'arrière-plan (4.5:1 pour le texte normal, 3:1 pour le grand texte)
- Ne pas utiliser la couleur comme seul moyen de transmettre une information
- S'assurer que tous les textes peuvent être agrandis jusqu'à 200% sans perte de fonctionnalité
- Concevoir une interface réactive qui s'adapte à différentes tailles d'écran et orientations

### Formulaires et saisie

- Étiqueter clairement tous les champs de formulaire
- Fournir des messages d'erreur précis et des suggestions de correction
- Permettre la vérification et la confirmation des données avant soumission finale
- Éviter les délais d'expiration automatiques ou prévoir des extensions

## Prochaines étapes

1. **Audit complet** : Réaliser un audit d'accessibilité approfondi avec des outils automatisés et des tests manuels
2. **Tests utilisateurs** : Organiser des sessions de test avec des utilisateurs en situation de handicap
3. **Documentation** : Compléter la documentation d'accessibilité avec des exemples spécifiques
4. **Formation** : Former l'équipe de développement aux bonnes pratiques d'accessibilité
5. **Automatisation** : Intégrer des tests d'accessibilité dans le pipeline CI/CD

## Ressources

### Outils d'évaluation
- [Axe DevTools](https://www.deque.com/axe/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [Lighthouse (Google)](https://developers.google.com/web/tools/lighthouse)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### Documentation
- [Web Content Accessibility Guidelines (WCAG) 2.1](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [MDN Web Docs: Accessibilité](https://developer.mozilla.org/fr/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)

### Références spécifiques à Next.js
- [Guide d'accessibilité pour Next.js](https://nextjs.org/docs/app/building-your-application/routing/accessibility)
- [Testing Library pour React](https://testing-library.com/docs/react-testing-library/intro/)
- [Utilisation de next/image avec des attributs alt](https://nextjs.org/docs/app/api-reference/components/image) 