# UI Library Migration Guide

This guide helps you migrate existing components to use the new centralized UI library.

## Canonical Import Rules

Use only these import surfaces in feature code:

1. `@/ui` for primitives, layout, typography, and feedback
2. `@/ui/composites` for app-level shared composites (`PageScaffold`, `RoleDashboardLayout`, `SectionHeader`, etc.)
3. `@/ui/async-states` for centralized loading/error/empty rendering

Avoid:
- `@/components/ui` in new code (legacy compatibility path only)
- `@nextui-org/react` in feature code (`src/components/**`)

## Quick Start

### Before (NextUI direct import)
```tsx
import { Button, Card, CardBody, Input } from '@nextui-org/react';

<Card className="bg-[var(--app-surface)] border border-[var(--app-border)]">
  <CardBody className="p-6">
    <Input
      type="email"
      classNames={{
        inputWrapper: "bg-[var(--app-surface-hover)] border border-[var(--app-border-subtle)]"
      }}
    />
    <Button color="primary">Submit</Button>
  </CardBody>
</Card>
```

### After (UI Library)
```tsx
import { Button, Card, Input } from '@/ui';

<Card padding="md">
  <Input type="email" />
  <Button color="primary">Submit</Button>
</Card>
```

## Benefits

1. **Consistency** - All components follow the same design system
2. **Less Code** - Pre-styled with your custom theme
3. **Type Safety** - Full TypeScript support
4. **Easier Maintenance** - Update styles in one place
5. **Better DX** - Simpler props, clearer intent

## Component Mapping

### Direct Replacements

| NextUI | UI Library | Notes |
|--------|-----------|-------|
| `Button` | `Button` | Same props, auto-styled |
| `Card + CardBody` | `Card` | Single component |
| `Chip` | `Badge` | More semantic name |
| `Input` | `Input` | Pre-styled with theme |
| `Select + SelectItem` | `Select` | Accepts options array |
| `Checkbox` | `Checkbox` | Same API |
| `Switch` | `Switch` | Same API |
| `RadioGroup + Radio` | `RadioGroup` | Use for semantic single-choice settings |
| `Slider` | `Slider` | Use wrapper from `@/ui` |
| `Modal + ModalContent + ModalHeader + ModalBody + ModalFooter` | `Modal` | Single component with props |
| `Spinner` | `Spinner` | Same API |
| `Progress` | `Progress` | Same API |

### Composition Replacements

| Legacy pattern | Shared replacement |
|--------|-----------|
| Repeated dashboard shell blocks | `RoleDashboardLayout` from `@/ui/composites` |
| Repeated section heading row | `SectionHeader` from `@/ui/composites` |
| Repeated list/timeline cards | `ListItemCard` from `@/ui/composites` |
| Repeated label/value rows | `KeyValueRow` from `@/ui/composites` |
| Manual loading/error/empty branches | `AsyncStateRenderer`/`AsyncArrayRenderer` from `@/ui/async-states` |

### New Layout Components

```tsx
import { Container, Grid, Stack, Flex } from '@/ui';

// Replace manual div/flex layouts
<Container maxWidth="xl">
  <Grid cols={3} gap="lg">
    <Card>Item 1</Card>
    <Card>Item 2</Card>
    <Card>Item 3</Card>
  </Grid>
</Container>

// Replace manual spacing
<Stack direction="horizontal" spacing="md" justify="between">
  <Text>Label</Text>
  <Button>Action</Button>
</Stack>
```

### New Typography Components

```tsx
import { Heading, Text, Link } from '@/ui';

// Replace h1-h6 tags
<Heading level={1} color="primary">Title</Heading>

// Replace p/span tags
<Text size="lg" color="muted">Description</Text>

// Replace Next.js Link with styled version
<Link href="/dashboard">Go to Dashboard</Link>
```

## Migration Steps

### 1. Identify Components to Migrate

Look for:
- Direct NextUI imports
- Manual styling with CSS variables
- Repeated className patterns
- Layout divs with flex/grid

### 2. Update Imports

```tsx
// Old
import { Button, Card, CardBody } from '@nextui-org/react';
import { PageScaffold } from '@/components/ui';

// New
import { Button, Card } from '@/ui';
import { PageScaffold } from '@/ui/composites';
```

### 3. Simplify JSX

```tsx
// Old
<Card className="bg-[var(--app-surface)] border border-[var(--app-border)]">
  <CardBody className="p-6">
    Content
  </CardBody>
</Card>

// New
<Card padding="md">
  Content
</Card>
```

### 4. Update Props

```tsx
// Old
<Input
  classNames={{
    inputWrapper: "bg-[var(--app-surface-hover)] border border-[var(--app-border-subtle)]"
  }}
/>

// New
<Input />  // Styling is built-in
```

### 5. Replace Toggle Misuse for Radio Settings

