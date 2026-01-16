import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { NextUIProvider } from "@nextui-org/react";
import { DistributionWizard } from "@/components/fund-admin/distributions/distribution-wizard";
import { rootReducer } from "@/store/rootReducer";
import { ToastProvider } from "@/ui";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/fund-admin/distributions/new",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/useAsyncData", () => ({
  useAsyncData: () => ({
    data: null,
    status: "succeeded",
    error: undefined,
    refetch: vi.fn(),
    isInitialLoad: false,
    isLoading: false,
    isSucceeded: true,
    isFailed: false,
  }),
}));

vi.mock("@/hooks/useDistributionDraft", () => ({
  useDistributionDraft: () => ({
    saveDraft: vi.fn(),
    clearDraft: vi.fn(),
    isDirty: false,
  }),
}));

const renderWizard = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
  });

  return render(
    <Provider store={store}>
      <NextUIProvider>
        <ToastProvider>
          <DistributionWizard />
        </ToastProvider>
      </NextUIProvider>
    </Provider>
  );
};

describe("DistributionWizard validation", () => {
  it("shows validation errors and blocks progression on required fields", () => {
    renderWizard();

    fireEvent.click(
      screen.getByRole("button", { name: /save & continue/i })
    );

    expect(screen.getAllByText("Name is required.").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Gross proceeds must be greater than zero.").length
    ).toBeGreaterThan(0);
    expect(screen.getByText("Distribution Event")).toBeInTheDocument();
    expect(screen.queryByText("Fees & Expenses")).not.toBeInTheDocument();
  });
});
