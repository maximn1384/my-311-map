import { Input } from '@fluentui/react-components'
import { SearchRegular } from '@fluentui/react-icons'

interface SearchBarProps {
  value: string
  onSearch: (term: string) => void
}

export function SearchBar({ value, onSearch }: SearchBarProps) {
  return (
    <Input
      style={{ width: '280px' }}
      contentBefore={<SearchRegular />}
      placeholder="Search by title or case #"
      value={value}
      onChange={(_e, data) => onSearch(data.value)}
    />
  )
}
