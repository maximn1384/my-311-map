// Xrm is a global injected by the Dynamics 365 host at runtime.
// It is not available when running locally (npm run dev), so every
// call is guarded with a typeof check to fail gracefully in dev mode.

export function openCaseRecord(incidentid: string): void {
  if (typeof Xrm === 'undefined') {
    console.warn('[d365Navigation] Xrm is not available outside the D365 host. incidentid:', incidentid)
    return
  }
  Xrm.Navigation.openForm({ entityName: 'incident', entityId: incidentid }).then(
    () => { console.log('[d365Navigation] Case record opened:', incidentid) },
    (err: unknown) => { console.error('[d365Navigation] openForm failed for case record:', err) },
  )
}

export function openNewCaseForm(): void {
  if (typeof Xrm === 'undefined') {
    console.warn('[d365Navigation] Xrm is not available outside the D365 host.')
    return
  }
  console.log('[d365Navigation] Opening new case form via Xrm.Navigation.openForm')
  Xrm.Navigation.openForm({ entityName: 'incident' }).then(
    () => { console.log('[d365Navigation] New case form closed') },
    (err: unknown) => { console.error('[d365Navigation] openForm failed for new case:', err) },
  )
}
