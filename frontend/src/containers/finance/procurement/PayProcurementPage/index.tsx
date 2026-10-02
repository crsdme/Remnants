import { Navigate, useParams } from 'react-router-dom'

export function PayProcurementPage() {
  const { procurementSeq = '' } = useParams()
  return <Navigate to={`/procurements/view/${procurementSeq}`} replace />
}
