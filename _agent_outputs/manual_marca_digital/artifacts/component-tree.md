# Component Tree — Manual de Marca Digital

**Structure:** React component hierarchy for Manual de Marca Digital  
**Framework:** React 18 + TypeScript + shadcn/ui  
**Pattern:** Modular sections with shared components

---

## 📱 Page Level

```
pages/ManualMarca.tsx
├── Layout & Routing
├── Data fetching (useManualData)
├── Loading & Error states
└── Section routing logic
```

**Props:**
- `userId: string`
- `brandVoiceId?: string`
- `section?: ManualSection`

**State:**
- Current section
- Manual data
- Loading states
- Error handling

---

## 🏠 Dashboard Level

```
components/manual/ManualDashboard.tsx
├── Header with brand info
├── Progress/completeness indicators  
├── Quick navigation cards
└── Action toolbar (export, share, edit)
```

**Props:**
- `manual: RenderedManual`
- `onSectionSelect: (section) => void`
- `onExport: () => void`
- `onShare: () => void`

---

## 🧭 Navigation Layer

```
components/manual/ManualNavigation.tsx
├── Desktop: Sidebar navigation
│   ├── Section list with progress
│   ├── Search/filter
│   └── Collapse/expand controls
└── Mobile: Bottom navigation
    ├── Section icons
    ├── Current section indicator
    └── Overflow menu for actions
```

**Props:**
- `sections: NavigationSection[]`
- `currentSection: string`
- `onSectionChange: (section) => void`
- `isMobile: boolean`

---

## 📄 Layout Container

```
components/manual/ManualLayout.tsx
├── Navigation (sidebar/bottom)
├── Main content area
│   ├── Section header
│   ├── Section content (dynamic)
│   └── Section actions
└── Action panel (export/share)
```

**Props:**
- `navigation: React.Node`
- `children: React.Node`
- `actions: React.Node`
- `isMobile: boolean`

---

## 🎨 Section Components

### Visual Identity Section
```
components/manual/sections/VisualIdentitySection.tsx
├── ColorPalette component
│   ├── Color grid display
│   ├── Accessibility indicators
│   ├── Usage examples
│   └── Copy codes functionality
├── Logo showcase
│   ├── Logo variants display
│   ├── Usage guidelines
│   └── Download links
├── Typography display
│   ├── Font examples
│   ├── Size/weight variations
│   └── Usage guidelines
└── Mood board
    ├── Image gallery
    ├── Style references
    └── Visual guidelines
```

### Voice Section  
```
components/manual/sections/VoiceSection.tsx
├── RadarChart component
│   ├── Interactive dimensions
│   ├── Hover states
│   ├── Benchmark comparison
│   └── Export chart functionality
├── Persona description
│   ├── Personality traits
│   ├── Communication style
│   └── Key characteristics
├── Examples showcase
│   ├── Do/Don't comparisons
│   ├── Context variations
│   └── Channel adaptations
└── Guidelines summary
    ├── Formal tone rules
    ├── Casual tone rules
    └── Emergency communication
```

### Language Section
```
components/manual/sections/LanguageSection.tsx
├── Glossary component
│   ├── Search/filter interface
│   ├── Preferred terms list
│   ├── Prohibited terms list
│   └── Usage examples
├── CTA library
│   ├── Template categories
│   ├── Copy buttons
│   ├── Context variations
│   └── Channel adaptations
├── Style guidelines
│   ├── Formatting rules
│   ├── Punctuation guidelines
│   └── Emoji policy
└── Writing samples
    ├── Good examples
    ├── Bad examples
    └── Context-specific samples
```

### Compliance Section
```
components/manual/sections/ComplianceSection.tsx
├── Policy overview
│   ├── Content policies
│   ├── Medical claim rules
│   ├── Legal disclaimers
│   └── Regulatory requirements
├── Compliance checklist
│   ├── Interactive checkboxes
│   ├── Automated validations
│   ├── Manual review items
│   └── Compliance score
├── Alert system
│   ├── Warning triggers
│   ├── Severity indicators
│   ├── Escalation process
│   └── Review workflow
└── Templates
    ├── Disclaimer templates
    ├── Legal text samples
    └── Compliance shortcuts
```

---

## 🔧 Shared Components

### UI Components
```
components/ui/RadarChart.tsx
├── Chart rendering (Recharts)
├── Interactive hover states
├── Responsive scaling
├── Export functionality
└── Accessibility support

components/ui/ColorPalette.tsx
├── Color grid layout
├── Accessibility info
├── Copy to clipboard
├── Usage examples
└── Color contrast validation

components/ui/SectionPreview.tsx
├── Real-time content preview
├── Multiple format support
├── Before/after comparison
├── Channel-specific rendering
└── Export preview mode
```

