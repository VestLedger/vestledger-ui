# VestLedger UI Library

A centralized, type-safe UI component library for the VestLedger application. Built on top of NextUI with custom styling following an enterprise-grade design system.

## 🎨 Design Principles

- **Enterprise**: Emerald identity with champagne value accents — institutional and premium
- **Accessible**: WCAG-compliant contrast ratios in both light and dark modes
- **Intuitive**: Clear semantic colors (green=success, red=danger, etc.)
- **Consistent**: All components use CSS variables for automatic theme switching

## Import Surfaces

The UI library is already part of this app and has one canonical namespace with scoped surfaces:

- `@/ui` for primitives, layout, typography, and feedback
- `@/ui/composites` for app-level reusable composites
- `@/ui/async-states` for shared loading/error/empty renderers

Examples:

```tsx
import { Button, Card, Heading, RadioGroup, Slider } from '@/ui';
import { PageScaffold, RoleDashboardLayout, SectionHeader } from '@/ui/composites';
import { AsyncStateRenderer, AsyncArrayRenderer } from '@/ui/async-states';
```

Use only the canonical `@/ui*` import surfaces.

## 🧩 Component Categories

### Components (Base)
- **Button** - Primary action buttons with variants and loading states
- **Card** - Content containers with header/footer support
- **Badge** - Status indicators and labels
- **IconButton** - Icon-only buttons with required accessibility labels
- **DropdownButton** - Button with dropdown menu for multiple actions
- **ToggleButtonGroup** - Segmented control for view/filter toggles
- **RadioGroup** - Semantic single-choice settings and preference forms
- **FloatingActionButton (FAB)** - Sticky circular button for primary screen action
- **Input** - Text input fields
- **Select** - Dropdown selection
- **Checkbox** - Boolean selection
- **Switch** - Toggle controls
- **Slider** - Numeric range/threshold selection
- **Textarea** - Multi-line text input
- **Tabs** - Navigational tab surface

### App Composites
- **PageScaffold** - Shared shell with title/actions/content
- **RoleDashboardLayout** - Standardized role dashboard frame
- **SectionHeader** - Shared title/description/action row
- **ListItemCard** - Reusable list/timeline card wrapper
- **KeyValueRow** - Reusable label/value row primitive

### Async States
- **AsyncStateRenderer** - Standard loading/error/empty content branching
- **AsyncArrayRenderer** - Array-aware async rendering helper

### Layout
- **Container** - Max-width content wrapper
- **Grid** - Responsive grid system
- **Stack** - Vertical/horizontal spacing
- **Flex** - Flexible box layouts

### Typography
- **Heading** - Semantic headings (h1-h6)
- **Text** - Body text with variants
- **Link** - Navigation links

### Feedback
- **Alert** - Contextual messages
- **Modal** - Dialog overlays
- **Spinner** - Loading indicators
- **Skeleton** - Content placeholders
- **Progress** - Progress bars

## 📖 Usage Examples

### Button

```tsx
import { Button } from '@/ui';

// Primary CTA (solid)
<Button color="primary" size="lg">
  Get Started
</Button>

// Secondary action (outlined)
<Button variant="bordered" color="primary">
  Learn More
</Button>

// Tertiary/ghost action
<Button variant="light" color="default">
  Cancel
</Button>

// Danger/destructive action
<Button variant="solid" color="danger">
  Delete
</Button>

// Loading state (prevents double-click)
<Button color="primary" isLoading>
  Submitting...
</Button>

// Disabled state
<Button color="primary" isDisabled>
  Unavailable
</Button>

// With icon
<Button color="primary" startContent={<PlusIcon />}>
  Add Item
</Button>
```

### DropdownButton

```tsx
import { DropdownButton } from '@/ui';

// Export menu
<DropdownButton
  label="Export"
  items={[
    { key: 'csv', label: 'Export as CSV' },
    { key: 'pdf', label: 'Export as PDF' },
    { key: 'xlsx', label: 'Export as Excel' },
  ]}
  onAction={(key) => handleExport(key)}
/>

// With icons and descriptions
<DropdownButton
  label="Actions"
  variant="bordered"
  items={[
    { key: 'edit', label: 'Edit', startContent: <EditIcon /> },
    { key: 'duplicate', label: 'Duplicate', description: 'Create a copy' },
    { key: 'delete', label: 'Delete', color: 'danger', isDivider: true },
  ]}
  onAction={handleAction}
/>
```

### ToggleButtonGroup

```tsx
import { ToggleButtonGroup } from '@/ui';

// View switcher (single selection)
const [view, setView] = useState(new Set(['grid']));

<ToggleButtonGroup
  aria-label="View mode"
  options={[
    { key: 'grid', label: 'Grid', icon: <GridIcon /> },
    { key: 'list', label: 'List', icon: <ListIcon /> },
    { key: 'table', label: 'Table', icon: <TableIcon /> },
  ]}
  selectedKeys={view}
  onSelectionChange={setView}
  selectionMode="single"
/>

// Filter toggles (multiple selection)
<ToggleButtonGroup
  aria-label="Status filters"
  options={[
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'closed', label: 'Closed' },
  ]}
  selectedKeys={selectedStatuses}
  onSelectionChange={setSelectedStatuses}
  selectionMode="multiple"
/>
```

Use `RadioGroup` for semantic single-select settings, not `ToggleButtonGroup`:

