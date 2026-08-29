import type { DeliveryCapabilitiesDTO } from '@remnant/shared'
import type { DeliveryCarrierAdapter } from '../types'

export const selfPickupAdapter: DeliveryCarrierAdapter = {
  type: 'selfpickup',

  capabilities(): DeliveryCapabilitiesDTO {
    return {
      type: 'selfpickup',
      methods: ['pickup'],
      locationFlow: [],
      canCreateShipment: false,
      canPrintLabel: false,
      canTrack: false,
      canCancel: false,
      requiresCredentials: false,
    }
  },

  async searchLocations() {
    return []
  },
}
