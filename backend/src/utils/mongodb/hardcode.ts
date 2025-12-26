const APP_INSTANCE = process.env.APP_INSTANCE || 'default'

const CONFIGS = {
  default: {
    providerPrice: {
      '9bd76cab-821f-4bd1-8428-9deae1a79da2': 900,
      '6ea945b4-d6cb-4059-a3e3-fde3f9b25443': 1000,
      '21c3f26a-cc0d-495e-8d17-ed7bfba391f6': 600,
      '0ba601b3-bcd5-4c13-b71d-ad3f9d597d23': 910,
      '01b8e779-4b62-4058-ae7a-d4b36835960b': 1020,
      '4698a04a-ea07-4f5c-824e-6f758ab472ea': 1011,
    },
    propertyIds: {
      LENGTH: 'efcc3c51-a146-4975-bc5b-196745f76891',
      WEIGHT: '7c3e2c1b-f2bf-4639-baf2-7b1101fa7bf2',
      HAIR_TYPE: '25144e64-5c4c-47fd-842d-c0a2393f972e',
    },

    hairTypes: {
      VIRGIN: 'b930fb75-61a6-41c0-88de-0c69082b7f06',
      GRAY: '91dcfe98-6192-492f-98de-1ff22bdff01a',
      SILKY: 'aeb36d06-1a12-4319-9313-51abcbed38fb',
      BROWN: '44307e30-0fb8-4ab1-af56-6d8d724dd204',
      CURLY: '822ec142-d144-44fb-ba96-582cff8757b3',
      SLAVIC: '7f6d9a15-9f9f-4ddc-a815-dfaf613a0901',
    },
    symbol: '',
    invoicePrefix: '#',
    invoiceAddition: 1000,
  },
  raw: {
    providerPrice: {
      '9bd76cab-821f-4bd1-8428-9deae1a79da2': 900,
      '6ea945b4-d6cb-4059-a3e3-fde3f9b25443': 1000,
      '21c3f26a-cc0d-495e-8d17-ed7bfba391f6': 600,
      '0ba601b3-bcd5-4c13-b71d-ad3f9d597d23': 910,
      '01b8e779-4b62-4058-ae7a-d4b36835960b': 1020,
      '4698a04a-ea07-4f5c-824e-6f758ab472ea': 1011,
      '13e6fa90-c986-4440-8c94-f36f41e22d36': 1208,
      '37f3a270-e312-4a07-8277-4f49cd8025f0': 1300,
      '951bde3a-e48f-412c-9bea-e8fdd4cdd0c7': 1142,
      'f770ef11-3886-4d27-9327-5a43f120ee4f': 950,
    },

    propertyIds: {
      LENGTH: 'efcc3c51-a146-4975-bc5b-196745f76891',
      WEIGHT: '7c3e2c1b-f2bf-4639-baf2-7b1101fa7bf2',
      HAIR_TYPE: '25144e64-5c4c-47fd-842d-c0a2393f972e',
    },

    hairTypes: {
      VIRGIN: 'b930fb75-61a6-41c0-88de-0c69082b7f06',
      SILKY: 'aeb36d06-1a12-4319-9313-51abcbed38fb',
      GRAY: '91dcfe98-6192-492f-98de-1ff22bdff01a',
      BROWN: '44307e30-0fb8-4ab1-af56-6d8d724dd204',
      CURLY: '822ec142-d144-44fb-ba96-582cff8757b3',
      SLAVIC: '7f6d9a15-9f9f-4ddc-a815-dfaf613a0901',
      ALBINO: '8a379f9e-4a84-4d8c-8108-b35188be2fe1',
    },
    symbol: '',
    invoicePrefix: '#',
    invoiceAddition: 1000,
  },
  exile: {
    providerPrice: {
      'eaafd34d-68aa-48a6-9de9-349f2b08a7b8': 980,
      '54eff814-6885-4d13-b8ba-2fc0946b8529': 1146,
      '1f814052-5fec-4e9f-b119-793441ba0269': 1020,
      '7a422e90-ac88-4809-aafc-012dfc24b5ae': 1000,
      'c73f0115-ecab-4e49-8fa6-17faf667277c': 1182,
      '403073ef-aa4e-4f3b-8150-ece62b459f4a': 950,
    },
    propertyIds: {
      LENGTH: 'b42b8212-c49c-41c5-b070-16097fa5c546',
      WEIGHT: 'd81e819b-5253-49e7-b393-72f09cd167b8',
      HAIR_TYPE: '1e12c088-7b3f-4eb7-993e-b4c32330c2fa',
    },

    hairTypes: {
      VIRGIN: '9f49b061-4c93-40a1-bd9e-c1cfaa0a465d',
      GRAY: '1f99da09-bef8-413b-a22e-303ee6ae0467',
      SILKY: '98373627-06b6-4e21-9816-c9b459036fb5',
      BROWN: 'ebbf2c81-fa4d-45eb-aa3f-425f40d218e0',
      CURLY: '7610a715-e4c1-4190-bb3c-daa5d29a4b27',
      SLAVIC: '188e3571-be2a-484e-9a81-dd7fa1362b95',
    },
    symbol: 'N',
    invoicePrefix: 'N',
    invoiceAddition: 500,
  },
} as const

type ConfigKey = keyof typeof CONFIGS

export function getHardcodeData() {
  const key = APP_INSTANCE as ConfigKey
  return CONFIGS[key] ?? CONFIGS.default
}
