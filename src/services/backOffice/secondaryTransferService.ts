import {
  mockROFRExercises,
  mockSecondaryTransfers,
} from '@/data/mocks/back-office/fund-admin-ops';
import type {
  LPTransfer,
  ROFRExercise,
  TransferDocument,
  TransferStatus,
} from '@/types/fundAdminOps';

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

export async function getSecondaryTransfers(fundId?: string): Promise<LPTransfer[]> {
  const values = fundId ? transferStore.filter((item) => item.fundId === fundId) : transferStore;
  return clone(values);
}

export async function getROFRExercises(fundId?: string): Promise<ROFRExercise[]> {
  if (!fundId) {
    return clone(rofrStore);
  }

  const transferIds = new Set(
    transferStore.filter((item) => item.fundId === fundId).map((item) => item.id)
  );

  return clone(rofrStore.filter((item) => transferIds.has(item.transferId)));
}

export async function initiateSecondaryTransfer(
  payload: Omit<LPTransfer, 'id' | 'transferNumber' | 'requestedDate' | 'documents' | 'status'>
): Promise<LPTransfer> {
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

export async function reviewSecondaryTransfer(id: string): Promise<LPTransfer> {
  const index = findTransfer(id);
  const nextStatus: TransferStatus = transferStore[index].status === 'draft'
    ? 'pending-gp-approval'
    : 'pending-legal-review';

  transferStore[index] = {
    ...transferStore[index],
    status: nextStatus,
  };

  return clone(transferStore[index]);
}

export async function approveSecondaryTransfer(id: string): Promise<LPTransfer> {
  const index = findTransfer(id);
  transferStore[index] = {
    ...transferStore[index],
    status: 'approved',
    gpApprovalDate: new Date(),
  };

  return clone(transferStore[index]);
}

export async function rejectSecondaryTransfer(
  id: string,
  reason: string
): Promise<LPTransfer> {
  const index = findTransfer(id);
  transferStore[index] = {
    ...transferStore[index],
    status: 'rejected',
    rejectionReason: reason,
  };

  return clone(transferStore[index]);
}

export async function completeSecondaryTransfer(id: string): Promise<LPTransfer> {
  const index = findTransfer(id);
  transferStore[index] = {
    ...transferStore[index],
    status: 'completed',
    closingDate: new Date(),
    effectiveDate: new Date(),
  };

  return clone(transferStore[index]);
}

export async function uploadTransferDocument(
  transferId: string,
  docName: string
): Promise<LPTransfer> {
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

export async function exerciseTransferROFR(
  transferId: string,
  exercisedByName = 'Existing LP'
): Promise<ROFRExercise> {
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
