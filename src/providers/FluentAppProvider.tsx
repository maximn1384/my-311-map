import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import type { ReactNode } from 'react'

type Props = { children: ReactNode }

export function FluentAppProvider({ children }: Props) {
  return (
    <FluentProvider theme={webLightTheme}>
      {children}
    </FluentProvider>
  )
}