### Shared Manual Components
```
components/manual/shared/ManualNavigation.tsx
├── Section navigation logic
├── Progress tracking
├── Mobile/desktop variants
└── Keyboard navigation

components/manual/shared/ExportOptions.tsx
├── Format selection (PDF, JSON, kit)
├── Section selection
├── Template options
├── Progress indicator
└── Download management

components/manual/shared/SharingPanel.tsx
├── Access level controls
├── Public URL generation
├── Embed code generation
├── Permission management
└── Usage analytics
```

---

## 🎣 Hooks & Data

### Custom Hooks
```
hooks/useManualData.ts
├── Manual data fetching
├── Cache management
├── Real-time sync
├── Error handling
└── Loading states

hooks/useManualNavigation.ts
├── Section routing
├── URL synchronization
├── Navigation state
├── Mobile detection
└── Keyboard shortcuts

hooks/useManualExport.ts
├── Export generation
├── Progress tracking
├── Download management
├── Format conversion
└── Error handling

hooks/useManualSharing.ts
├── Sharing configuration
├── Public URL management
├── Access control
├── Embed generation
└── Analytics tracking
```

### Context Providers
```
contexts/ManualContext.tsx
├── Manual data state
├── Section navigation state
├── Export/sharing state
├── Loading/error state
└── User preferences

contexts/ManualThemeContext.tsx
├── Theme configuration
├── Brand color application
├── Responsive breakpoints
├── Accessibility settings
└── User customizations
```

---

## 📊 State Management

### React Query (Server State)
```
queries/manual.queries.ts
├── Manual data fetching
├── Brand Voice synchronization  
├── Export status polling
├── Sharing configuration
└── Analytics data

mutations/manual.mutations.ts
├── Manual configuration updates
├── Export generation requests
├── Sharing setting changes
├── Section customizations
└── Usage tracking
```

### Zustand (UI State)
```
stores/manualUIStore.ts
├── Current section
├── Navigation state (mobile/desktop)
├── Export panel state
├── Sharing panel state
├── Preview mode
├── Loading overlays
└── User preferences

stores/manualCacheStore.ts
├── Client-side cache
├── Prefetched data
├── Optimistic updates
├── Sync status
└── Cache invalidation
```

---

## 🎯 Component Responsibilities

### Data Components
- **Fetch & transform** Brand Voice JSON
- **Cache management** for performance
- **Real-time sync** with backend
- **Error handling** and recovery

### UI Components  
- **Responsive rendering** (mobile/desktop)
- **Accessibility compliance** (WCAG 2.1 AA)
- **Interactive elements** (charts, previews)
- **Visual consistency** (design system)

### Business Logic
- **Section navigation** and routing
- **Export generation** and management
- **Sharing** and access control
- **Compliance validation** and alerts

---

## 🔄 Component Lifecycle

### 1. **Initialization**
- Load manual data via useManualData
- Initialize navigation state
- Setup theme and responsive detection
- Configure error boundaries

### 2. **Rendering**  
- Render navigation (sidebar/bottom)
- Render current section content
- Apply brand theme and colors
- Handle loading and error states

### 3. **Interaction**
- Navigate between sections
- Interactive chart/preview updates
- Export and sharing actions
- Real-time content synchronization

### 4. **Cleanup**
- Cache cleanup on unmount
- Event listener cleanup
- Subscription cleanup
- Memory management

---

## 📐 Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: '< 768px',
  tablet: '768px - 1024px', 
  desktop: '> 1024px'
}

// Component adaptations:
// - Navigation: sidebar → bottom nav
// - Charts: full size → compact
// - Actions: toolbar → floating action button
// - Typography: scale adjustments
```

---

## ♿ Accessibility Features

### Keyboard Navigation
- **Tab order:** logical section flow
- **Shortcuts:** Quick section jumping
- **Focus management:** Clear visual indicators
- **Screen readers:** Semantic HTML + ARIA

### Visual Accessibility
- **Color contrast:** WCAG AA compliance
- **Focus indicators:** High contrast outlines  
- **Text scaling:** Respects user preferences
- **Reduced motion:** Animation opt-out

---

**Total Components:** ~25 components  
**Complexity:** Medium-High (interactive charts, responsive design)  
**Testing Strategy:** Component isolation + visual regression + E2E flows