// Code Apps do not have Xrm injected. Navigation is done by constructing
// standard Dynamics 365 main.aspx URLs from the resolved org URL.
import { getDataverseOrgUrl } from '@/services/orgContext'

export function openCaseRecord(incidentid: string): void {
  getDataverseOrgUrl()
    .then(orgUrl => {
      window.open(
        `${orgUrl}/main.aspx?pagetype=entityrecord&etn=incident&id=${incidentid}`,
        '_blank',
      )
    })
    .catch((err: unknown) => {
      console.error('[d365Navigation] Could not resolve org URL to open case record:', err)
    })
}

export function openNewCaseForm(): void {
  getDataverseOrgUrl()
    .then(orgUrl => {
      window.open(
        `${orgUrl}/main.aspx?pagetype=entityrecord&etn=incident`,
        '_blank',
      )
    })
    .catch((err: unknown) => {
      console.error('[d365Navigation] Could not resolve org URL to open new case form:', err)
    })
}
