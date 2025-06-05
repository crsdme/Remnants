import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRequestLanguages } from '@/api/hooks'
import { ImportButton } from '@/components/ImportButton'

import {
  Button,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useUserRoleContext } from '@/contexts'
import { USER_ROLE_PERMISSIONS } from '@/utils/constants'
import { downloadCsv } from '@/utils/helpers/download'

export function ActionBar() {
  const { t } = useTranslation()
  const userRoleContext = useUserRoleContext()
  const [file, setFile] = useState<File | null>(null)

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const onSubmit = (values) => {
    userRoleContext.submitUserRoleForm(values)
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
      'permissions',
      'priority',
      'active',
    ]

    const row = [
      'name',
      'permissions',
      'priority',
      'active',
    ]

    const csv = [headers, row].map(r => r.join(',')).join('\n')
    downloadCsv(csv, 'user-roles-template.csv', false)
  }

  const onImport = async () => {
    const formData = new FormData()
    formData.append('file', file)
    userRoleContext.importUserRoles(formData)
    setFile(null)
  }

  const isLoading = userRoleContext.isLoading

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.userRoles.title')}</h2>
        <p className="text-muted-foreground">{t('page.userRoles.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <ImportButton
          handleFileChange={handleFileChange}
          handleDownloadTemplate={handleDownloadTemplate}
          isFileSelected={!!file}
          isLoading={isLoading}
          onSubmit={onImport}
        />
        <Sheet open={userRoleContext.isModalOpen} onOpenChange={() => !isLoading && userRoleContext.toggleModal()}>
          <SheetTrigger asChild>
            <Button onClick={() => userRoleContext.toggleModal()} disabled={isLoading}>
              <Plus />
              {t('page.userRoles.button.create')}
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
            <SheetHeader>
              <SheetTitle>{t('page.userRoles.form.title.create')}</SheetTitle>
              <SheetDescription>
                {t('page.userRoles.form.description.create')}
              </SheetDescription>
            </SheetHeader>
            <div className="w-full px-4">
              <Form {...userRoleContext.form}>
                <form className="w-full space-y-4" onSubmit={userRoleContext.form.handleSubmit(onSubmit)}>
                  {languages.map(language => (
                    <FormField
                      control={userRoleContext.form.control}
                      key={language.code}
                      name={`names.${language.code}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('page.userRoles.form.names', {
                              language: t(`language.${language.code}`),
                            })}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('page.userRoles.form.names', {
                                language: t(`language.${language.code}`),
                              })}
                              className="w-full"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormField
                    control={userRoleContext.form.control}
                    name="permissions"
                    render={({ field }) => {
                      const selectedPermissions = field.value || []

                      return (
                        <div className="space-y-4">
                          {USER_ROLE_PERMISSIONS.map(permission => (
                            <Collapsible key={permission.group} className="border rounded-lg">
                              <CollapsibleTrigger className="flex flex-col items-start w-full p-4 hover:bg-muted/50 cursor-pointer">
                                <p className="text-md font-semibold">{t(`page.userRoles.permissions.title.${permission.group}`)}</p>
                                <p className="text-sm text-muted-foreground">{t(`page.userRoles.permissions.description.${permission.group}`)}</p>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="border-t p-3 space-y-3">
                                {permission.permissions.map(permission => (
                                  <div key={permission} className="flex items-center gap-2">
                                    <Checkbox
                                      checked={selectedPermissions.includes(permission)}
                                      onCheckedChange={(checked) => {
                                        const newValue = checked
                                          ? [...selectedPermissions, permission]
                                          : selectedPermissions.filter(p => p !== permission)

                                        field.onChange(newValue)
                                      }}
                                      disabled={isLoading}
                                    />
                                    <div>
                                      <p className="text-sm font-medium">{t(`page.userRoles.permissions.title.${permission}`)}</p>
                                      <p className="text-xs text-muted-foreground">{t(`page.userRoles.permissions.description.${permission}`)}</p>
                                    </div>
                                  </div>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      )
                    }}
                  />
                  <FormField
                    control={userRoleContext.form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('page.userRoles.form.priority')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder={t('page.userRoles.form.priority')}
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
                    control={userRoleContext.form.control}
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
                        <FormLabel>{t('page.userRoles.form.active')}</FormLabel>
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => userRoleContext.toggleModal()}
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
