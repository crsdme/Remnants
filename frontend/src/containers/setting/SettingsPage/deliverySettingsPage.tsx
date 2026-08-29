import { DeliveryCurrencyCard } from './DeliveryCurrencyCard'
import { DeliveryStatusMapCard } from './DeliveryStatusMapCard'
import { DeliveryTrackingIntervalCard } from './DeliveryTrackingIntervalCard'

export function DeliverySettingsPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <DeliveryCurrencyCard />
      <DeliveryTrackingIntervalCard />
      <DeliveryStatusMapCard />
    </div>
  )
}
