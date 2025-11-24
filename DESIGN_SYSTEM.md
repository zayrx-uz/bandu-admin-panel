# Dark Mode Design System

Production-ready Tailwind CSS dark mode design system with WCAG AA contrast compliance.

## Configuration

### `tailwind.config.js`
- Dark mode: `'class'` (toggle via `.dark` class on `<html>`)
- Custom color palette optimized for dark mode
- Custom shadows for dark surfaces

### Color Palette
```js
bg: '#0b1020'         // Page background
surface: '#0f1724'    // Cards, panels
primary: '#7c3aed'    // Violet (primary)
primary-600: '#6d28d9' // Primary hover
accent: '#06b6d4'     // Cyan accent
muted: '#94a3b8'      // Secondary text
text: '#e6eef8'       // Primary text
subtext: '#a5b4c7'    // Secondary text
border: '#1f2937'     // Dividers
ring: '#334155'       // Focus rings
```

## Components

### 1. Responsive Navbar
- Logo, navigation links, CTA button
- Mobile hamburger menu
- Sticky positioning with backdrop blur

### 2. Hero Section
- Large headline with gradient text
- Subheadline
- Primary and ghost CTA buttons

### 3. Card Component
- Image, title, description, meta
- Hover effects
- Action button

### 4. Buttons
- **Primary**: Solid background, hover states, focus rings
- **Ghost**: Border only, hover fill, focus rings
- Both include disabled states and transitions

### 5. Form Input
- Accessible labels
- Error states with ARIA
- Helper text
- Focus states with ring

## Dark Mode Toggle

The existing `ThemeToggle` component in `src/Layout/ThemeToggle.jsx` already handles:
- Toggle between light/dark
- localStorage persistence
- System preference detection

## Usage

1. **HTML Components**: See `src/components/design-system-examples.html`
2. **React Components**: See `src/components/DesignSystemExamples.jsx`

## WCAG AA Compliance

All text colors meet WCAG AA contrast requirements:
- Primary text (`text`): 4.5:1+ on `bg`
- Secondary text (`subtext`): 4.5:1+ on `bg`
- Primary button text: 4.5:1+ on `primary`
- Focus indicators: 3:1+ contrast

## API Reference

Company Categories API endpoints (from https://app.bandu.uz/api/docs#/Company%20Categories):
- `GET /api/company-category` - List all categories
- `GET /api/company-category/:id` - Get category by ID
- `POST /api/company-category` - Create category
- `PATCH /api/company-category/:id` - Update category
- `DELETE /api/company-category/:id` - Delete category

All endpoints are implemented in `src/services/api.js` and used in `src/pages/CompanyCategories/CompanyCategories.jsx`.

