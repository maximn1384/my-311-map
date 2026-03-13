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
  async getCases(searchTerm?: string): Promise<ICase[]> {
    let filter = BASE_FILTER

    if (searchTerm) {
      // Escape single quotes for OData string literals
      const escaped = searchTerm.replace(/'/g, "''")
      filter += ` and (contains(title,'${escaped}') or contains(ticketnumber,'${escaped}'))`
    }

    const result = await MicrosoftDataverseService.ListRecords(
      'incident',
      undefined, // prefer
      undefined, // accept
      undefined, // x_ms_odata_metadata_full
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

    return (result.data.value ?? []).map(item => {
      // The SDK types surface Dataverse fields via `dynamicProperties` but at
      // runtime the fields are directly on the item object — cast accordingly.
      const p = item as unknown as Record<string, unknown>
      return {
        incidentid: String(p['incidentid'] ?? ''),
        title: String(p['title'] ?? ''),
        ticketnumber: String(p['ticketnumber'] ?? ''),
        statuscode: Number(p['statuscode'] ?? 0),
        casetypecode: p['casetypecode'] != null ? Number(p['casetypecode']) : null,
        hippo_latitude: p['hippo_latitude'] != null ? Number(p['hippo_latitude']) : null,
        hippo_longitude: p['hippo_longitude'] != null ? Number(p['hippo_longitude']) : null,
        createdon: String(p['createdon'] ?? ''),
        description: p['description'] != null ? String(p['description']) : null,
      }
    })
  }
}
