// Xrm is a global injected by the Dynamics 365 host at runtime.
// It is not available when running locally (npm run dev), so every
// call is guarded with a typeof check to fail gracefully in dev mode.

export function openCaseRecord(incidentid: string): void {
  if (typeof Xrm === 'undefined') {
    console.warn('[d365Navigation] Xrm is not available outside the D365 host. incidentid:', incidentid)
    return
  }
  void Xrm.Navigation.openForm({ entityName: 'incident', entityId: incidentid })
}

export function openNewCaseForm(): void {
  if (typeof Xrm === 'undefined') {
    console.warn('[d365Navigation] Xrm is not available outside the D365 host.')
    return
  }
  void Xrm.Navigation.openForm({ entityName: 'incident' })
}
