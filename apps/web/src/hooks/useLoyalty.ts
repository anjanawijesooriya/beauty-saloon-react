import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export interface LoyaltyTransaction {
  id: string
  points: number
  reason: string
  createdAt: string
}

export interface LoyaltyBalance {
  balance: number
  transactions: LoyaltyTransaction[]
}

export const useLoyaltyBalance = () =>
  useQuery<LoyaltyBalance>({
    queryKey: ['loyalty-balance'],
    queryFn: () => api.get('/loyalty/balance').then((r) => r.data),
  })

export const useLoyaltyTransactions = () =>
  useQuery<LoyaltyTransaction[]>({
    queryKey: ['loyalty-transactions'],
    queryFn: () => api.get('/loyalty/transactions').then((r) => r.data),
  })

export const useRedeemLoyalty = () =>
  useMutation({
    mutationFn: (points: number) => api.post('/loyalty/redeem', { points }).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-balance'] })
      toast.success(`Redeemed! LKR ${data.discountLKR} discount applied`)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Redemption failed'),
  })

export const useLoyaltyLeaderboard = () =>
  useQuery<{ id: string; balance: number; user: { name: string; email: string } }[]>({
    queryKey: ['loyalty-leaderboard'],
    queryFn: () => api.get('/loyalty/leaderboard').then((r) => r.data),
  })
