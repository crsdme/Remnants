import type { ClientDTO, OrderDTOPopulated } from '@remnant/shared'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useClientQuery, useOrderQuery } from '@/api/hooks'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface ViewClientContextType {
  isLoading: boolean
  client?: ClientDTO
  orders: OrderDTOPopulated[]
  payOpen: boolean
  setPayOpen: (open: boolean) => void
}

const ViewClientContext = createContext<ViewClientContextType | undefined>(undefined)

export function ViewClientProvider({ children }: { children: ReactNode }) {
  const { seq: param = '' } = useParams()
  const navigate = useNavigate()
  const [payOpen, setPayOpen] = useState(false)
  const isUuid = uuidPattern.test(param)
  const seqNumber = Number(param)

  const { clients: [client], isLoading: isClientLoading } = useClientQuery(
    {
      filters: isUuid ? { ids: [param] } : { seq: [seqNumber] },
      pagination: { full: true },
    },
    { options: { enabled: isUuid || seqNumber > 0 } },
  )

  const { orders, isLoading: isOrdersLoading } = useOrderQuery(
    {
      filters: { client: client?.id },
      sorters: { createdAt: 'desc' },
      pagination: { full: true },
    },
    { options: { enabled: Boolean(client?.id) } },
  )

  useEffect(() => {
    if (isUuid && client?.seq)
      void navigate(`/clients/view/${client.seq}`, { replace: true })
  }, [isUuid, navigate, client?.seq])

  const value: ViewClientContextType = useMemo(
    () => ({
      isLoading: isClientLoading || isOrdersLoading,
      client,
      orders,
      payOpen,
      setPayOpen,
    }),
    [isClientLoading, isOrdersLoading, orders, payOpen, client],
  )

  return <ViewClientContext.Provider value={value}>{children}</ViewClientContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useViewClientContext(): ViewClientContextType {
  const context = useContext(ViewClientContext)
  if (!context)
    throw new Error('useViewClientContext - ViewClientContext')
  return context
}
