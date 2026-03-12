import { Button } from '@fluentui/react-components'
import { AddRegular } from '@fluentui/react-icons'

interface CreateCaseButtonProps {
  onClick: () => void
}

export function CreateCaseButton({ onClick }: CreateCaseButtonProps) {
  return (
    <Button
      appearance="primary"
      icon={<AddRegular />}
      onClick={onClick}
    >
      New Case
    </Button>
  )
}
