import {
  type CreateFeeStructureType,
  createFeeStructureDto,
  type DeleteFeeStructureType,
  deleteFeeStructureDto,
  type GetFeeStructuresType,
  type GetInvoicesType,
  getFeeStructuresDto,
  getInvoicesDto,
  type IssueInvoiceType,
  issueInvoiceDto,
  type RecordPaymentType,
  recordPaymentDto,
  type WaiveInvoiceType,
  waiveInvoiceDto,
} from '@ecomerece/shared';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feeService } from './fee.service';

export const FEE_QUERY_KEY = ['fees'];

export function useGetFeeStructures(params: GetFeeStructuresType) {
  return useQuery({
    queryKey: [...FEE_QUERY_KEY, 'structures', params],
    queryFn: () => feeService.getStructures(getFeeStructuresDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetInvoices(params: GetInvoicesType) {
  return useQuery({
    queryKey: [...FEE_QUERY_KEY, 'invoices', params],
    queryFn: () => feeService.getInvoices(getInvoicesDto.parse(params)),
    placeholderData: (prev) => prev,
  });
}

export function useGetPayments(invoiceId: string) {
  return useQuery({
    queryKey: [...FEE_QUERY_KEY, 'payments', invoiceId],
    queryFn: () => feeService.getPayments({ invoiceId }),
    enabled: Boolean(invoiceId),
  });
}

function applyFeeMutationResult(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: FEE_QUERY_KEY });
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFeeStructureType) =>
      feeService.createStructure(createFeeStructureDto.parse(data)),
    onSuccess: () => applyFeeMutationResult(queryClient),
  });
}

export function useSoftDeleteFeeStructure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DeleteFeeStructureType) =>
      feeService.deleteStructure(deleteFeeStructureDto.parse(data)),
    onSuccess: () => applyFeeMutationResult(queryClient),
  });
}

export function useIssueInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IssueInvoiceType) => feeService.issueInvoice(issueInvoiceDto.parse(data)),
    onSuccess: () => applyFeeMutationResult(queryClient),
  });
}

export function useWaiveInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WaiveInvoiceType) => feeService.waiveInvoice(waiveInvoiceDto.parse(data)),
    onSuccess: () => applyFeeMutationResult(queryClient),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordPaymentType) => feeService.recordPayment(recordPaymentDto.parse(data)),
    onSuccess: () => applyFeeMutationResult(queryClient),
  });
}
