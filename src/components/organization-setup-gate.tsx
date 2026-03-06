'use client';

import { useEffect, useState } from 'react';
import { Button, Modal, Select, useToast } from '@/ui';
import { useAuth } from '@/contexts/auth-context';
import { useAppDispatch } from '@/store/hooks';
import { authUserUpdated } from '@/store/slices/authSlice';
import {
  OPERATING_REGION_OPTIONS,
  getOperatingRegionLabel,
} from '@/lib/regulatory-regions';
import { updateCurrentOrgSettings } from '@/services/orgSettingsService';
import type { OperatingRegion } from '@/types/regulatory';
import { persistAuthenticatedUser } from '@/utils/auth/persist-authenticated-user';

export function OrganizationSetupGate() {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [selectedRegion, setSelectedRegion] = useState<OperatingRegion | ''>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedRegion(user?.operatingRegion ?? '');
  }, [user?.operatingRegion]);

  const isOpen =
    isAuthenticated &&
    Boolean(user) &&
    !user?.isPlatformAdmin &&
    user?.organizationConfigured === false;

  if (!isOpen || !user) {
    return null;
  }

  const submit = async () => {
    if (!selectedRegion) {
      toast.warning('Select an operating region to continue.', 'Region required');
      return;
    }

    setIsSaving(true);
    try {
      const settings = await updateCurrentOrgSettings({
        operatingRegion: selectedRegion,
      });
      const nextUser = {
        ...user,
        tenantId: settings.orgId,
        operatingRegion: settings.operatingRegion,
        organizationConfigured: settings.organizationConfigured,
      };
      persistAuthenticatedUser(nextUser);
      dispatch(authUserUpdated(nextUser));
      toast.success(
        `Workspace configured for ${getOperatingRegionLabel(
          settings.operatingRegion,
        )}.`,
        'Organization updated',
      );
    } catch (error) {
      console.error('Failed to update organization settings', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update organization settings',
        'Update failed',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      title="Complete Organization Setup"
      isOpen={isOpen}
      onOpenChange={() => {
        // The initial region selection is required before the workspace is fully usable.
      }}
      size="lg"
      footer={(
        <Button color="primary" isLoading={isSaving} onPress={submit}>
          Save Region
        </Button>
      )}
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--app-text-muted)]">
          Choose the primary operating region for this organization. Fund setup,
          valuations, tax/reporting surfaces, and compliance workflows will use
          this as the default.
        </p>

        <div>
          <label className="block text-sm font-medium mb-2">
            Operating Region
          </label>
          <Select
            options={OPERATING_REGION_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            selectedKeys={selectedRegion ? [selectedRegion] : []}
            onChange={(event) =>
              setSelectedRegion(event.target.value as OperatingRegion)
            }
            disallowEmptySelection
          />
          <p className="mt-2 text-xs text-[var(--app-text-subtle)]">
            You can change this later in Settings.
          </p>
        </div>
      </div>
    </Modal>
  );
}
