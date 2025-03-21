import { Moon, Sun } from 'lucide-react';

import { Button } from '@/view/components/ui/';
import { useThemeContext } from '@/utils/contexts';

export default function ThemeButton() {
  const themeContext = useThemeContext();

  const toggleTheme = () => {
    themeContext.updateTheme({
      ...themeContext.theme,
      layoutTheme: themeContext.theme.layoutTheme === 'dark' ? 'light' : 'dark'
    });
  };

  return (
    <Button variant='secondary' onClick={() => toggleTheme()} className='rounded-md h-9 w-9'>
      {themeContext.theme.layoutTheme !== 'light' ? (
        <Moon className='w-4 h-4' />
      ) : (
        <Sun className='w-4 h-4' />
      )}
    </Button>
  );
}
