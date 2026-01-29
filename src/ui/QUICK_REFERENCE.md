# UI Library Quick Reference

## Import Everything

```tsx
import {
  // Components
  Button, Card, Badge, IconButton,
  Input, Select, Checkbox, Switch, Textarea,

  // Layout
  Container, Grid, Stack, Flex,

  // Typography
  Heading, Text, Link,

  // Feedback
  Alert, Modal, Spinner, Skeleton, Progress,
} from '@/ui';
```

## Component Props Cheat Sheet

### Button
```tsx
<Button
  color="primary | secondary | success | warning | danger | default"
  variant="solid | bordered | light | flat | faded | shadow | ghost"
  size="sm | md | lg"
  startContent={<Icon />}
  endContent={<Icon />}
  isLoading={boolean}
  isDisabled={boolean}
/>
```

### Card
```tsx
<Card
  header={ReactNode}
  footer={ReactNode}
  padding="none | sm | md | lg"
/>
```

### Badge
```tsx
<Badge
  color="primary | secondary | success | warning | danger | default"
  variant="solid | bordered | flat"
  size="sm | md | lg"
/>
```

### Input
```tsx
<Input
  label="Label"
  type="text | email | password | number"
  placeholder="Placeholder"
  description="Helper text"
  errorMessage="Error message"
  isRequired={boolean}
  isDisabled={boolean}
  startContent={<Icon />}
  endContent={<Icon />}
/>
```

### Select
```tsx
<Select
  label="Label"
  options={[
    { value: 'id', label: 'Display' }
  ]}
  placeholder="Select option"
  isRequired={boolean}
/>
```

### Checkbox / Switch
```tsx
<Checkbox color="primary" size="md">Label</Checkbox>
<Switch color="primary" size="md">Label</Switch>
```

### Container
```tsx
<Container maxWidth="sm | md | lg | xl | 2xl | full">
  Content
</Container>
```

### Grid
```tsx
<Grid
  cols={1 | 2 | 3 | 4 | 5 | 6 | 12}
  gap="none | sm | md | lg | xl"
>
  Items
</Grid>
```

### Stack
```tsx
<Stack
  direction="vertical | horizontal"
  spacing="none | xs | sm | md | lg | xl"
  align="start | center | end | stretch"
  justify="start | center | end | between | around"
>
  Items
</Stack>
```

### Flex
```tsx
<Flex
  direction="row | col | row-reverse | col-reverse"
  wrap="wrap | nowrap | wrap-reverse"
  align="start | center | end | stretch | baseline"
  justify="start | center | end | between | around | evenly"
  gap="none | xs | sm | md | lg | xl"
>
  Items
</Flex>
```

### Heading
```tsx
<Heading
  level={1 | 2 | 3 | 4 | 5 | 6}
  color="default | primary | secondary | muted"
/>
```

### Text
```tsx
<Text
  size="xs | sm | base | lg | xl"
  weight="normal | medium | semibold | bold"
  color="default | primary | secondary | muted | subtle | success | warning | danger"
  as="p | span | div"
/>
```

### Link
```tsx
<Link
  href="/path"
  color="default | primary | secondary"
  external={boolean}
/>
```

### Alert
```tsx
<Alert
  variant="info | success | warning | danger"
  title="Title"
  dismissible={boolean}
  onDismiss={() => {}}
>
  Message
</Alert>
```

### Modal
```tsx
<Modal
  title="Title"
  isOpen={boolean}
  onOpenChange={(open) => {}}
  size="xs | sm | md | lg | xl | 2xl | full"
  footer={ReactNode}
>
  Content
</Modal>
```

### Spinner / Progress
```tsx
<Spinner size="sm | md | lg" color="primary" />
<Progress value={50} size="sm | md | lg" color="primary" />
<Progress isIndeterminate color="primary" />
```

## Color System

