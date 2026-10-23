import type { ReactNode } from 'react'
import type { ActionRow, ConditionRow } from '../context'

import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useWatch } from 'react-hook-form'
import { useDeliveryServiceOptions, useOrderSourceOptions, useOrderStatusOptions } from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { AUTOMATION_ACTIONS, AUTOMATION_CONDITIONS, AUTOMATION_TRIGGERS } from '@/utils/constants'
import { useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib'
import { useAutomationContext } from '../context'
import { resolveParamLabel, useAutomationLabelMaps } from './labels'

function Step({
  index,
  title,
  hint,
  isLast,
  children,
}: {
  index: number
  title: string
  hint?: string
  isLast?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[1.75rem_1fr] gap-x-3">
      <div className="flex flex-col items-center">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
          {index}
        </div>
        {!isLast && <div className="mt-2 w-px flex-1 bg-border" />}
      </div>
      <div className={cn('min-w-0 pb-8', isLast && 'pb-0')}>
        <div className="mb-3">
          <h3 className="text-sm font-medium leading-none">{title}</h3>
          {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

function RuleRow({
  title,
  detail,
  onEdit,
  onRemove,
}: {
  title: string
  detail?: string
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <div className="group flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2.5 transition-colors hover:bg-muted/70">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{title}</p>
        {detail && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{detail}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function EditorShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg bg-muted/40 px-3 py-3">
      {children}
    </div>
  )
}

function conditionDetail(
  item: ConditionRow,
  maps: ReturnType<typeof useAutomationLabelMaps>,
  t: (key: string) => string,
) {
  const values = item.params.map(param => resolveParamLabel(maps, item.field, param)).join(', ')
  return `${t(`page.automations.operator.${item.operator}`)}: ${values}`
}

function actionDetail(
  item: ActionRow,
  maps: ReturnType<typeof useAutomationLabelMaps>,
) {
  const params = item.params ?? []
  if (!params.length)
    return undefined
  return params.map(param => resolveParamLabel(maps, item.field, param)).join(', ')
}

export function AutomationForm() {
  const { t, language } = useLocale()
  const maps = useAutomationLabelMaps()
  const {
    isLoading,
    form,
    closeModal,
    submitAutomationForm,
    openConditionEditor,
    openActionEditor,
    selectedConditions,
    selectedActions,
    removeCondition,
    removeAction,
    isConditionEditorOpen,
    isActionEditorOpen,
  } = useAutomationContext()

  const selectedTrigger = useWatch({ control: form.control, name: 'trigger' })
  const loadOrderStatusOptions = useOrderStatusOptions()

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col"
        onSubmit={(e) => { void form.handleSubmit(submitAutomationForm)(e) }}
      >
        <div className="space-y-6">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('page.automations.form.name')}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('page.automations.form.name')}
                    className="w-full"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Step index={1} title={t('page.automations.form.section.when')}>
              <div className="space-y-3">
                <FormField
                  name="trigger"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={(value) => {
                            field.onChange(value)
                            form.setValue('params', [])
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('page.automations.form.trigger')} />
                          </SelectTrigger>
                          <SelectContent>
                            {AUTOMATION_TRIGGERS.map(group => (
                              <SelectGroup key={group.group}>
                                <SelectLabel>{t(`page.automations.form.trigger.${group.group}`)}</SelectLabel>
                                {group.items.map(item => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {t(`page.automations.trigger.${item.id}`)}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedTrigger === 'order-status-updated' && (
                  <FormField
                    name="params"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('page.automations.form.params')}</FormLabel>
                        <FormControl>
                          <AsyncSelectNew
                            {...field}
                            loadOptions={loadOrderStatusOptions}
                            renderOption={e => e.names[language]}
                            getDisplayValue={e => e.names[language]}
                            getOptionValue={e => e.id}
                            disabled={isLoading || !selectedTrigger}
                            name="params"
                            clearable
                            multi
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </Step>

            <Step
              index={2}
              title={t('page.automations.form.section.if')}
              hint={t('page.automations.form.conditions.optional')}
            >
              <div className="space-y-2">
                {selectedConditions.map(item => (
                  <RuleRow
                    key={item.id}
                    title={t(`page.automations.condition.${item.field}`)}
                    detail={conditionDetail(item, maps, t)}
                    onEdit={() => openConditionEditor(item)}
                    onRemove={() => removeCondition({ id: item.id })}
                  />
                ))}

                {isConditionEditorOpen
                  ? <ConditionEditor />
                  : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground"
                        onClick={() => openConditionEditor()}
                      >
                        <Plus className="h-4 w-4" />
                        {t('page.automations.form.conditions.create')}
                      </Button>
                    )}
              </div>
            </Step>

            <Step
              index={3}
              title={t('page.automations.form.section.then')}
              isLast
            >
              <div className="space-y-2">
                {selectedActions.map(item => (
                  <RuleRow
                    key={item.id}
                    title={t(`page.automations.action.${item.field}`)}
                    detail={actionDetail(item, maps)}
                    onEdit={() => openActionEditor(item)}
                    onRemove={() => removeAction({ id: item.id })}
                  />
                ))}

                {isActionEditorOpen
                  ? <ActionEditor />
                  : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground"
                        onClick={() => openActionEditor()}
                      >
                        <Plus className="h-4 w-4" />
                        {t('page.automations.form.actions.create')}
                      </Button>
                    )}
              </div>
            </Step>
          </div>

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 px-3 py-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">{t('page.automations.form.active')}</FormLabel>
                  <FormDescription className="text-xs">
                    {t('page.automations.form.active.description')}
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

        <div className="sticky bottom-0 mt-6 flex gap-2 border-t bg-background pt-4 pb-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => closeModal()} disabled={isLoading}>
            {t('button.cancel')}
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading} loading={isLoading}>
            {t('button.submit')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

function ConditionEditor() {
  const { t, language } = useLocale()
  const { isLoading, conditionForm, closeConditionEditor, submitConditionForm } = useAutomationContext()
  const loadOrderStatusOptions = useOrderStatusOptions()
  const loadDeliveryServiceOptions = useDeliveryServiceOptions()
  const loadOrderSourceOptions = useOrderSourceOptions()
  const condition = useWatch({ control: conditionForm.control, name: 'field' })

  const conditionMeta = AUTOMATION_CONDITIONS
    .flatMap(group => group.items)
    .find(item => item.id === condition)

  return (
    <Form {...conditionForm}>
      <EditorShell>
        <FormField
          control={conditionForm.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('page.automations.form.condition')}
                <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={(value) => {
                    field.onChange(value)
                    conditionForm.setValue('operator', '')
                    conditionForm.setValue('params', [])
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('page.automations.form.condition')} />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTOMATION_CONDITIONS.map(group => (
                      <SelectGroup key={group.group}>
                        <SelectLabel>{t(`page.automations.form.condition.${group.group}`)}</SelectLabel>
                        {group.items.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {t(`page.automations.condition.${item.id}`)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {conditionMeta?.type === 'contains' && (
          <FormField
            control={conditionForm.control}
            name="operator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('page.automations.form.operator')}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('page.automations.form.operator')} />
                    </SelectTrigger>
                    <SelectContent>
                      {['contains', 'not-contains'].map(item => (
                        <SelectItem key={item} value={item}>
                          {t(`page.automations.operator.${item}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {condition === 'orderStatus' && (
          <FormField
            control={conditionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.automations.form.order-status')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadOrderStatusOptions}
                    renderOption={e => e.names[language]}
                    getDisplayValue={e => e.names[language]}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    clearable
                    multi
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {condition === 'deliveryService' && (
          <FormField
            control={conditionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.automations.form.delivery-service')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadDeliveryServiceOptions}
                    renderOption={e => e.names[language]}
                    getDisplayValue={e => e.names[language]}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    clearable
                    multi
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {condition === 'orderSource' && (
          <FormField
            control={conditionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.automations.form.order-source')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadOrderSourceOptions}
                    renderOption={e => e.names[language]}
                    getDisplayValue={e => e.names[language]}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    clearable
                    multi
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => closeConditionEditor()} disabled={isLoading}>
            {t('button.cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={() => void conditionForm.handleSubmit(submitConditionForm)()}
          >
            {t('button.submit')}
          </Button>
        </div>
      </EditorShell>
    </Form>
  )
}

function ActionEditor() {
  const { t, language } = useLocale()
  const { isLoading, actionForm, closeActionEditor, submitActionForm } = useAutomationContext()
  const loadOrderStatusOptions = useOrderStatusOptions()
  const loadOrderSourceOptions = useOrderSourceOptions()
  const loadDeliveryServiceOptions = useDeliveryServiceOptions()
  const action = useWatch({ control: actionForm.control, name: 'field' })

  return (
    <Form {...actionForm}>
      <EditorShell>
        <FormField
          name="field"
          control={actionForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('page.automations.form.action')}
                <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={(value) => {
                    field.onChange(value)
                    actionForm.setValue('params', [])
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('page.automations.form.action')} />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTOMATION_ACTIONS.map(group => (
                      <SelectGroup key={group.group}>
                        <SelectLabel>{t(`page.automations.form.action.${group.group}`)}</SelectLabel>
                        {group.items.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {t(`page.automations.action.${item.id}`)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {action === 'order-status-update' && (
          <FormField
            control={actionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.automations.form.order-status')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadOrderStatusOptions}
                    renderOption={e => e.names[language]}
                    getDisplayValue={e => e.names[language]}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    clearable
                    multi
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {action === 'order-source-update' && (
          <FormField
            control={actionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.automations.form.order-source')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadOrderSourceOptions}
                    renderOption={e => e.names[language]}
                    getDisplayValue={e => e.names[language]}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    clearable
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {action === 'order-delivery-service-update' && (
          <FormField
            control={actionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('page.automations.form.delivery-service')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadDeliveryServiceOptions}
                    renderOption={e => e.names[language]}
                    getDisplayValue={e => e.names[language]}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    clearable
                    multi
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => closeActionEditor()} disabled={isLoading}>
            {t('button.cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={() => void actionForm.handleSubmit(submitActionForm)()}
          >
            {t('button.submit')}
          </Button>
        </div>
      </EditorShell>
    </Form>
  )
}
