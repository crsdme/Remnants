import { TrashIcon } from 'lucide-react'

import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useDeliveryServiceOptions, useOrderSourceOptions, useOrderStatusOptions } from '@/api/hooks'
import { AsyncSelectNew } from '@/components/AsyncSelectNew'
import {
  Badge,
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
  Separator,
} from '@/components/ui'
import { useAutomationContext } from '@/contexts'
import { AUTOMATION_ACTIONS, AUTOMATION_CONDITIONS, AUTOMATION_TRIGGERS } from '@/utils/constants'

export function AutomationForm() {
  const { t, i18n } = useTranslation()
  const { isLoading, form, closeModal, submitAutomationForm, openConditionSheet, openActionSheet, selectedConditions, selectedActions, removeCondition, removeAction } = useAutomationContext()

  const selectedTrigger = useWatch({ control: form.control, name: 'trigger' })

  const loadOrderStatusOptions = useOrderStatusOptions()

  const onSubmit = (values) => {
    submitAutomationForm(values)
  }

  const paramsField = (trigger) => {
    switch (trigger) {
      case 'order-status-updated':
        return (
          <FormField
            name="params"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('page.automations.form.params')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadOrderStatusOptions}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
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
        )
    }
  }

  return (
    <Form {...form}>
      <form className="w-full space-y-1" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.automations.form.name')}
                  <span className="text-destructive ml-1">*</span>
                </p>
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

        <FormField
          name="trigger"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.automations.form.trigger')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={field.onChange}
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

        {paramsField(selectedTrigger)}

        <Separator className="mb-5" />

        <FormField
          name="conditions"
          control={form.control}
          render={() => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.automations.form.conditions')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <FormControl>
                <Button type="button" onClick={() => openConditionSheet()}>{t('page.automations.form.conditions.create')}</Button>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedConditions && (
          <div className="flex flex-col gap-2">
            {selectedConditions.map((item) => {
              return (
                <div key={item.id} className="flex flex-wrap gap-2 items-center">
                  <Badge>{t(`page.automations.condition.${item.field}`)}</Badge>
                  <Badge>{t(`page.automations.operator.${item.operator}`)}</Badge>
                  {item.params.map(param => (
                    <Badge key={param}>{param}</Badge>
                  ))}
                  <Button type="button" size="icon" variant="destructive" onClick={() => removeCondition({ id: item.id })}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <Separator className="mb-5" />

        <FormField
          name="actions"
          control={form.control}
          render={() => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.automations.form.actions')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <FormControl>
                <Button type="button" onClick={() => openActionSheet()}>{t('page.automations.form.actions.create')}</Button>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedActions && (
          <div className="flex flex-col gap-2">
            {selectedActions.map((item) => {
              return (
                <div key={item.id} className="flex flex-wrap gap-2 items-center">
                  <Badge>{t(`page.automations.action.${item.field}`)}</Badge>
                  {item.params.map(param => (
                    <Badge key={param}>{param}</Badge>
                  ))}
                  <Button type="button" size="icon" variant="destructive" onClick={() => removeAction({ id: item.id })}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-2 flex-wrap pb-2">
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-md border p-4 grow">
                <div className="space-y-1">
                  <FormLabel className="text-sm">{t('page.automations.form.active')}</FormLabel>
                  <FormDescription className="text-xs text-muted-foreground">
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

export function AutomationConditionsForm() {
  const { t, i18n } = useTranslation()
  const { isLoading, conditionForm, closeConditionSheet, submitConditionForm } = useAutomationContext()

  const onSubmit = (values) => {
    submitConditionForm(values)
  }

  const loadOrderStatusOptions = useOrderStatusOptions()
  const loadDeliveryServiceOptions = useDeliveryServiceOptions()
  const loadOrderSourceOptions = useOrderSourceOptions()

  const condition = useWatch({ control: conditionForm.control, name: 'field' })

  const conditionType = useMemo(() => AUTOMATION_CONDITIONS.find(group => group.items.find(item => item.id === condition))?.items[0].type, [condition])

  const conditionTypeForm = (conditionType) => {
    switch (conditionType) {
      case 'contains':
        return (
          <>
            <FormField
              control={conditionForm.control}
              name="operator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <p>
                      {t('page.automations.form.operator')}
                      <span className="text-destructive ml-1">*</span>
                    </p>
                  </FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                    >
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
          </>
        )
    }
  }

  const conditionField = (condition) => {
    switch (condition) {
      case 'orderStatus':
        return (
          <FormField
            control={conditionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('page.automations.form.order-status')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadOrderStatusOptions}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
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
        )
      case 'deliveryService':
        return (
          <FormField
            control={conditionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('page.automations.form.delivery-service')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadDeliveryServiceOptions}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
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
        )
      case 'orderSource':
        return (
          <FormField
            control={conditionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('page.automations.form.order-source')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadOrderSourceOptions}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
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
        )
    }
  }

  return (
    <Form {...conditionForm}>
      <form className="w-full space-y-1" onSubmit={conditionForm.handleSubmit(onSubmit)}>
        <FormField
          control={conditionForm.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.automations.form.condition')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={field.onChange}
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

        {conditionTypeForm(conditionType)}

        {conditionField(condition)}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => closeConditionSheet()}
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

export function AutomationActionsForm() {
  const { t, i18n } = useTranslation()
  const { isLoading, actionForm, closeActionSheet, submitActionForm } = useAutomationContext()

  const onSubmit = (values) => {
    submitActionForm(values)
  }

  const loadOrderStatusOptions = useOrderStatusOptions()
  const loadOrderSourceOptions = useOrderSourceOptions()
  const loadDeliveryServiceOptions = useDeliveryServiceOptions()

  const action = useWatch({ control: actionForm.control, name: 'field' })

  const actionField = (action) => {
    switch (action) {
      case 'order-status-update':
        return (
          <FormField
            control={actionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('page.automations.form.order-status')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadOrderStatusOptions}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
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
        )
      case 'order-source-update':
        return (
          <FormField
            control={actionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('page.automations.form.order-source')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadOrderSourceOptions}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
                    getOptionValue={e => e.id}
                    disabled={isLoading}
                    clearable
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'order-delivery-service-update':
        return (
          <FormField
            control={actionForm.control}
            name="params"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t('page.automations.form.delivery-service')}</FormLabel>
                <FormControl>
                  <AsyncSelectNew
                    {...field}
                    loadOptions={loadDeliveryServiceOptions}
                    renderOption={e => e.names[i18n.language]}
                    getDisplayValue={e => e.names[i18n.language]}
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
        )
    }
  }

  return (
    <Form {...actionForm}>
      <form className="w-full space-y-1" onSubmit={actionForm.handleSubmit(onSubmit)}>
        <FormField
          name="field"
          control={actionForm.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p>
                  {t('page.automations.form.action')}
                  <span className="text-destructive ml-1">*</span>
                </p>
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={field.onChange}
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

        {actionField(action)}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => closeActionSheet()}
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
