import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import LanguageButton from '@/components/LanguageButton'
import { LayoutSidebar } from '@/components/LayoutSidebar'
import ThemeButton from '@/components/ThemeButton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function Layout() {
  const { t } = useTranslation()

  return (
    <SidebarProvider>
      <LayoutSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 min-h-6" />
          </div>
          <div className="flex justify-end items-center w-full px-4 gap-2">
            <ThemeButton />
            <LanguageButton />
            <Avatar className="h-9 w-9 rounded-md">
              <AvatarImage src="LOCALSTORAGE" alt="LOCALSTORAGE" />
              <AvatarFallback className="rounded-md">{t('CN')}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <div className="px-4 pb-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
