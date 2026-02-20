export interface AuditEvent {
  id: string;
  txHash: string;
  blockNumber: number;
  timestamp: Date;
  eventType:
    | 'ownership_transfer'
    | 'capital_call'
    | 'distribution'
    | 'valuation_update'
    | 'document_hash'
    | 'compliance_attestation';
  description: string;
  parties: string[];
  amount?: number;
  verificationStatus: 'verified' | 'pending' | 'failed';
  proofHash: string;
}

const MOCK_NOW = new Date('2025-01-01T12:00:00.000Z').getTime();

export const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    txHash: '0x7f9a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
    blockNumber: 18234567,
    timestamp: new Date(MOCK_NOW - 2 * 60 * 60 * 1000),
    eventType: 'capital_call',
    description: 'Capital Call #8 - Fund II initiated',
    parties: ['Quantum Ventures Fund II', '12 LPs'],
    amount: 15000000,
    verificationStatus: 'verified',
    proofHash: '0xproof1234567890abcdef',
  },
  {
    id: '2',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2',
    blockNumber: 18234520,
    timestamp: new Date(MOCK_NOW - 24 * 60 * 60 * 1000),
    eventType: 'ownership_transfer',
    description: 'Series B shares transferred to CloudScale Holdings',
    parties: ['CloudScale Inc.', 'Quantum Ventures Fund II'],
    amount: 5000000,
    verificationStatus: 'verified',
    proofHash: '0xproof2345678901bcdef0',
  },
  {
    id: '3',
    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
    blockNumber: 18234450,
    timestamp: new Date(MOCK_NOW - 3 * 24 * 60 * 60 * 1000),
    eventType: 'distribution',
    description: 'Distribution #5 - CloudScale exit proceeds',
    parties: ['Quantum Ventures Fund II', '12 LPs'],
    amount: 8500000,
    verificationStatus: 'verified',
    proofHash: '0xproof3456789012cdef01',
  },
  {
    id: '4',
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
    blockNumber: 18234400,
    timestamp: new Date(MOCK_NOW - 5 * 24 * 60 * 60 * 1000),
    eventType: 'valuation_update',
    description: 'Q4 2024 NAV update recorded',
    parties: ['Quantum Ventures Fund II'],
    verificationStatus: 'verified',
    proofHash: '0xproof4567890123def012',
  },
  {
    id: '5',
    txHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
    blockNumber: 18234350,
    timestamp: new Date(MOCK_NOW - 7 * 24 * 60 * 60 * 1000),
    eventType: 'document_hash',
    description: 'LPA Amendment v2.1 hash recorded',
    parties: ['Quantum Ventures GP LLC'],
    verificationStatus: 'verified',
    proofHash: '0xproof5678901234ef0123',
  },
  {
    id: '6',
    txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
    blockNumber: 18234300,
    timestamp: new Date(MOCK_NOW - 10 * 24 * 60 * 60 * 1000),
    eventType: 'compliance_attestation',
    description: 'Annual compliance certification recorded',
    parties: ['Independent Auditor LLC', 'Quantum Ventures Fund II'],
    verificationStatus: 'verified',
    proofHash: '0xproof6789012345f01234',
  },
];
