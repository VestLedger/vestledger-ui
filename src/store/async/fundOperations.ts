import {
  archiveFundFailed,
  archiveFundSucceeded,
  closeFundFailed,
  closeFundSucceeded,
  createFundFailed,
  createFundSucceeded,
  fundsFailed,
  fundsLoaded,
  unarchiveFundFailed,
  unarchiveFundSucceeded,
  updateFundFailed,
  updateFundSucceeded,
  type CreateFundParams,
  type GetFundsParams,
} from "@/store/slices/fundSlice";
import {
  archiveFundLocal,
  closeFund,
  createFund as createFundService,
  fetchFunds as fetchFundsService,
  unarchiveFundLocal,
  updateFund as updateFundService,
} from "@/services/fundsService";
import { createLatestOperation } from "@/store/async/createLatestOperation";
import type { Fund } from "@/types/fund";

export const loadFundsOperation = createLatestOperation<
  GetFundsParams,
  { funds: Fund[] }
>({
  typePrefix: "fund/load",
  requestType: "fund/fundsRequested",
  run: async ({ arg }) => {
    const funds = await fetchFundsService(arg);
    return { funds };
  },
  onSuccess: (result) => fundsLoaded(result),
  onFailure: (error) => fundsFailed(error),
});

export const createFundOperation = createLatestOperation<
  CreateFundParams,
  Fund
>({
  typePrefix: "fund/create",
  requestType: "fund/createFundRequested",
  run: async ({ arg }) => createFundService(arg),
  onSuccess: (result) => createFundSucceeded(result),
  onFailure: (error) => createFundFailed(error),
});

export const updateFundOperation = createLatestOperation<
  { fundId: string; data: Partial<CreateFundParams> },
  Fund
>({
  typePrefix: "fund/update",
  requestType: "fund/updateFundRequested",
  run: async ({ arg }) => updateFundService(arg.fundId, arg.data),
  onSuccess: (result) => updateFundSucceeded(result),
  onFailure: (error) => updateFundFailed(error),
});

export const closeFundOperation = createLatestOperation<
  { fundId: string },
  Fund
>({
  typePrefix: "fund/close",
  requestType: "fund/closeFundRequested",
  run: async ({ arg }) => closeFund(arg.fundId),
  onSuccess: (result) => closeFundSucceeded(result),
  onFailure: (error) => closeFundFailed(error),
});

export const archiveFundOperation = createLatestOperation<
  { fundId: string },
  { fundId: string }
>({
  typePrefix: "fund/archive",
  requestType: "fund/archiveFundRequested",
  run: async ({ arg }) => archiveFundLocal(arg.fundId),
  onSuccess: (result) => archiveFundSucceeded(result),
  onFailure: (error) => archiveFundFailed(error),
});

export const unarchiveFundOperation = createLatestOperation<
  { fundId: string },
  { fundId: string }
>({
  typePrefix: "fund/unarchive",
  requestType: "fund/unarchiveFundRequested",
  run: async ({ arg }) => unarchiveFundLocal(arg.fundId),
  onSuccess: (result) => unarchiveFundSucceeded(result),
  onFailure: (error) => unarchiveFundFailed(error),
});
