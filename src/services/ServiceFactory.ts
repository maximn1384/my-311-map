import { MockCaseService } from './MockCaseService'
import { DataverseCaseService } from './DataverseCaseService'
import type { ICaseService } from './ICaseService'

// Use mock data in dev unless the env flag explicitly opts into live data.
// Set VITE_USE_MOCK=false in your .env.local to hit live Dataverse while in dev mode.
const useMock =
  import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== 'false'

let instance: ICaseService | null = null

export const ServiceFactory = {
  getService(): ICaseService {
    if (!instance) {
      instance = useMock ? new MockCaseService() : new DataverseCaseService()
    }
    return instance
  },
}
