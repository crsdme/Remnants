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
      LENGTH: '77dd5e49-d802-4e5e-a6bd-71cbe8488d13',
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
      ALBINO: '',
    },
    hairLengths: {
      40: '213',
      45: '214',
      50: '215',
      55: '216',
      60: '217',
      65: '218',
      70: '219',
      75: '220',
      80: '221',
      85: '222',
      90: '223',
      95: '224',
      100: '225',
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
      '6cc18709-f20a-45b6-b80b-771dc2a588ed': 1075,
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
      RED: '89b60d3c-2f97-4f94-8305-00d749fdf134',
    },
    hairLengths: {
      40: 'a3b85e8b-1485-4f2a-80c6-70ae8fa05865',
      45: '6e067a1d-6729-4429-885d-d0cda2475fc5',
      50: '0c5d4f68-a993-4eed-ab67-736e4cd3f47f',
      55: 'a9df2aa1-8338-42e0-afc8-497320c7f1e5',
      60: '726e6d4e-b066-486b-877f-5885528e868a',
      65: '58e1d38b-502d-4cc6-8d9a-44a9f64289d7',
      70: '86a08712-4d85-453c-bad1-98c098841163',
      75: '17dfb0a0-ea23-4152-b7b2-d54d63a49e7c',
      80: 'dd904594-feaf-4f93-9b38-33d521e463f5',
      85: 'e41f0080-cfc2-4dc4-874d-d994320babd6',
      90: 'd2f14204-ae1f-46b0-a89f-e2768ae707d9',
      95: 'ec016440-5e2c-45c1-b3ac-92c14cdc3fb1',
      100: 'baeef84f-acb2-4d5e-a5ac-abe7cf0a7f80',
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
      ALBINO: '',
    },
    hairLengths: {
      40: '',
      45: '',
      50: '',
      55: '',
      60: '',
      65: '',
      70: '',
      75: '',
      80: '',
      85: '',
      90: '',
      95: '',
      100: '',
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