### Semantic Colors (Use These!)
- `primary` - Deep Blue (main actions)
- `secondary` - Rich Gold (luxury accents)
- `success` - Green (positive/complete)
- `warning` - Amber (caution/pending)
- `danger` - Red (destructive/error)
- `info` - Cyan (informational)
- `neutral` - Gray (mixed/pending states)
- `default` - Neutral stone

### Background Variants
Each status color has a `-light` variant for backgrounds:
- `bg-app-success-light` / `dark:bg-app-dark-success-light`
- `bg-app-warning-light` / `dark:bg-app-dark-warning-light`
- etc.

### CSS Variables (for third-party libs only)
```css
/* Backgrounds */
--app-bg              /* Page background */
--app-surface         /* Card/component background */
--app-surface-hover   /* Hover state */
--app-primary-bg      /* Primary with opacity */
--app-secondary-bg    /* Secondary with opacity */

/* Text */
--app-text            /* Primary text */
--app-text-muted      /* Secondary text */
--app-text-subtle     /* Tertiary text */

/* Status with backgrounds */
--app-success / --app-success-bg
--app-warning / --app-warning-bg
--app-danger / --app-danger-bg
--app-info / --app-info-bg
--app-neutral / --app-neutral-bg
```

### Tailwind Classes (Preferred)
```tsx
// Use semantic classes, NOT hardcoded colors
<div className="bg-app-danger-light dark:bg-app-dark-danger-light text-app-danger dark:text-app-dark-danger">
  Error message
</div>

// NOT: bg-red-500/10 text-red-500
```

## Common Patterns

### Form
```tsx
<Card>
  <Stack spacing="md">
    <Input label="Field 1" />
    <Select label="Field 2" options={opts} />
    <Stack direction="horizontal" spacing="md" justify="end">
      <Button variant="bordered">Cancel</Button>
      <Button color="primary">Submit</Button>
    </Stack>
  </Stack>
</Card>
```

### Stats Grid
```tsx
<Grid cols={4} gap="lg">
  {stats.map(stat => (
    <Card key={stat.id}>
      <Stack spacing="sm">
        <Text size="sm" color="muted">{stat.label}</Text>
        <Heading level={4}>{stat.value}</Heading>
        <Badge color="success">+{stat.change}%</Badge>
      </Stack>
    </Card>
  ))}
</Grid>
```

### Page Layout
```tsx
<Container maxWidth="xl">
  <Stack spacing="lg">
    <Stack direction="horizontal" spacing="md" justify="between">
      <Heading level={2}>Page Title</Heading>
      <Button color="primary" startContent={<Plus />}>
        New Item
      </Button>
    </Stack>

    <Grid cols={2} gap="lg">
      <Card>Content 1</Card>
      <Card>Content 2</Card>
    </Grid>
  </Stack>
</Container>
```

### Action Toolbar
```tsx
<Stack direction="horizontal" spacing="sm" justify="end">
  <IconButton icon={<Edit />} aria-label="Edit" />
  <IconButton icon={<Trash2 />} color="danger" aria-label="Delete" />
</Stack>
```

### Status Badge
```tsx
const statusColor = {
  active: 'success',
  pending: 'warning',
  inactive: 'default',
}[status];

<Badge color={statusColor}>{status}</Badge>
```

## Icons

Using Lucide React:
```tsx
import { Check, X, AlertCircle, Info, Plus, Edit, Trash2 } from 'lucide-react';

<Button startContent={<Plus className="w-4 h-4" />}>
  Add Item
</Button>
```

## Responsive Design

All layout components are responsive by default:

```tsx
// Grid automatically adapts
<Grid cols={4} gap="lg">  // 1 col mobile, 2 col tablet, 4 col desktop
  <Card>...</Card>
</Grid>

// Stack direction can change
<Stack direction="horizontal" spacing="md">  // Horizontal on desktop
  <Button>Cancel</Button>
  <Button color="primary">Submit</Button>
</Stack>
```

Use Tailwind responsive prefixes when needed:
```tsx
<div className="flex flex-col md:flex-row gap-4">
  <Button className="w-full md:w-auto">Button</Button>
</div>
```
