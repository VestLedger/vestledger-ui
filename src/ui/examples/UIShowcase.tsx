'use client';

import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Checkbox,
  Alert,
  Modal,
  Spinner,
  Progress,
  Container,
  Grid,
  Stack,
  Heading,
  Text,
} from '@/ui';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useUIKey } from '@/store/ui';

/**
 * UI Showcase Component
 * Demonstrates all available UI library components
 * Use this as a reference for implementing UI patterns
 */
export function UIShowcase() {
  const { value: ui, patch: patchUI } = useUIKey('ui-showcase', { isModalOpen: false });
  const { isModalOpen } = ui;

  return (
    <Container maxWidth="xl">
      <div className="py-8 space-y-12">
        {/* Header */}
        <div>
          <Heading level={1} color="primary">
            VestLedger UI Library
          </Heading>
          <Text size="lg" color="muted" className="mt-2">
            A showcase of all available components
          </Text>
        </div>

        {/* Buttons */}
        <section>
          <Heading level={3} className="mb-4">
            Buttons
          </Heading>
          <Stack direction="horizontal" spacing="md">
            <Button color="primary">Primary</Button>
            <Button color="secondary">Secondary</Button>
            <Button color="success">Success</Button>
            <Button color="warning">Warning</Button>
            <Button color="danger">Danger</Button>
            <Button variant="bordered" color="primary">
              Bordered
            </Button>
            <Button variant="light" color="primary">
              Light
            </Button>
          </Stack>
        </section>

        {/* Badges */}
        <section>
          <Heading level={3} className="mb-4">
            Badges
          </Heading>
          <Stack direction="horizontal" spacing="sm">
            <Badge color="primary">Primary</Badge>
            <Badge color="secondary">Gold</Badge>
            <Badge color="success">Success</Badge>
            <Badge color="warning">Warning</Badge>
            <Badge color="danger">Danger</Badge>
            <Badge variant="bordered" color="primary">
              Bordered
            </Badge>
          </Stack>
        </section>

        {/* Cards */}
        <section>
          <Heading level={3} className="mb-4">
            Cards
          </Heading>
          <Grid cols={3} gap="lg">
            <Card
              header={<Text weight="semibold">Card with Header</Text>}
              footer={
                <Button color="primary" size="sm">
                  Action
                </Button>
              }
            >
              <Text>This card has both header and footer sections.</Text>
            </Card>

            <Card>
              <Stack spacing="md">
                <Badge color="success">Active</Badge>
                <Heading level={5}>Simple Card</Heading>
                <Text color="muted">Just content, no header or footer.</Text>
              </Stack>
            </Card>

            <Card padding="lg">
              <Stack spacing="sm">
                <Heading level={5} color="primary">
                  Large Padding
                </Heading>
                <Text size="sm">This card uses larger padding.</Text>
              </Stack>
            </Card>
          </Grid>
        </section>

        {/* Forms */}
        <section>
          <Heading level={3} className="mb-4">
            Form Components
          </Heading>
          <Card>
            <Stack spacing="md">
              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                description="We'll never share your email"
              />

              <Select
                label="Investment Stage"
                options={[
                  { value: 'seed', label: 'Seed' },
                  { value: 'series-a', label: 'Series A' },
                  { value: 'series-b', label: 'Series B' },
                ]}
              />

              <Checkbox color="primary">I agree to the terms and conditions</Checkbox>

              <Stack direction="horizontal" spacing="md">
                <Button variant="bordered">Cancel</Button>
                <Button color="primary">Submit</Button>
              </Stack>
            </Stack>
          </Card>
        </section>

        {/* Alerts */}
        <section>
          <Heading level={3} className="mb-4">
            Alerts
          </Heading>
          <Stack spacing="md">
            <Alert variant="info" title="Information">
              This is an informational message.
            </Alert>
            <Alert variant="success" title="Success!">
              Your changes have been saved successfully.
            </Alert>
            <Alert variant="warning" title="Warning">
              Please review your information before proceeding.
            </Alert>
            <Alert variant="danger" title="Error">
              Something went wrong. Please try again.
            </Alert>
          </Stack>
        </section>

        {/* Modal Demo */}
        <section>
          <Heading level={3} className="mb-4">
            Modal
          </Heading>
          <Button color="primary" onPress={() => patchUI({ isModalOpen: true })}>
            Open Modal
          </Button>

          <Modal
            title="Confirm Action"
            isOpen={isModalOpen}
            onOpenChange={(open) => patchUI({ isModalOpen: open })}
            footer={
              <Stack direction="horizontal" spacing="sm">
                <Button variant="light" onPress={() => patchUI({ isModalOpen: false })}>
                  Cancel
                </Button>
                <Button color="danger" onPress={() => patchUI({ isModalOpen: false })}>
                  Confirm Delete
                </Button>
              </Stack>
            }
          >
            <Text>Are you sure you want to delete this item? This action cannot be undone.</Text>
          </Modal>
        </section>

        {/* Loading States */}
        <section>
          <Heading level={3} className="mb-4">
            Loading States
          </Heading>
          <Grid cols={3} gap="lg">
            <Card>
              <Stack spacing="md" align="center">
                <Spinner size="lg" color="primary" />
                <Text>Loading...</Text>
              </Stack>
            </Card>

            <Card>
              <Stack spacing="md">
                <Text weight="medium">Upload Progress</Text>
                <Progress value={65} color="success" />
              </Stack>
            </Card>

            <Card>
              <Stack spacing="md">
                <Text weight="medium">Processing</Text>
                <Progress isIndeterminate color="primary" />
              </Stack>
            </Card>
          </Grid>
        </section>

        {/* Layout Examples */}
        <section>
          <Heading level={3} className="mb-4">
            Layout Components
          </Heading>
          <Card>
            <Stack spacing="lg">
              <div>
                <Text weight="medium" className="mb-2">
                  Stack - Horizontal
                </Text>
                <Stack direction="horizontal" spacing="md">
                  <Badge>Item 1</Badge>
                  <Badge>Item 2</Badge>
                  <Badge>Item 3</Badge>
                </Stack>
              </div>

              <div>
                <Text weight="medium" className="mb-2">
                  Stack - Vertical with Justify
                </Text>
                <Stack direction="horizontal" spacing="md" justify="between">
                  <Text>Left aligned</Text>
                  <Button size="sm" color="primary">
                    Right aligned
                  </Button>
                </Stack>
              </div>
            </Stack>
          </Card>
        </section>

        {/* Typography */}
        <section>
          <Heading level={3} className="mb-4">
            Typography
          </Heading>
          <Card>
            <Stack spacing="md">
              <Heading level={1}>Heading Level 1</Heading>
              <Heading level={2}>Heading Level 2</Heading>
              <Heading level={3}>Heading Level 3</Heading>
              <Heading level={4}>Heading Level 4</Heading>
              <Text size="xl" weight="bold">
                Extra Large Bold Text
              </Text>
              <Text size="lg">Large Text</Text>
              <Text size="base">Base Text (default)</Text>
              <Text size="sm" color="muted">
                Small Muted Text
              </Text>
              <Text size="xs" color="subtle">
                Extra Small Subtle Text
              </Text>
            </Stack>
          </Card>
        </section>
      </div>
    </Container>
  );
}
