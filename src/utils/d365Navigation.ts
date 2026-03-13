// Code Apps do not have Xrm injected. Navigation uses standard D365 main.aspx
// URLs built from VITE_ORG_URL and VITE_D365_APP_ID (set in .env.production).
const ORG_URL = import.meta.env.VITE_ORG_URL as string | undefined
const APP_ID = import.meta.env.VITE_D365_APP_ID as string | undefined

function buildBase(): string | null {
  if (!ORG_URL) {
    console.warn('[d365Navigation] VITE_ORG_URL is not set.')
    return null
  }
  const base = `${ORG_URL}/main.aspx?`
  return APP_ID ? `${base}appid=${APP_ID}&` : base
}

export function openCaseRecord(incidentid: string): void {
  const base = buildBase()
  if (!base) return
  window.open(`${base}pagetype=entityrecord&etn=incident&id=${incidentid}`, '_blank')
}

export function openNewCaseForm(): void {
  const base = buildBase()
  if (!base) return
  window.open(`${base}pagetype=entityrecord&etn=incident`, '_blank')
}
