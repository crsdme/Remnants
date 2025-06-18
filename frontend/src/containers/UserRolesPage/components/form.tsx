import { useTranslation } from 'react-i18next'
import { useLanguageQuery } from '@/api/hooks'
import {
  Button,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui'
import { useUserRoleContext } from '@/contexts'
import { USER_ROLE_PERMISSIONS } from '@/utils/constants'

export function UserRoleForm() {
  const { t } = useTranslation()
  const { isLoading, form, closeModal, submitUserRoleForm } = useUserRoleContext()

  const requestLanguages = useLanguageQuery({ pagination: { full: true } })
  const languages = requestLanguages?.data?.data?.languages || []

  const onSubmit = (values) => {
    submitUserRoleForm(values)
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
        {languages.map(language => (
          <FormField
            control={form.control}
            key={language.code}
            name={`names.${language.code}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <p>
                    {t('page.userRoles.form.names', {
                      language: t(`language.${language.code}`),
                    })}
                    <span className="text-destructive ml-1">*</span>
                  </p>
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
          control={form.control}
          name="permissions"
          render={({ field }) => {
            const selectedPermissions = field.value || []

            return (
              <div className="space-y-4 pb-2">
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
          control={form.control}
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
        <div className="flex gap-2 flex-wrap pb-2">
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.userRoles.form.active')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
                    {t('page.userRoles.form.active.description')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => closeModal()}
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
  )
}
