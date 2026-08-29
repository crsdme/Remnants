import { Helmet } from 'react-helmet'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useSiteQuery, useSiteSyncProducts } from '@/api/hooks'
import { PermissionGate } from '@/components'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useLocale } from '@/utils/hooks'
import { MappingTab } from './mapping-tab'

export function SiteSyncPage() {
  const { t, language } = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()

  const { sites, isLoading } = useSiteQuery({ pagination: { full: true } })
  const activeSites = sites.filter(site => site.active)

  const selectedId = searchParams.get('siteId') ?? activeSites[0]?.id ?? sites[0]?.id
  const site = sites.find(item => item.id === selectedId)

  const syncProducts = useSiteSyncProducts({
    options: {
      onSuccess: ({ data }) => {
        toast.success(t(`response.title.${data.code}`), {
          description: t(`response.description.${data.code}`, {
            total: data.data.total,
            synced: data.data.synced,
            failed: data.data.failed,
          }),
        })
      },
      onError: ({ response }) => {
        const error = response.data.error
        toast.error(t(`error.title.${error.code}`), {
          description: `${t(`error.description.${error.code}`)} ${error.description || ''}`,
        })
      },
    },
  })

  return (
    <>
      <Helmet>
        <title>{t('title.page.sites.sync')}</title>
        <meta name="description" content={t('description.page.sites.sync')} />
      </Helmet>

      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('page.sites.sync.title')}</h2>
          <p className="text-muted-foreground">{t('page.sites.sync.pageDescription')}</p>
        </div>

        {site != null && (
          <PermissionGate permission="site.sync">
            <PermissionSyncButton
              disabled={syncProducts.isPending}
              loading={syncProducts.isPending}
              onConfirm={() => syncProducts.mutate({ id: site.id })}
            />
          </PermissionGate>
        )}
      </div>

      {isLoading && <Skeleton className="h-9 w-64 mb-4" />}

      {!isLoading && sites.length === 0 && (
        <p className="text-muted-foreground">{t('page.sites.sync.noSites')}</p>
      )}

      {sites.length > 0 && (
        <div className="flex items-center gap-3 mb-4 max-w-md">
          <Select
            value={selectedId}
            onValueChange={(id) => {
              setSearchParams(id ? { siteId: id } : {})
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('page.sites.sync.selectSite')} />
            </SelectTrigger>
            <SelectContent>
              {sites.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.names[language] || item.names.ru || item.names.en || item.url}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {site != null && (
        <Tabs defaultValue="product" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="product">{t('page.sites.sync.tabs.products')}</TabsTrigger>
            <TabsTrigger value="category">{t('page.sites.sync.tabs.categories')}</TabsTrigger>
            <TabsTrigger value="attribute">{t('page.sites.sync.tabs.attributes')}</TabsTrigger>
            <TabsTrigger value="language">{t('page.sites.sync.tabs.languages')}</TabsTrigger>
          </TabsList>

          <TabsContent value="product">
            <MappingTab key={`${site.id}-product`} siteId={site.id} sourceType="product" />
          </TabsContent>
          <TabsContent value="category">
            <MappingTab key={`${site.id}-category`} siteId={site.id} sourceType="category" />
          </TabsContent>
          <TabsContent value="attribute">
            <MappingTab key={`${site.id}-attribute`} siteId={site.id} sourceType="attribute" />
          </TabsContent>
          <TabsContent value="language">
            <MappingTab key={`${site.id}-language`} siteId={site.id} sourceType="language" />
          </TabsContent>
        </Tabs>
      )}
    </>
  )
}

function PermissionSyncButton({
  disabled,
  loading,
  onConfirm,
}: {
  disabled: boolean
  loading: boolean
  onConfirm: () => void
}) {
  const { t } = useLocale()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled} loading={loading}>
          {t('page.sites.form.syncProducts.button')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('page.sites.form.syncProducts.confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('page.sites.form.syncProducts.confirmDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t('button.cancel')}</AlertDialogCancel>
          <AlertDialogAction disabled={loading} onClick={onConfirm}>
            {t('page.sites.form.syncProducts.button')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
