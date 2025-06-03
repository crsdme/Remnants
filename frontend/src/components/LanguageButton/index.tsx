import { Languages } from 'lucide-react'

import { Button } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useThemeContext } from '@/utils/contexts'

export default function LanguageButton() {
  const themeContext = useThemeContext()

  const selectLanguage = (language: string) => {
    themeContext.updateTheme({
      ...themeContext.theme,
      language,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="rounded-md h-9 w-9">
          <Languages className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => selectLanguage('en')}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => selectLanguage('ru')}>Русский</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
