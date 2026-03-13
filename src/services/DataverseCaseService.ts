import { MicrosoftDataverseService } from '@/generated/services/MicrosoftDataverseService'
import type { ICaseService } from './ICaseService'
import type { ICase } from '@/types/ICase'

const SELECT_FIELDS = [
  'incidentid',
  'title',
  'ticketnumber',
  'statuscode',
  'casetypecode',
  'hippo_latitude',
  'hippo_longitude',
  'createdon',
  'description',
].join(',')

const BASE_FILTER = 'hippo_latitude ne null and hippo_longitude ne null'
const TOP = 500

export class DataverseCaseService implements ICaseService {
  // Cached org URL — resolved once via GetOrganizations then reused.
  private static orgUrl: string | null = null

  private static async getOrgUrl(): Promise<string> {
    if (DataverseCaseService.orgUrl) {
      return DataverseCaseService.orgUrl
    }
    const result = await MicrosoftDataverseService.GetOrganizations()
    if (!result.success) {
      throw new Error(result.error?.message ?? 'Failed to get Dataverse organizations')
    }
    const url = result.data.value?.[0]?.Url
    if (!url) {
      throw new Error('No Dataverse organization returned by GetOrganizations')
    }
    DataverseCaseService.orgUrl = url
    return url
  }

  async getCases(searchTerm?: string): Promise<ICase[]> {
    let filter = BASE_FILTER

    if (searchTerm) {
      // Escape single quotes for OData string literals
      const escaped = searchTerm.replace(/'/g, "''")
      filter += ` and (contains(title,'${escaped}') or contains(ticketnumber,'${escaped}'))`
    }

    const orgUrl = await DataverseCaseService.getOrgUrl()

    const result = await MicrosoftDataverseService.ListRecordsWithOrganization(
      orgUrl,
      'incident',
      undefined, // prefer
      undefined, // accept
      undefined, // x_ms_odata_metadata_full
      undefined, // MSCRM_IncludeMipSensitivityLabel
      SELECT_FIELDS,
      filter,
      'createdon desc',
      undefined, // $expand
      undefined, // fetchXml
      TOP,
    )

    if (!result.success) {
      throw new Error(result.error?.message ?? 'Failed to fetch cases from Dataverse')
    }

    // ListRecordsWithOrganization returns Record<string,unknown>; the actual
    // OData response has a `value` array of record objects.
    const data = result.data as { value?: Record<string, unknown>[] }

    return (data.value ?? []).map(p => ({
      incidentid: String(p['incidentid'] ?? ''),
      title: String(p['title'] ?? ''),
      ticketnumber: String(p['ticketnumber'] ?? ''),
      statuscode: Number(p['statuscode'] ?? 0),
      casetypecode: p['casetypecode'] != null ? Number(p['casetypecode']) : null,
      hippo_latitude: p['hippo_latitude'] != null ? Number(p['hippo_latitude']) : null,
      hippo_longitude: p['hippo_longitude'] != null ? Number(p['hippo_longitude']) : null,
      createdon: String(p['createdon'] ?? ''),
      description: p['description'] != null ? String(p['description']) : null,
    }))
  }
}