```tsx
// Old (radio semantics done with toggle buttons)
<ToggleButtonGroup
  selectionMode="single"
  selectedKeys={selected}
  onSelectionChange={setSelected}
  options={[...]}
/>

// New
<RadioGroup
  value={value}
  onValueChange={setValue}
  options={[...]}
/>
```

## Common Patterns

### Form Layout

```tsx
import { Card, Stack, Input, Select, Button } from '@/ui';

<Card>
  <Stack spacing="md">
    <Input label="Name" />
    <Input label="Email" type="email" />
    <Select label="Stage" options={stageOptions} />

    <Stack direction="horizontal" spacing="md" justify="end">
      <Button variant="bordered">Cancel</Button>
      <Button color="primary">Submit</Button>
    </Stack>
  </Stack>
</Card>
```

### Dashboard Grid

```tsx
import { Container, Grid, Card, Heading } from '@/ui';

<Container maxWidth="xl">
  <Heading level={2} className="mb-6">Dashboard</Heading>

  <Grid cols={4} gap="lg">
    <Card>Metric 1</Card>
    <Card>Metric 2</Card>
    <Card>Metric 3</Card>
    <Card>Metric 4</Card>
  </Grid>
</Container>
```

### Alert Messages

```tsx
import { Alert } from '@/ui';

<Alert variant="success" title="Success!">
  Your changes have been saved
</Alert>

<Alert variant="danger" title="Error" dismissible onDismiss={handleClose}>
  Something went wrong
</Alert>
```

### Modal Dialog

```tsx
import { Modal, Button, Stack } from '@/ui';

<Modal
  title="Confirm Delete"
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  footer={
    <Stack direction="horizontal" spacing="sm">
      <Button variant="light" onPress={handleCancel}>Cancel</Button>
      <Button color="danger" onPress={handleDelete}>Delete</Button>
    </Stack>
  }
>
  Are you sure you want to delete this item?
</Modal>
```

## Best Practices

### 1. Use Semantic Colors

```tsx
// Good - Intent is clear
<Button color="danger">Delete</Button>
<Badge color="success">Active</Badge>
<Alert variant="warning">Warning message</Alert>

// Avoid - Intent is unclear
<Button className="bg-red-500">Delete</Button>
```

### 2. Leverage Layout Components

```tsx
// Good - Declarative and maintainable
<Stack spacing="md">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Stack>

// Avoid - Manual spacing
<div>
  <p className="mb-4">Item 1</p>
  <p>Item 2</p>
</div>
```

### 3. Use Typography Components

```tsx
// Good - Consistent styling
<Heading level={3} color="primary">Title</Heading>
<Text size="lg" color="muted">Description</Text>

// Avoid - Manual styling
<h3 className="text-2xl text-[var(--app-primary)]">Title</h3>
<p className="text-lg text-[var(--app-text-muted)]">Description</p>
```

### 4. Compose Components

```tsx
// Good - Reusable pattern
function MetricCard({ title, value, change }) {
  return (
    <Card>
      <Stack spacing="sm">
        <Text size="sm" color="muted">{title}</Text>
        <Heading level={4}>{value}</Heading>
        <Badge color={change > 0 ? 'success' : 'danger'}>
          {change > 0 ? '+' : ''}{change}%
        </Badge>
      </Stack>
    </Card>
  );
}
```

### 5. Use the Right Single-Select Primitive

```tsx
// Good: form/settings radios
<RadioGroup value={mode} onValueChange={setMode} options={modeOptions} />

// Good: mode/view toggle chips
<ToggleButtonGroup selectionMode="single" selectedKeys={view} onSelectionChange={setView} options={viewOptions} />
```

## Completion Checklist

1. No feature imports from `@nextui-org/react`
2. No feature imports from `@/components/ui`
3. No raw `<input>`, `<select>`, or `<textarea>` in `src/components/**/*.tsx`
4. Async loading/error/empty states use shared async renderers
5. Repeated page-level shells and section headers use composites

## Validation Commands

```bash
pnpm run audit:ui-centralization
pnpm run audit:ui-centralization:enforce
pnpm run lint
```

## Troubleshooting

### Component not found
```
Error: Cannot find module '@/ui'
```
**Solution**: Ensure TypeScript paths are configured in `tsconfig.json`

### Styling not applied
```tsx
// If custom styling isn't working
<Button className="my-custom-class">Button</Button>
```
**Solution**: Check that your custom class doesn't conflict with built-in styles. Use Tailwind utilities.

### Type errors
```
Type 'X' is not assignable to type 'Y'
```
**Solution**: Import the component's type definition:
```tsx
import { Button, type ButtonProps } from '@/ui';
```

## Need Help?

- Check [README.md](./README.md) for component documentation
- View [UIShowcase.tsx](./examples/UIShowcase.tsx) for examples
- Review existing migrated components for patterns
