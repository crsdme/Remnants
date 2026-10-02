import type { ProcurementDTO, SupplierDTO } from '@remnant/shared'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProcurementQuery, useSupplierQuery } from '@/api/hooks'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface ViewSupplierContextType {
  isLoading: boolean
  supplier?: SupplierDTO
  procurements: ProcurementDTO[]
  payOpen: boolean
  setPayOpen: (open: boolean) => void
}

const ViewSupplierContext = createContext<ViewSupplierContextType | undefined>(undefined)

export function ViewSupplierProvider({ children }: { children: ReactNode }) {
  const { seq: param = '' } = useParams()
  const navigate = useNavigate()
  const [payOpen, setPayOpen] = useState(false)
  const isUuid = uuidPattern.test(param)
  const seqNumber = Number(param)

  const { suppliers: [supplier], isLoading: isSupplierLoading } = useSupplierQuery(
    {
      filters: isUuid ? { ids: [param] } : { seq: [param] },
      pagination: { full: true },
    },
    { options: { enabled: isUuid || seqNumber > 0 } },
  )

  const { procurements, isLoading: isProcurementsLoading } = useProcurementQuery(
    {
      filters: { supplierId: supplier?.id },
      sorters: { createdAt: 'desc' },
      pagination: { full: true },
    },
    { options: { enabled: Boolean(supplier?.id) } },
  )

  useEffect(() => {
    if (isUuid && supplier?.seq)
      void navigate(`/suppliers/view/${supplier.seq}`, { replace: true })
  }, [isUuid, navigate, supplier?.seq])

  const value: ViewSupplierContextType = useMemo(
    () => ({
      isLoading: isSupplierLoading || isProcurementsLoading,
      supplier,
      procurements,
      payOpen,
      setPayOpen,
    }),
    [isProcurementsLoading, isSupplierLoading, payOpen, procurements, supplier],
  )

  return <ViewSupplierContext.Provider value={value}>{children}</ViewSupplierContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useViewSupplierContext(): ViewSupplierContextType {
  const context = useContext(ViewSupplierContext)
  if (!context) {
    throw new Error('useViewSupplierContext - ViewSupplierContext')
  }
  return context
}
