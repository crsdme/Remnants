import type { AuditLogPopulatedDTO } from '@remnant/shared'
import type { ReactNode } from 'react'

import { createContext, useContext, useMemo, useState } from 'react'

interface AuditLogsContextType {
  selectedAuditLog: AuditLogPopulatedDTO | undefined
  isModalOpen: boolean
  isLoading: boolean
  isEdit: boolean
  openModal: (auditLog?: AuditLogPopulatedDTO) => void
  closeModal: () => void
}

const AuditLogsContext = createContext<AuditLogsContextType | undefined>(undefined)

export function AuditLogsProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogPopulatedDTO | undefined>(undefined)

  const closeModal = () => {
    if (!isModalOpen)
      return
    setIsModalOpen(false)
    setIsLoading(false)
    setIsEdit(false)
    setSelectedAuditLog(undefined)
  }

  const openModal = (auditLog?: AuditLogPopulatedDTO) => {
    setIsModalOpen(true)
    setIsEdit(!!auditLog)
    setSelectedAuditLog(auditLog)
  }

  const value: AuditLogsContextType = useMemo(
    () => ({
      selectedAuditLog,
      isModalOpen,
      isLoading,
      isEdit,
      openModal,
      closeModal,
    }),
    [selectedAuditLog, isModalOpen, isLoading, isEdit],
  )

  return <AuditLogsContext.Provider value={value}>{children}</AuditLogsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuditLogsContext(): AuditLogsContextType {
  const context = useContext(AuditLogsContext)
  if (!context) {
    throw new Error('useAuditLogsContext - AuditLogsContext')
  }
  return context
}
