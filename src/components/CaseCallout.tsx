import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Text,
  Badge,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { OpenRegular } from '@fluentui/react-icons'
import { getCaseTypeLabel } from '@/constants/caseTypeColors'
import type { ICase } from '@/types/ICase'

const STATUS_LABELS: Record<number, string> = {
  1: 'In Progress',
  2: 'On Hold',
  3: 'Waiting for Details',
  4: 'Researching',
  5: 'Problem Solved',
  1000: 'Cancelled',
}

type CaseBadgeColor = 'brand' | 'danger' | 'success' | 'subtle'

function getCaseBadgeColor(casetypecode: number | null): CaseBadgeColor {
  switch (casetypecode) {
    case 1: return 'brand'
    case 2: return 'danger'
    case 3: return 'success'
    default: return 'subtle'
  }
}

const useStyles = makeStyles({
  meta: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: tokens.spacingVerticalS,
  },
  description: {
    display: 'block',
    marginTop: tokens.spacingVerticalS,
  },
})

interface CaseCalloutProps {
  incident: ICase | null
  onClose: () => void
}

export function CaseCallout({ incident, onClose }: CaseCalloutProps) {
  const styles = useStyles()
  return (
    <Dialog
      open={incident !== null}
      onOpenChange={(_e, data) => {
        if (!data.open) onClose()
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{incident?.title ?? ''}</DialogTitle>
          <DialogContent>
            <div className={styles.meta}>
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                {incident?.ticketnumber}
              </Text>
              <Badge
                appearance="filled"
                color={getCaseBadgeColor(incident?.casetypecode ?? null)}
              >
                {getCaseTypeLabel(incident?.casetypecode ?? null)}
              </Badge>
              <Text size={200}>
                {STATUS_LABELS[incident?.statuscode ?? 0] ?? 'Unknown'}
              </Text>
            </div>
            {incident?.description && (
              <Text className={styles.description}>{incident.description}</Text>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              icon={<OpenRegular />}
              onClick={() => {
                console.log('TODO Phase 5: Open in D365', incident?.incidentid)
              }}
            >
              Open in Dynamics 365
            </Button>
            <Button appearance="secondary" onClick={onClose}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
