"use client";

import { useState } from "react";
import { Badge, Button, Card, Input, Select, Textarea } from "@/ui";
import type { LPBankDetails } from "@/data/mocks/lp-portal/lp-investor-portal";
import { formatDate } from "@/utils/formatting";
import { CheckCircle } from "lucide-react";
import { SectionHeader } from "@/ui/composites";

export interface BankDetailsFormProps {
  details: LPBankDetails;
}

type BankDetailsFormState = {
  accountName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  iban: string;
  accountType: "checking" | "savings";
  currency: "USD" | "EUR" | "GBP";
  country: string;
  notes: string;
};

export function BankDetailsForm({ details }: BankDetailsFormProps) {
  const [form, setForm] = useState<BankDetailsFormState>({
    accountName: details.accountName,
    bankName: details.bankName,
    accountNumber: details.accountNumber,
    routingNumber: details.routingNumber,
    swiftCode: details.swiftCode || "",
    iban: details.iban || "",
    accountType: details.accountType,
    currency: details.currency,
    country: details.country,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.accountName.trim()) nextErrors.accountName = "Account name is required.";
    if (!form.bankName.trim()) nextErrors.bankName = "Bank name is required.";
    if (!form.accountNumber.trim()) nextErrors.accountNumber = "Account number is required.";
    if (!form.routingNumber.trim()) nextErrors.routingNumber = "Routing number is required.";
    if (!form.country.trim()) nextErrors.country = "Country is required.";

    setErrors(nextErrors);
    setSaved(Object.keys(nextErrors).length === 0);
  };

  return (
    <Card padding="lg">
      <SectionHeader
        title="Bank Details"
        description="Update wire instructions for future distributions."
        action={(
          <Badge
            size="sm"
            variant="flat"
            className={
              details.verified
                ? "bg-[var(--app-success-bg)] text-[var(--app-success)]"
                : "bg-[var(--app-warning-bg)] text-[var(--app-warning)]"
            }
          >
            {details.verified ? "Verified" : "Pending verification"}
          </Badge>
        )}
      />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Input
          label="Account name"
          value={form.accountName}
          onChange={(event) => setForm({ ...form, accountName: event.target.value })}
          isInvalid={Boolean(errors.accountName)}
          errorMessage={errors.accountName}
        />
        <Input
          label="Bank name"
          value={form.bankName}
          onChange={(event) => setForm({ ...form, bankName: event.target.value })}
          isInvalid={Boolean(errors.bankName)}
          errorMessage={errors.bankName}
        />
        <Input
          label="Account number"
          value={form.accountNumber}
          onChange={(event) => setForm({ ...form, accountNumber: event.target.value })}
          isInvalid={Boolean(errors.accountNumber)}
          errorMessage={errors.accountNumber}
        />
        <Input
          label="Routing number"
          value={form.routingNumber}
          onChange={(event) => setForm({ ...form, routingNumber: event.target.value })}
          isInvalid={Boolean(errors.routingNumber)}
          errorMessage={errors.routingNumber}
        />
        <Input
          label="SWIFT code"
          value={form.swiftCode}
          onChange={(event) => setForm({ ...form, swiftCode: event.target.value })}
        />
        <Input
          label="IBAN"
          value={form.iban}
          onChange={(event) => setForm({ ...form, iban: event.target.value })}
        />
        <Select
          label="Account type"
          selectedKeys={[form.accountType]}
          onChange={(event) =>
            setForm({ ...form, accountType: event.target.value as BankDetailsFormState["accountType"] })
          }
          options={[
            { value: "checking", label: "Checking" },
            { value: "savings", label: "Savings" },
          ]}
        />
        <Select
          label="Currency"
          selectedKeys={[form.currency]}
          onChange={(event) =>
            setForm({ ...form, currency: event.target.value as BankDetailsFormState["currency"] })
          }
          options={[
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
            { value: "GBP", label: "GBP" },
          ]}
        />
        <Input
          label="Country"
          value={form.country}
          onChange={(event) => setForm({ ...form, country: event.target.value })}
          isInvalid={Boolean(errors.country)}
          errorMessage={errors.country}
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Notes or special instructions"
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          minRows={3}
          placeholder="Optional notes for the fund admin team."
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[var(--app-text-muted)]">
          Last updated {formatDate(details.lastUpdated)}
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1 text-xs text-[var(--app-success)]">
              <CheckCircle className="h-3 w-3" />
              Changes saved
            </div>
          )}
          <Button color="primary" onPress={handleSave}>
            Save changes
          </Button>
        </div>
      </div>
    </Card>
  );
}
