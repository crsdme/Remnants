import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRequestUserRoles } from '@/api/hooks/userRoles/useRequestUserRoles'
import { AsyncSelect } from '@/components/AsyncSelect'

import { ImportButton } from '@/components/ImportButton'
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useUserContext } from '@/contexts'
import { downloadCsv } from '@/utils/helpers/download'

export function ActionBar() {
  const { t, i18n } = useTranslation()
  const userContext = useUserContext()
  const [file, setFile] = useState<File | null>(null)
  const [search, setSearch] = useState('')

  const requestUserRoles = useRequestUserRoles(
    { pagination: { full: true }, filters: { names: search, active: [true], language: i18n.language } },
  )

  const onSubmit = (values) => {
    userContext.submitUserForm(values)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleDownloadTemplate = () => {
    const headers = [
      'name',
      'login',
      'password',
      'active',
    ]

    const row = [
      'name',
      'login',
      'password',
      'active',
    ]

    const csv = [headers, row].map(r => r.join(',')).join('\n')
    downloadCsv(csv, 'users-template.csv', false)
  }

  const onImport = async () => {
    const formData = new FormData()
    formData.append('file', file)
    userContext.importUsers(formData)
    setFile(null)
  }

  const isLoading = userContext.isLoading

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.users.title')}</h2>
        <p className="text-muted-foreground">{t('page.users.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <ImportButton
          handleFileChange={handleFileChange}
          handleDownloadTemplate={handleDownloadTemplate}
          isFileSelected={!!file}
          isLoading={isLoading}
          onSubmit={onImport}
        />
        <Sheet open={userContext.isModalOpen} onOpenChange={() => !isLoading && userContext.toggleModal()}>
          <SheetTrigger asChild>
            <Button onClick={() => userContext.toggleModal()} disabled={isLoading}>
              <Plus />
              {t('page.users.button.create')}
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
            <SheetHeader>
              <SheetTitle>{t('page.users.form.title.create')}</SheetTitle>
              <SheetDescription>
                {t('page.users.form.description.create')}
              </SheetDescription>
            </SheetHeader>
            <div className="w-full px-4">
              <Form {...userContext.form}>
                <form className="w-full space-y-4" onSubmit={userContext.form.handleSubmit(onSubmit)}>
                  <FormField
                    control={userContext.form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('page.users.form.name')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('page.users.form.name')}
                            className="w-full"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userContext.form.control}
                    name="login"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('page.users.form.login')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('page.users.form.login')}
                            className="w-full"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userContext.form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('page.users.form.password')}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t('page.users.form.password')}
                            className="w-full"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userContext.form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('page.users.form.role')}</FormLabel>
                        <FormControl>
                          <AsyncSelect<UserRole>
                            fetcher={async (searchValue) => {
                              setSearch(searchValue)
                              return requestUserRoles.data?.data?.userRoles || []
                            }}
                            renderOption={e => e.names[i18n.language]}
                            getDisplayValue={e => e.names[i18n.language]}
                            getOptionValue={e => e.id}
                            width="100%"
                            className="w-full"
                            name="role"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userContext.form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel>{t('page.users.form.active')}</FormLabel>
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => userContext.toggleModal()}
                      disabled={isLoading}
                    >
                      {t('button.cancel')}
                    </Button>
                    <Button type="submit" disabled={isLoading} loading={isLoading}>
                      {t('button.submit')}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
