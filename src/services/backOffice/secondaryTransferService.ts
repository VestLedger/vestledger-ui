import { isMockMode } from '@/config/data-mode';
import { mockROFRExercises, mockSecondaryTransfers } from '@/data/seeds/back-office/fund-admin-ops';
import { logger } from '@/lib/logger';
import { requestJson } from '@/services/shared/httpClient';
import type { LPTransfer, ROFRExercise, TransferDocument, TransferStatus } from '@/types/fundAdminOps';

const clone = <T>(value: T): T => structuredClone(value);

let transferStore: LPTransfer[] = clone(mockSecondaryTransfers);
let rofrStore: ROFRExercise[] = clone(mockROFRExercises);

function findTransfer(id: string) {
  const index = transferStore.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Transfer not found: ${id}`);
  }
  return index;
}

function buildFallbackTransfer(overrides: Partial<LPTransfer> = {}): LPTransfer {
  const now = new Date();
  const template = mockSecondaryTransfers[0];
  const base: LPTransfer = template
    ? {
        ...clone(template),
        requestedDate: now,
        documents: clone(template.documents ?? []),
      }
    : {
        id: `transfer-${Date.now()}`,
        transferNumber: `TR-${new Date().getFullYear()}-000`,
        fundId: '',
        fundName: 'Unknown fund',
        type: 'direct',
        status: 'draft',
        transferorId: '',
        transferorName: 'Unknown transferor',
        transferorEmail: '',
        commitmentAmount: 0,
        fundedAmount: 0,
        unfundedCommitment: 0,
        includesManagementRights: false,
        includesInformationRights: false,
        includesVotingRights: false,
        subjectToROFR: false,
        requiresGPConsent: true,
        requiresLPVote: false,
        requestedDate: now,
        documents: [],
        accreditationVerified: false,
        kycCompleted: false,
        amlCleared: false,
        taxFormsReceived: false,
      };

  return {
    ...base,
    ...overrides,
    id: overrides.id ?? base.id ?? `transfer-${Date.now()}`,
    transferNumber: overrides.transferNumber ?? base.transferNumber ?? `TR-${new Date().getFullYear()}-000`,
    fundId: overrides.fundId ?? base.fundId ?? '',
    fundName: overrides.fundName ?? base.fundName ?? 'Unknown fund',
    requestedDate: overrides.requestedDate ?? base.requestedDate ?? now,
    documents: overrides.documents ?? base.documents ?? [],
    status: overrides.status ?? base.status ?? 'draft',
  };
}

function buildFallbackRofr(overrides: Partial<ROFRExercise> = {}): ROFRExercise {
  const now = new Date();
  const template = mockROFRExercises[0];
  const base: ROFRExercise = template
    ? {
        ...clone(template),
        exerciseDate: now,
      }
    : {
        id: `rofr-${Date.now()}`,
        transferId: '',
        exercisedBy: 'lp-existing',
        exercisedByName: 'Existing LP',
        exerciseDate: now,
        amount: 0,
        status: 'pending',
      };

  return {
    ...base,
    ...overrides,
    id: overrides.id ?? base.id ?? `rofr-${Date.now()}`,
    transferId: overrides.transferId ?? base.transferId ?? '',
    exerciseDate: overrides.exerciseDate ?? base.exerciseDate ?? now,
    status: overrides.status ?? base.status ?? 'pending',
  };
}

function upsertTransfer(next: LPTransfer) {
  const index = transferStore.findIndex((item) => item.id === next.id);
  if (index === -1) {
    transferStore = [next, ...transferStore];
    return;
  }
  transferStore[index] = next;
}

function upsertRofr(next: ROFRExercise) {
  const index = rofrStore.findIndex((item) => item.id === next.id);
  if (index === -1) {
    rofrStore = [next, ...rofrStore];
    return;
  }
  rofrStore[index] = next;
}

export async function getSecondaryTransfers(fundId?: string): Promise<LPTransfer[]> {
  if (isMockMode('backOffice')) {
    const values = fundId ? transferStore.filter((item) => item.fundId === fundId) : transferStore;
    return clone(values);
  }

  if (!fundId) return [];
  const payload = await requestJson<LPTransfer[]>(`/funds/${fundId}/transfers`, {
    fallbackMessage: 'Failed to load secondary transfers',
  });
  return Array.isArray(payload) ? payload : [];
}

export async function getROFRExercises(fundId?: string): Promise<ROFRExercise[]> {
  if (isMockMode('backOffice')) {
    if (!fundId) return clone(rofrStore);
    const transferIds = new Set(
      transferStore.filter((item) => item.fundId === fundId).map((item) => item.id)
    );
    return clone(rofrStore.filter((item) => transferIds.has(item.transferId)));
  }

  if (!fundId) return [];
  const payload = await requestJson<ROFRExercise[]>(`/funds/${fundId}/transfers/rofr`, {
    fallbackMessage: 'Failed to load ROFR exercises',
  });
  return Array.isArray(payload) ? payload : [];
}

export async function initiateSecondaryTransfer(
  payload: Omit<LPTransfer, 'id' | 'transferNumber' | 'requestedDate' | 'documents' | 'status'>
): Promise<LPTransfer> {
  if (isMockMode('backOffice')) {
    const transfer: LPTransfer = {
      ...payload,
      id: `transfer-${Date.now()}`,
      transferNumber: `TR-${new Date().getFullYear()}-${String(transferStore.length + 1).padStart(3, '0')}`,
      requestedDate: new Date(),
      documents: [],
      status: 'draft',
    };
    transferStore = [transfer, ...transferStore];
    return clone(transfer);
  }

  const result = await requestJson<LPTransfer>(`/funds/${payload.fundId}/transfers`, {
    method: 'POST',
    body: payload,
    fallbackMessage: 'Failed to create secondary transfer',
  });
  if (!result) {
    logger.warn('Empty create transfer payload from API; using fallback', {
      component: 'secondaryTransferService',
      fundId: payload.fundId,
    });
    const fallback = buildFallbackTransfer({
      ...payload,
      id: `transfer-${Date.now()}`,
      transferNumber: `TR-${new Date().getFullYear()}-${String(transferStore.length + 1).padStart(3, '0')}`,
      requestedDate: new Date(),
      documents: [],
      status: 'draft',
    });
    upsertTransfer(fallback);
    return clone(fallback);
  }
  return result;
}

export async function reviewSecondaryTransfer(id: string): Promise<LPTransfer> {
  if (isMockMode('backOffice')) {
    const index = findTransfer(id);
    const nextStatus: TransferStatus = transferStore[index].status === 'draft'
      ? 'pending-gp-approval'
      : 'pending-legal-review';
    transferStore[index] = { ...transferStore[index], status: nextStatus };
    return clone(transferStore[index]);
  }

  const payload = await requestJson<LPTransfer>(`/transfers/${id}/review`, {
    method: 'POST',
    fallbackMessage: 'Failed to start transfer review',
  });
  if (!payload) {
    logger.warn('Empty review transfer payload from API; using fallback', {
      component: 'secondaryTransferService',
      transferId: id,
    });
    const existing = transferStore.find((item) => item.id === id);
    const nextStatus: TransferStatus = existing?.status === 'draft'
      ? 'pending-gp-approval'
      : 'pending-legal-review';
    const fallback = buildFallbackTransfer({
      ...(existing ?? {}),
      id,
      status: nextStatus,
    });
    upsertTransfer(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function approveSecondaryTransfer(id: string): Promise<LPTransfer> {
  if (isMockMode('backOffice')) {
    const index = findTransfer(id);
    transferStore[index] = { ...transferStore[index], status: 'approved', gpApprovalDate: new Date() };
    return clone(transferStore[index]);
  }

  const payload = await requestJson<LPTransfer>(`/transfers/${id}/approve`, {
    method: 'POST',
    fallbackMessage: 'Failed to approve transfer',
  });
  if (!payload) {
    logger.warn('Empty approve transfer payload from API; using fallback', {
      component: 'secondaryTransferService',
      transferId: id,
    });
    const existing = transferStore.find((item) => item.id === id);
    const fallback = buildFallbackTransfer({
      ...(existing ?? {}),
      id,
      status: 'approved',
      gpApprovalDate: new Date(),
    });
    upsertTransfer(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function rejectSecondaryTransfer(id: string, reason: string): Promise<LPTransfer> {
  if (isMockMode('backOffice')) {
    const index = findTransfer(id);
    transferStore[index] = { ...transferStore[index], status: 'rejected', rejectionReason: reason };
    return clone(transferStore[index]);
  }

  const payload = await requestJson<LPTransfer>(`/transfers/${id}/reject`, {
    method: 'POST',
    body: { reason },
    fallbackMessage: 'Failed to reject transfer',
  });
  if (!payload) {
    logger.warn('Empty reject transfer payload from API; using fallback', {
      component: 'secondaryTransferService',
      transferId: id,
    });
    const existing = transferStore.find((item) => item.id === id);
    const fallback = buildFallbackTransfer({
      ...(existing ?? {}),
      id,
      status: 'rejected',
      rejectionReason: reason,
    });
    upsertTransfer(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function completeSecondaryTransfer(id: string): Promise<LPTransfer> {
  if (isMockMode('backOffice')) {
    const index = findTransfer(id);
    transferStore[index] = {
      ...transferStore[index],
      status: 'completed',
      closingDate: new Date(),
      effectiveDate: new Date(),
    };
    return clone(transferStore[index]);
  }

  const payload = await requestJson<LPTransfer>(`/transfers/${id}/complete`, {
    method: 'POST',
    fallbackMessage: 'Failed to complete transfer',
  });
  if (!payload) {
    logger.warn('Empty complete transfer payload from API; using fallback', {
      component: 'secondaryTransferService',
      transferId: id,
    });
    const existing = transferStore.find((item) => item.id === id);
    const fallback = buildFallbackTransfer({
      ...(existing ?? {}),
      id,
      status: 'completed',
      closingDate: new Date(),
      effectiveDate: new Date(),
    });
    upsertTransfer(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function uploadTransferDocument(
  transferId: string,
  docName: string
): Promise<LPTransfer> {
  if (isMockMode('backOffice')) {
    const index = findTransfer(transferId);
    const document: TransferDocument = {
      id: `transfer-doc-${Date.now()}`,
      name: docName,
      type: 'other',
      uploadedDate: new Date(),
      uploadedBy: 'ops@vestledger.ai',
      status: 'pending',
    };
    transferStore[index] = {
      ...transferStore[index],
      documents: [...transferStore[index].documents, document],
    };
    return clone(transferStore[index]);
  }

  const payload = await requestJson<LPTransfer>(`/transfers/${transferId}/documents`, {
    method: 'POST',
    body: { name: docName },
    fallbackMessage: 'Failed to upload transfer document',
  });
  if (!payload) {
    logger.warn('Empty upload transfer document payload from API; using fallback', {
      component: 'secondaryTransferService',
      transferId,
      docName,
    });
    const existing = transferStore.find((item) => item.id === transferId);
    const fallbackDocument: TransferDocument = {
      id: `transfer-doc-${Date.now()}`,
      name: docName,
      type: 'other',
      uploadedDate: new Date(),
      uploadedBy: 'ops@vestledger.ai',
      status: 'pending',
    };
    const fallback = buildFallbackTransfer({
      ...(existing ?? {}),
      id: transferId,
      documents: [...(existing?.documents ?? []), fallbackDocument],
    });
    upsertTransfer(fallback);
    return clone(fallback);
  }
  return payload;
}

export async function exerciseTransferROFR(
  transferId: string,
  exercisedByName = 'Existing LP'
): Promise<ROFRExercise> {
  if (isMockMode('backOffice')) {
    findTransfer(transferId);
    const exercise: ROFRExercise = {
      id: `rofr-${Date.now()}`,
      transferId,
      exercisedBy: 'lp-existing',
      exercisedByName,
      exerciseDate: new Date(),
      amount: 0,
      status: 'pending',
    };
    rofrStore = [exercise, ...rofrStore];
    return clone(exercise);
  }

  const payload = await requestJson<ROFRExercise>(`/transfers/${transferId}/rofr/exercise`, {
    method: 'POST',
    body: { exercisedByName },
    fallbackMessage: 'Failed to exercise ROFR',
  });
  if (!payload) {
    logger.warn('Empty ROFR exercise payload from API; using fallback', {
      component: 'secondaryTransferService',
      transferId,
      exercisedByName,
    });
    const fallback = buildFallbackRofr({
      id: `rofr-${Date.now()}`,
      transferId,
      exercisedBy: 'lp-existing',
      exercisedByName,
      exerciseDate: new Date(),
      amount: 0,
      status: 'pending',
    });
    upsertRofr(fallback);
    return clone(fallback);
  }
  return payload;
}
