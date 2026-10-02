import { ActionBar } from './components/action-bar'
import { WarehouseTransactionForm } from './components/form'
import { WarehouseTransactionProvider } from './context'

export function WarehouseTransactionReceivePage() {
  return (
    <WarehouseTransactionProvider>
      <ActionBar />
      <WarehouseTransactionForm />
    </WarehouseTransactionProvider>
  )
}

export function WarehouseTransactionViewPage() {
  return <WarehouseTransactionReceivePage />
}
