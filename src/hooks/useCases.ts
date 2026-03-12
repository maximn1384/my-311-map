import { useQuery } from '@tanstack/react-query'
import { ServiceFactory } from '@/services/ServiceFactory'
import type { ICase } from '@/types/ICase'

export function useCases() {
  return useQuery<ICase[]>({
    queryKey: ['cases'],
    queryFn: () => ServiceFactory.getService().getCases(),
  })
}
