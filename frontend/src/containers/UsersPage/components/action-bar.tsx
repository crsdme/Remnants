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
import { useUserContext } from '@/utils/contexts'
import { zodResolver } from '@hookform/resolvers/zod'

import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string(),
  login: z.string(),
  password: z.string().optional(),
  active: z.boolean().default(true),
})

export function ActionBar() {
  const { t } = useTranslation()
  const userContext = useUserContext()
  const [file, setFile] = useState<File | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      login: '',
      password: '',
      active: true,
    },
  })

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
    const blob = new Blob([csv], { type: 'text/csv' })

    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'users-template.csv',
    })

    link.click()
    URL.revokeObjectURL(link.href)
  }

  const onImport = async () => {
    const formData = new FormData()
    formData.append('file', file)
    userContext.importUsers(formData)
    setFile(null)
  }

  useEffect(() => {
    const user = userContext.selectedUser
    let userValues = {}
    if (user) {
      userValues = {
        name: user.name,
        login: user.login,
        password: user.password,
        active: user.active,
      }
    }

    form.reset(userValues)
  }, [userContext.selectedUser, form, userContext.isModalOpen])

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
              <Form {...form}>
                <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
