import { useRequestLanguages } from '@/api/hooks'

import { useUnitContext } from '@/utils/contexts'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { zodResolver } from '@hookform/resolvers/zod'

import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const formSchema = z.object({
  names: z.record(z.string()),
  symbols: z.record(z.string()),
  priority: z.number().default(0),
  active: z.boolean().default(true),
})

export function ActionBar() {
  const { t } = useTranslation()
  const unitContext = useUnitContext()
  const [file, setFile] = useState<File | null>(null)

  const requestLanguages = useRequestLanguages({ pagination: { full: true } })
  const languages = requestLanguages.data.data.languages

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      names: {},
      symbols: {},
      priority: 0,
      active: true,
    },
  })

  const onSubmit = (values) => {
    unitContext.submitUnitForm(values)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleDownloadTemplate = () => {
    const headers = [
      ...languages.map(l => `name_${l.code}`),
      ...languages.map(l => `symbol_${l.code}`),
      'priority',
      'active',
    ]

    const row = [
      ...languages.map(() => t(`component.import.dialog.template.name`)),
      ...languages.map(() => t(`component.import.dialog.template.symbol`)),
      '1',
      'true',
    ]

    const csv = [headers, row].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })

    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'units-template.csv',
    })

    link.click()
    URL.revokeObjectURL(link.href)
  }

  const onImport = async () => {
    const formData = new FormData()
    formData.append('file', file)
    unitContext.importUnits(formData)
    setFile(null)
  }

  useEffect(() => {
    const unit = unitContext.selectedUnit
    let unitValues = {}
    if (unit) {
      unitValues = {
        names: { ...unit.names },
        symbols: { ...unit.symbols },
        priority: unit.priority,
        active: unit.active,
      }
    }

    form.reset(unitValues)
  }, [unitContext.selectedUnit, form, unitContext.isModalOpen])

  const isLoading = unitContext.isLoading

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('page.units.title')}</h2>
        <p className="text-muted-foreground">{t('page.units.description')}</p>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <ImportButton
          handleFileChange={handleFileChange}
          handleDownloadTemplate={handleDownloadTemplate}
          isFileSelected={!!file}
          isLoading={isLoading}
          onSubmit={onImport}
        />
        <Dialog
          open={unitContext.isModalOpen}
          onOpenChange={() => !isLoading && unitContext.toggleModal()}
        >
          <DialogTrigger asChild>
            <Button onClick={() => unitContext.toggleModal()} disabled={isLoading}>
              <Plus />
              {t('page.units.button.create')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('page.units.modal.title.create')}</DialogTitle>
              <DialogDescription>{t('page.units.modal.description.create')}</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                {languages.map(language => (
                  <FormField
                    control={form.control}
                    key={language.code}
                    name={`names.${language.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('page.units.form.names', {
                            language: t(`language.${language.code}`),
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('page.units.form.names', {
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
                {languages.map(language => (
                  <FormField
                    control={form.control}
                    key={language.code}
                    name={`symbols.${language.code}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('page.units.form.symbols', {
                            language: t(`language.${language.code}`),
                          })}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('page.units.form.symbols', {
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('page.units.form.priority')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t('page.units.form.priority')}
                          className="w-full"
                          {...field}
                          disabled={isLoading}
                          onChange={e => field.onChange(Number(e.target.value))}
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
                      <FormLabel>{t('page.units.form.active')}</FormLabel>
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => unitContext.toggleModal()}
                    disabled={isLoading}
                  >
                    {t('page.units.button.cancel')}
                  </Button>
                  <Button type="submit" disabled={isLoading} loading={isLoading}>
                    {t('page.units.button.submit')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
