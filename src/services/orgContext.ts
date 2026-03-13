import { MicrosoftDataverseService } from '@/generated/services/MicrosoftDataverseService'

let cachedOrgUrl: string | null = null

/**
 * Returns the Dataverse organization URL (e.g. https://myorg.crm.dynamics.com).
 * Result is cached after the first successful call.
 */
export async function getDataverseOrgUrl(): Promise<string> {
  if (cachedOrgUrl) return cachedOrgUrl
  const result = await MicrosoftDataverseService.GetOrganizations()
  if (!result.success) {
    throw new Error(result.error?.message ?? 'Failed to get Dataverse organization URL')
  }
  const url = result.data.value?.[0]?.Url
  if (!url) throw new Error('No Dataverse organization returned by GetOrganizations')
  cachedOrgUrl = url
  return url
}
