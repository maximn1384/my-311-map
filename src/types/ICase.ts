export interface ICase {
  incidentid: string
  title: string
  ticketnumber: string
  /** Standard incident statuscode: 1=In Progress, 2=On Hold, 5=Problem Solved, 1000=Cancelled */
  statuscode: number
  /** 1=Question, 2=Problem, 3=Request. Null if unset on the record. */
  casetypecode: number | null
  hippo_latitude: number | null
  hippo_longitude: number | null
  createdon: string
  description: string | null
}