```tsx
import { RadioGroup } from '@/ui';

<RadioGroup
  label="Valuation Mode"
  value={valuationMode}
  onValueChange={setValuationMode}
  options={[
    { value: 'realized', label: 'Realized Only' },
    { value: 'marked', label: 'Marked to Model' },
  ]}
/>
```

### FloatingActionButton (FAB)

```tsx
import { FloatingActionButton, FAB } from '@/ui';

// Standard FAB (bottom-right by default)
<FloatingActionButton
  icon={<PlusIcon />}
  aria-label="Create new item"
  onPress={() => setIsModalOpen(true)}
/>

// Extended FAB with label
<FAB
  icon={<PlusIcon />}
  label="New Distribution"
  isExtended
  aria-label="Create new distribution"
  onPress={() => router.push('/distributions/new')}
/>

// Custom position and color
<FAB
  icon={<EditIcon />}
  position="bottom-left"
  color="secondary"
  aria-label="Edit"
  onPress={handleEdit}
/>
```

### Card

```tsx
import { Card } from '@/ui';

<Card
  header={<h3>Card Title</h3>}
  footer={<Button>Action</Button>}
  padding="lg"
>
  Card content goes here
</Card>
```

### Layout Components

```tsx
import { Container, Grid, Stack } from '@/ui';

<Container maxWidth="xl">
  <Grid cols={3} gap="lg">
    <Card>Item 1</Card>
    <Card>Item 2</Card>
    <Card>Item 3</Card>
  </Grid>
</Container>

<Stack direction="horizontal" spacing="md" align="center">
  <Button>Cancel</Button>
  <Button color="primary">Submit</Button>
</Stack>
```

### Typography

```tsx
import { Heading, Text } from '@/ui';

<Heading level={1} color="primary">
  Welcome to VestLedger
</Heading>

<Text size="lg" color="muted">
  Manage your VC portfolio with precision
</Text>
```

### Feedback Components

```tsx
import { Alert, Modal, Spinner } from '@/ui';

<Alert variant="success" title="Success!">
  Your changes have been saved
</Alert>

<Modal
  title="Confirm Action"
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  footer={
    <>
      <Button onClick={handleCancel}>Cancel</Button>
      <Button color="primary" onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  Are you sure you want to proceed?
</Modal>

<Spinner size="lg" color="primary" />
```

### Form Components

```tsx
import { Input, Select, Checkbox, Switch, RadioGroup, Slider } from '@/ui';

<Input
  label="Email"
  type="email"
  placeholder="you@company.com"
  isRequired
/>

<Select
  label="Stage"
  options={[
    { value: 'seed', label: 'Seed' },
    { value: 'series-a', label: 'Series A' },
    { value: 'series-b', label: 'Series B' },
  ]}
/>

<Checkbox color="primary">
  I agree to the terms
</Checkbox>

<Switch color="primary">
  Enable notifications
</Switch>

<RadioGroup
  label="Investor Update Frequency"
  value={frequency}
  onValueChange={setFrequency}
  options={[
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
  ]}
/>

<Slider
  label="Risk Threshold"
  minValue={0}
  maxValue={100}
  step={5}
  value={riskThreshold}
  onChange={setRiskThreshold}
/>
```

## 🎨 Color System

All components automatically adapt to light/dark mode using CSS variables:

### Semantic Colors
- `primary` - Deep Emerald (main brand/CTA color)
- `secondary` - Champagne/Antique Brass (value outcomes accent)
- `success` - Forest Green (positive actions)
- `warning` - Amber (caution)
- `danger` - Brick Red (destructive actions)
- `default` - Neutral gray

### Usage in Custom Components
```tsx
// Use CSS variables for consistency
<div className="bg-[var(--app-surface)] text-[var(--app-text)]">
  Content
</div>
```

## 🔧 Customization

Components are built with Tailwind CSS and accept `className` props for additional styling:

```tsx
<Button className="shadow-lg hover:shadow-xl">
  Custom Styled Button
</Button>
```

## 📁 File Structure

```
src/ui/
├── components/       # Base UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Input.tsx
│   ├── RadioGroup.tsx
│   ├── Slider.tsx
│   ├── Select.tsx
│   └── ...
├── composites/       # Shared app-level composites (canonical location)
│   └── index.ts
├── async-states/     # Shared async renderers
│   └── index.ts
├── layout/          # Layout components
│   ├── Container.tsx
│   ├── Grid.tsx
│   ├── Stack.tsx
│   └── Flex.tsx
├── typography/      # Text components
│   ├── Heading.tsx
│   ├── Text.tsx
│   └── Link.tsx
├── feedback/        # Feedback components
│   ├── Alert.tsx
│   ├── Modal.tsx
│   ├── Spinner.tsx
│   └── ...
└── index.ts         # Main export file
```

## 🚀 Best Practices

1. **Always use UI library components** instead of creating ad-hoc components
2. **Leverage semantic colors** (success, warning, danger) for intuitive UX
3. **Use layout components** (Container, Grid, Stack) for consistent spacing
4. **Maintain type safety** by importing and using TypeScript types
5. **Follow the color system** by using CSS variables for custom styling

## 🔄 Theme Support

All components automatically support light/dark mode via `next-themes`. Toggle the theme anywhere:

```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
```

## Guardrails

Use these commands before pushing migration-heavy changes:

```bash
pnpm run audit:ui-centralization
pnpm run audit:ui-centralization:enforce
pnpm run lint
```

Pre-commit already runs the enforce command as a regression lock.

## 📚 Additional Resources

- Built on [NextUI](https://nextui.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
