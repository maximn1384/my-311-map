import type { ICaseService } from './ICaseService'
import type { ICase } from '@/types/ICase'

const MOCK_CASES: ICase[] = [
  {
    incidentid: '00000000-0000-0000-0000-000000000001',
    title: 'Pothole on 1st Ave',
    ticketnumber: 'CAS-10001-A1B2C3',
    statuscode: 1,
    casetypecode: 2,
    hippo_latitude: 47.6082,
    hippo_longitude: -122.3352,
    createdon: '2026-02-15T08:30:00Z',
    description: 'Large pothole causing vehicle damage near the intersection with Pike St.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000002',
    title: 'Broken street light near Central Park',
    ticketnumber: 'CAS-10002-D4E5F6',
    statuscode: 1,
    casetypecode: 2,
    hippo_latitude: 47.6205,
    hippo_longitude: -122.3493,
    createdon: '2026-02-20T10:00:00Z',
    description: 'Street light has been out for two weeks, creating safety concerns at night.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000003',
    title: 'Graffiti on public building',
    ticketnumber: 'CAS-10003-G7H8I9',
    statuscode: 2,
    casetypecode: 3,
    hippo_latitude: 47.6037,
    hippo_longitude: -122.3300,
    createdon: '2026-02-18T14:15:00Z',
    description: 'Graffiti on the east wall of the public library, visible from the main road.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000004',
    title: 'Garbage collection missed',
    ticketnumber: 'CAS-10004-J1K2L3',
    statuscode: 5,
    casetypecode: 3,
    hippo_latitude: 47.6155,
    hippo_longitude: -122.3415,
    createdon: '2026-02-22T09:00:00Z',
    description: 'Scheduled garbage collection was skipped for the third consecutive week.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000005',
    title: 'Noise complaint - construction at night',
    ticketnumber: 'CAS-10005-M4N5O6',
    statuscode: 1,
    casetypecode: 1,
    hippo_latitude: 47.6110,
    hippo_longitude: -122.3280,
    createdon: '2026-03-01T21:00:00Z',
    description: 'Construction activity occurring after 10pm, violating noise ordinances.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000006',
    title: 'Water main leak on 5th Ave',
    ticketnumber: 'CAS-10006-P7Q8R9',
    statuscode: 1,
    casetypecode: 2,
    hippo_latitude: 47.6055,
    hippo_longitude: -122.3368,
    createdon: '2026-03-05T07:45:00Z',
    description: 'Water bubbling up through the pavement on 5th Ave. Possible main break.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000007',
    title: 'Fallen tree blocking sidewalk',
    ticketnumber: 'CAS-10007-S1T2U3',
    statuscode: 5,
    casetypecode: 2,
    hippo_latitude: 47.6180,
    hippo_longitude: -122.3260,
    createdon: '2026-02-28T11:30:00Z',
    description: 'Large oak tree fell during last storm, completely blocking the north sidewalk.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000008',
    title: 'Request for new bench at bus stop',
    ticketnumber: 'CAS-10008-V4W5X6',
    statuscode: 2,
    casetypecode: 3,
    hippo_latitude: 47.6130,
    hippo_longitude: -122.3440,
    createdon: '2026-02-10T13:00:00Z',
    description: 'Residents requesting a bench at the heavily used transit stop on Westlake.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000009',
    title: 'Illegal dumping near riverbank',
    ticketnumber: 'CAS-10009-Y7Z8A1',
    statuscode: 1,
    casetypecode: 2,
    hippo_latitude: 47.5996,
    hippo_longitude: -122.3318,
    createdon: '2026-03-08T16:00:00Z',
    description: 'Large pile of construction waste illegally dumped near the south riverbank.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000010',
    title: 'Crosswalk markings faded on Broadway',
    ticketnumber: 'CAS-10010-B2C3D4',
    statuscode: 1,
    casetypecode: 3,
    hippo_latitude: 47.6218,
    hippo_longitude: -122.3205,
    createdon: '2026-03-03T09:30:00Z',
    description: 'Pedestrian crosswalk lines barely visible, creating a safety hazard.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000011',
    title: 'Park restroom door broken',
    ticketnumber: 'CAS-10011-E5F6G7',
    statuscode: 2,
    casetypecode: 2,
    hippo_latitude: 47.6092,
    hippo_longitude: -122.3532,
    createdon: '2026-03-07T14:20:00Z',
    description: 'Main restroom at Volunteer Park has a broken lock, door cannot close properly.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000012',
    title: 'Question about recycling schedule change',
    ticketnumber: 'CAS-10012-H8I9J1',
    statuscode: 5,
    casetypecode: 1,
    hippo_latitude: 47.6145,
    hippo_longitude: -122.3175,
    createdon: '2026-02-25T10:00:00Z',
    description: 'Resident asking about the updated recycling pick-up schedule for the district.',
  },
  {
    incidentid: '00000000-0000-0000-0000-000000000013',
    title: 'Overgrown vegetation blocking stop sign',
    ticketnumber: 'CAS-10013-K2L3M4',
    statuscode: 1,
    casetypecode: 2,
    hippo_latitude: 47.6072,
    hippo_longitude: -122.3450,
    createdon: '2026-03-10T08:00:00Z',
    description: 'Tree branches obscuring the stop sign at the corner of 3rd and Union.',
  },
]

export class MockCaseService implements ICaseService {
  async getCases(searchTerm?: string): Promise<ICase[]> {
    // Simulate network latency
    await new Promise<void>(resolve => setTimeout(resolve, 400))

    if (!searchTerm) return MOCK_CASES

    const lower = searchTerm.toLowerCase()
    return MOCK_CASES.filter(
      c =>
        c.title.toLowerCase().includes(lower) ||
        c.ticketnumber.toLowerCase().includes(lower),
    )
  }
}
