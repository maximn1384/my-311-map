import type { ICase } from '@/types/ICase'

export interface ICaseService {
  getCases(searchTerm?: string): Promise<ICase[]>
}
