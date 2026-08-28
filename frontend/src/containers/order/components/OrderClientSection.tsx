import type { ClientDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import { Globe, Hash, Mail, MapPin, MessageSquare, Pencil, Phone, Plus, Search, Share2, User, X } from 'lucide-react'
import { useState } from 'react'
import { useClientQuery } from '@/api/hooks'
import { PermissionGate } from '@/components'
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@/components/ui'
import { useDebounceValue, useLocale } from '@/utils/hooks'
import { cn } from '@/utils/lib/utils'

interface OrderClientSectionProps {
  value?: string
  onChange: (clientId: string | undefined) => void
  onCreate?: () => void
  onEdit?: (client: ClientDTO) => void
  disabled?: boolean
  titlePrefix: 'create-order' | 'edit-order' | 'view-order'
}

function getClientName(client: ClientDTO) {
  return [client.name, client.middleName, client.lastName].filter(Boolean).join(' ')
}

function getClientInitials(client: ClientDTO) {
  const first = client.name?.charAt(0) || ''
  const second = client.lastName?.charAt(0) || client.middleName?.charAt(0) || ''
  return `${first}${second}`.toUpperCase() || '?'
}

function ClientAvatar({ client, className }: { client: ClientDTO, className?: string }) {
  return (
    <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground', className)}>
      {getClientInitials(client)}
    </div>
  )
}

function ClientDetailRow({
  icon: Icon,
  children,
}: {
  icon: typeof Phone
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
      <Icon className="mt-0.5 size-3.5 shrink-0" />
      <span className="min-w-0 break-words">{children}</span>
    </div>
  )
}

function SelectedClientCard({ client }: { client: ClientDTO }) {
  const phones = client.phones?.filter(Boolean) ?? []
  const emails = client.emails?.filter(Boolean) ?? []
  const addresses = client.addresses?.filter(Boolean) ?? []
  const socials = client.socials?.filter(s => s.value) ?? []

  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
      <ClientAvatar client={client} />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="space-y-0.5">
          <p className="font-semibold leading-tight">{getClientName(client)}</p>
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Hash className="size-3 shrink-0" />
            {client.seq}
          </p>
        </div>

        <div className="space-y-1.5">
          {phones.map(phone => (
            <ClientDetailRow key={phone} icon={Phone}>
              {phone}
            </ClientDetailRow>
          ))}
          {emails.map(email => (
            <ClientDetailRow key={email} icon={Mail}>
              {email}
            </ClientDetailRow>
          ))}
          {client.country && (
            <ClientDetailRow icon={Globe}>
              {client.country}
            </ClientDetailRow>
          )}
          {addresses.map(address => (
            <ClientDetailRow key={address} icon={MapPin}>
              {address}
            </ClientDetailRow>
          ))}
          {socials.map(social => (
            <ClientDetailRow key={`${social.type}-${social.value}`} icon={Share2}>
              {social.type
                ? `${social.type}: ${social.value}`
                : social.value}
            </ClientDetailRow>
          ))}
          {client.comment && (
            <ClientDetailRow icon={MessageSquare}>
              {client.comment}
            </ClientDetailRow>
          )}
        </div>
      </div>
    </div>
  )
}

export function OrderClientSection({
  value,
  onChange,
  onCreate,
  onEdit,
  disabled,
  titlePrefix,
}: OrderClientSectionProps) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounceValue(search, 300)

  const { clients: selectedClients } = useClientQuery(
    {
      filters: { ids: value ? [value] : [] },
      pagination: { full: true },
    },
    { options: { enabled: Boolean(value) } },
  )

  const selectedClient = selectedClients.find(client => client.id === value)
  const canSearch = !disabled && !value

  const { clients: searchClients, isFetching } = useClientQuery(
    {
      filters: { search: debouncedSearch || undefined },
      pagination: { pageSize: 8 },
    },
    { options: { enabled: canSearch && open } },
  )

  const handleSelect = (clientId: string) => {
    onChange(clientId)
    setSearch('')
    setOpen(false)
  }

  const handleChange = () => {
    onChange(undefined)
    setSearch('')
    setOpen(true)
  }

  const handleCreate = () => {
    setOpen(false)
    onCreate?.()
  }

  const handleEdit = () => {
    if (selectedClient)
      onEdit?.(selectedClient)
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <User className="size-5 shrink-0" />
        <p className="text-lg font-bold">{t(`page.${titlePrefix}.form.client`)}</p>
        <Separator className="flex-1" />
        {!disabled && value && (
          <div className="flex shrink-0 items-center gap-3">
            {onEdit && (
              <PermissionGate permission="client.edit">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto gap-1 px-0 text-muted-foreground"
                  onClick={handleEdit}
                  disabled={!selectedClient}
                >
                  <Pencil className="size-3.5" />
                  {t(`page.${titlePrefix}.form.client-edit`)}
                </Button>
              </PermissionGate>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto gap-1 px-0 text-muted-foreground"
              onClick={handleChange}
            >
              <X className="size-3.5" />
              {t(`page.${titlePrefix}.form.client-change`)}
            </Button>
          </div>
        )}
      </div>

      {selectedClient
        ? (
            <SelectedClientCard client={selectedClient} />
          )
        : canSearch
          ? (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className="h-9 w-full justify-start gap-2 px-3 font-normal text-muted-foreground"
                  >
                    <Search className="size-4 shrink-0" />
                    <span className="truncate">
                      {t(`page.${titlePrefix}.form.client-search`)}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-(--radix-popover-trigger-width) p-0"
                  align="start"
                  onOpenAutoFocus={e => e.preventDefault()}
                >
                  <div className="relative border-b p-2">
                    <Search className="absolute inset-y-0 left-4 my-auto size-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder={t(`page.${titlePrefix}.form.client-search`)}
                      className="pl-8"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {searchClients.length === 0
                      ? (
                          <p className="px-3 py-3 text-center text-xs text-muted-foreground">
                            {isFetching
                              ? t(`page.${titlePrefix}.form.client-searching`)
                              : t('table.noResults')}
                          </p>
                        )
                      : (
                          <ul className="py-1">
                            {searchClients.map(client => (
                              <li key={client.id}>
                                <button
                                  type="button"
                                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                                  onClick={() => handleSelect(client.id)}
                                >
                                  <ClientAvatar client={client} className="size-8 bg-muted text-xs text-muted-foreground" />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium leading-none">{getClientName(client)}</p>
                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                      {[client.phones?.[0], client.emails?.[0]].filter(Boolean).join(' · ')}
                                    </p>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                  </div>

                  {onCreate && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 border-t px-3 py-2.5 text-left text-sm text-primary transition-colors hover:bg-muted/50"
                      onClick={handleCreate}
                    >
                      <Plus className="size-3.5" />
                      {t(`page.${titlePrefix}.form.client-create`)}
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            )
          : value
            ? (
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  {t(`page.${titlePrefix}.form.client-searching`)}
                </div>
              )
            : null}
    </div>
  )
}
