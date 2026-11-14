const APP_INSTANCE = process.env.APP_INSTANCE ?? 'default'

const CONFIGS = {
  default: {
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
      'a8781973-17ad-4388-bf97-67db386faefe': 1182,
      '15ec0db3-801a-4b49-977b-9dc2ea224762': 980,
      '80e0ef91-d597-4d85-8392-de92482bd15f': 1103,
      '743923f1-c9ac-46c3-9be8-10474ccbd917': 1370,
      '929dc694-afd4-406c-b766-00a1d483c68f': 1212,
      'bb3f3e6b-2aa7-4c32-8b18-df0d020c2e8e': 1155,
      '9710cd12-bf66-4ad2-97e2-58546f24812c': 871,
      '6cce41d5-3269-4683-9403-6ccd35e3b5ce': 1226,
      '96f2af3b-5c9c-45c0-9d86-642ec7d87113': 990,
      'b043e8ac-e6a2-4109-9c11-989e010d6064': 1400,
      '389f3c3e-517d-44b6-b182-5d1f3a788b58': 884,
      'ad066db8-bfa8-428f-8e26-4e7069dce606': 483,
      '7c03598f-3974-4ecb-a556-12f7cb03c3b8': 965,
      '1d341b4a-714e-4779-b6cd-3b085786be3a': 1160,
      'e6946264-f2c5-4651-9160-f1b034b25883': 960,
      '622c506f-476a-4825-9bdd-c06031e8a82c': 375,
      'e10a34a9-a81c-4ed5-b4eb-e296758f3211': 931,
      '1e4c799e-9597-4844-ab56-bd78571842c9': 870,
      '8aa5b465-78ef-4557-938c-ece7bc427f36': 1214,
      'c2734e3c-9196-40b1-b05e-d3208d178eca': 972,
      'a51b202e-29a2-4529-843c-3f00a1cec5c6': 871,
      'f4c5121f-4f9a-49dd-9ca3-b840d7cd40af': 1256,
      '52a6564c-8b87-4ed9-b5b2-a7e4d7689928': 1230,
      '709a126a-61ff-46c2-8bc7-d81e0d4e7b81': 446,
      '32a29099-6bf3-4636-a476-2321b29da187': 920,
      '4e69c54a-633c-4596-86a7-66a22fcf68f3': 1116,
      'e4f2f644-dea7-4f12-a5cb-2c0716c34c7b': 1220,
      'ee1da099-a653-4817-993a-fef73ea4f63b': 1014,
      '74f5f4c6-d405-4c6d-aff7-f2cd767801cb': 1431,
      '26ca24bb-6848-4c66-a617-acbd17dc9cdf': 1100,
      '12d692e1-c3f4-4568-98fe-f8957d3169b6': 567,
    },
    propertyIds: {
      LENGTH: 'efcc3c51-a146-4975-bc5b-196745f76891',
      WEIGHT: '7c3e2c1b-f2bf-4639-baf2-7b1101fa7bf2',
      HAIR_TYPE: '25144e64-5c4c-47fd-842d-c0a2393f972e',
      SEGMENT: '38a8a42a-139f-4d73-82bd-013acf48491c',
      PROCCESSING_TYPE: '16fcb56a-3eee-4153-bb8a-1b2309c9fe8a',
      STRUCTURE: '1bbaef6f-0cbb-4bfb-8117-4d572b8c2975',
      COMBING: '4f8f8ae8-b4f5-4821-9dc2-cf3556287049',
      COLOR: 'ee6ebb43-785f-4cfe-9f0b-08883d0fd358',
      COLOR_CATEGORY: '4599d9f7-6292-4f78-9af4-21ef2d8b7188',
    },
    colorCategories: {
      OMBRE: '3b67a025-058d-45a4-97cc-e8a5c2b1b77b',
      PLATIN: '3aa8d773-0cfc-4c84-8582-6d1b0d418523',
      NATURAL_COLOR: '962ff5ac-4e16-4648-8ef4-bb6b41e865c2',
      BLONDE: '2a570cec-761c-4fa3-8a80-aa6cbd33cf14',
      BALAYAGE: '62d60f2e-86ed-40ee-9eda-cddd42e934e4',
      EXTREAMELY: '5d656b42-1247-4418-9bb9-0bd94941ed40',
      NATURAL_BLONDE: '57f2a025-f595-4a9e-b9b7-30629b7f933f',
    },
    segments: {
      STANDART: '0f996011-f608-4391-9ce2-ac01bd02e816',
      PREMIUM: '67e9683e-678e-462b-9453-89428335f135',
      LUX: 'fffc12d6-7d26-48d3-a073-bc0647c33259',
      INDIA: 'bfa03c0a-f19e-4665-8a64-2c28faf5bded',
    },
    propertyGroups: {
      raw: 'f676759b-2e39-4644-b3cb-b2ae71afda25',
      dyed: '9142095d-18be-48bb-91a1-083127eb781b',
      services: '1c3bbf0a-3d82-4e44-bb65-22653c093497',
    },
    hairTypes: {
      VIRGIN: 'b930fb75-61a6-41c0-88de-0c69082b7f06',
      SILKY: 'aeb36d06-1a12-4319-9313-51abcbed38fb',
      GRAY: '91dcfe98-6192-492f-98de-1ff22bdff01a',
      BROWN: '44307e30-0fb8-4ab1-af56-6d8d724dd204',
      CURLY: '822ec142-d144-44fb-ba96-582cff8757b3',
      SLAVIC: '7f6d9a15-9f9f-4ddc-a815-dfaf613a0901',
      GOLD: '328add53-06d2-43c1-9c03-9498eee7fde3',
      ALBINO: '8a379f9e-4a84-4d8c-8108-b35188be2fe1',
      RED: '89b60d3c-2f97-4f94-8305-00d749fdf134',
      REMY: '9163dd30-79d6-4301-891e-33940266a8d7',
      NATURAL_BALAYAGE: 'f00c2025-c846-494f-b9ab-220706d46cbd',
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
  },
  exile: {
    providerPrice: {
      'eaafd34d-68aa-48a6-9de9-349f2b08a7b8': 980,
      '54eff814-6885-4d13-b8ba-2fc0946b8529': 1146,
      '1f814052-5fec-4e9f-b119-793441ba0269': 1020,
      '7a422e90-ac88-4809-aafc-012dfc24b5ae': 1000,
      'c73f0115-ecab-4e49-8fa6-17faf667277c': 1182,
      '403073ef-aa4e-4f3b-8150-ece62b459f4a': 950,
      '7fee319e-0f5b-41b2-92c3-e838cc10e936': 1075,
      '5e6927fb-0691-4074-acd1-901c5174ad55': 1142,
      '64a32280-8126-4a97-bef8-014f5995c1f6': 1208,
    },
    propertyIds: {
      LENGTH: 'b42b8212-c49c-41c5-b070-16097fa5c546',
      WEIGHT: 'd81e819b-5253-49e7-b393-72f09cd167b8',
      HAIR_TYPE: '1e12c088-7b3f-4eb7-993e-b4c32330c2fa',
      SEGMENT: '',
      PROCCESSING_TYPE: '',
      STRUCTURE: '',
      THREATMENT: '',
      COMBING: '',
      COLOR: '',
      COLOR_CATEGORY: '4599d9f7-6292-4f78-9af4-21ef2d8b7188',
    },
    colorCategories: {
      OMBRE: '3b67a025-058d-45a4-97cc-e8a5c2b1b77b',
      PLATIN: '3aa8d773-0cfc-4c84-8582-6d1b0d418523',
      NATURAL_COLOR: '962ff5ac-4e16-4648-8ef4-bb6b41e865c2',
      BLONDE: '2a570cec-761c-4fa3-8a80-aa6cbd33cf14',
      BALAYAGE: '62d60f2e-86ed-40ee-9eda-cddd42e934e4',
      EXTREAMELY: '5d656b42-1247-4418-9bb9-0bd94941ed40',
      NATURAL_BLONDE: '57f2a025-f595-4a9e-b9b7-30629b7f933f',
    },
    segments: {
      STANDART: '',
      PREMIUM: '',
      LUX: '',
      INDIA: 'bfa03c0a-f19e-4665-8a64-2c28faf5bded',
    },
    propertyGroups: {
      raw: '',
      dyed: '',
      services: '',
    },
    hairTypes: {
      VIRGIN: '9f49b061-4c93-40a1-bd9e-c1cfaa0a465d',
      GRAY: '1f99da09-bef8-413b-a22e-303ee6ae0467',
      SILKY: '98373627-06b6-4e21-9816-c9b459036fb5',
      BROWN: 'ebbf2c81-fa4d-45eb-aa3f-425f40d218e0',
      CURLY: '7610a715-e4c1-4190-bb3c-daa5d29a4b27',
      GOLD: '',
      SLAVIC: '188e3571-be2a-484e-9a81-dd7fa1362b95',
      ALBINO: '5fbd09bc-f14f-4a35-8180-acf8ff3c2459',
      RED: 'eaad9e8d-94ba-43e1-83aa-71592b58a73a',
      REMY: '9163dd30-79d6-4301-891e-33940266a8d7',
      NATURAL_BALAYAGE: 'f00c2025-c846-494f-b9ab-220706d46cbd',
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
  },
} as const

type ConfigKey = keyof typeof CONFIGS

/** Temporary inventory box categories: name → UUID (from rawRmntDB). */
export const INVENTORY_CATEGORY_BY_NAME = {
  'Virgin 20-49': 'd0ca654e-bfe3-4336-85f5-f9fbf1bb9544',
  'Virgin 50-59': '62d1ff89-471f-4307-bf5d-a5db39078480',
  'Virgin 60-69': '1afdc036-c434-4626-99d3-c7e456064af9',
  'Virgin 70-79': '81f50986-0d63-4f19-b8f0-7f0156ce5052',
  'Virgin 80-110': '032ede09-e617-4a3f-8c6a-ceaf893ef58f',
  'Virgin Curly': '5be32538-4ce3-45ce-86ab-92500bdce76e',
  'Silky 20-49': 'e0d51d8a-683d-4756-b1f7-f72d80ab818b',
  'Silky 50-59': '6002d0bf-9160-4df3-8f15-1bf6f62f8f69',
  'Silky 60-69': 'da244701-3583-40b6-8d78-a518086a9387',
  'Silky 70-79': '8abdc867-5cb1-4d3a-8830-31e48c304dd7',
  'Silky 80-110': 'a57832f0-0af4-4263-a084-bbceb4d6b04b',
  'Silky Curly': '92e30ddd-10fa-4972-a0e3-4c32be38c795',
  'Brown 20-49': 'ade40cb7-b459-4d74-9f3d-8fb178b8b3c5',
  'Brown 50-59': '52b5f384-df8e-46a0-b84f-e6a101b31086',
  'Brown 60-69': '8daf9f59-6458-4329-8de2-02d3e2b4cb0a',
  'Brown 70-79': '893612c0-0ae1-4a85-be7b-f53dca3abb4d',
  'Brown 80-110': 'ab9660ac-04ca-4710-8c99-17cc7e6c5490',
  'Brown Curly': '2b4bdeaf-3fec-4a8c-a301-bb8d7070168a',
  'Slavic 20-49': '25a5cbf2-1a06-4e07-a707-252bf620d618',
  'Slavic 50-59': 'cedfce46-9e3f-442f-a21c-fd38d7136696',
  'Slavic 60-69': '030ad34c-7a2e-4814-b9bc-cb99d0d75590',
  'Slavic 70-79': '56c68e22-5fa0-4288-b67a-fd4f60db9825',
  'Slavic 80-110': 'd5f32105-75c5-496b-bc0b-a59710d2ea07',
  'Raw 20-49': '33bd7a4f-8010-4579-9af6-faeb67898d66',
  'Raw 50-59': '46855059-0551-4f93-9792-e79db4c9e5b5',
  'Raw 60-69': '9c219c44-4c6d-4e69-a95a-b78db1017ac8',
  'Raw 70-79': '02fdb6ab-b810-4c64-b1ef-965dfabff0b9',
  'Raw 80-110': 'a775612a-35f2-48cf-bf85-bd78477f79ab',
  'Raw Curly': 'f21b068d-4bb9-4196-8e74-9e90e5717be3',
  'Exclusive': '39d75a80-df91-445c-b1f3-6e92992df234',
  'India Blonde 20-49': '6840fdd3-a743-45c3-a665-6aec5505baa3',
  'India Blonde 50-59': 'c1982549-c4ff-48da-8b83-a8b51faca9b7',
  'India Blonde 60-69': '0215fb48-058b-4a5f-b1ae-239c2350fc05',
  'India Blonde 70-110': '59e05701-0b18-4e70-a733-a7320d38852e',
  'India Natural Color 20-49': 'e123069a-2d64-498b-90d0-b799312d3005',
  'India Natural Color 50-59': '753fb7f7-c5ef-418c-8091-9cbd588097b4',
  'India Natural Color 60-69': '0bdfc968-e0e5-4eaa-8097-e8654cfea92f',
  'India Natural Color 70-110': '73273f30-a9eb-427f-ad79-f9f322cdd7bd',
  'India Natural Blonde': '6bcaaf74-e122-4705-8993-1a029bca1d03',
  'India Platin': '44fba70a-c135-4cba-9da9-3fe35e29f730',
  'India Ombre': 'c31b2c41-9bbd-4556-9ab3-509ad91736d3',
  'India Balayage': '4a479518-2409-400f-b022-eb12abef4b61',
  'India Extremely': '6c93ecbc-15dd-41cb-a968-1560b7d0d9b5',
  'Standart Blonde 20-49': '0f0c82f5-b2a0-473f-8e33-f41ece2f103c',
  'Standart Blonde 50-59': '15703e03-a416-46d5-8b0f-a172540f2342',
  'Standart Blonde 60-69': 'f61b44d5-4dd0-4404-970d-513c3a9af531',
  'Standart Blonde 70-110': '086447ec-3d45-4011-838e-a42090b417e5',
  'Standart Natural Color 20-49': '811e8bd0-fb6a-4298-adc2-023c55183085',
  'Standart Natural Color 50-59': '8b2e7a0f-7e80-44bc-83b0-a46168894434',
  'Standart Natural Color 60-69': '822b63d9-25fc-462f-81b0-d0a138e35682',
  'Standart Natural Color 70-110': 'ca5683cb-2eca-4e3f-965c-107ac85956df',
  'Standart Natural Blonde': '08b380af-7a53-449e-928c-4b013bea3399',
  'Standart Platin': '0e8daad9-9fea-4e64-9263-a80c76a40e66',
  'Standart Ombre': '353ddf0f-7728-4d03-82bf-bce7d134a016',
  'Standart Balayage': '6793b663-15f5-4b8b-b552-6b626efd38e6',
  'Premium Blonde 20-49': '082b4051-f96b-4605-a668-3b5e49d9cba6',
  'Premium Blonde 50-59': '43c38c06-2fb2-410d-b049-c1add61aaa85',
  'Premium Blonde 60-69': 'e58bebb7-b41f-4c74-838b-4e1efae56914',
  'Premium Blonde 70-110': '4bbad5ed-33f7-4885-b5c1-6fb74c7bf5e1',
  'Premium Natural Color 20-49': '1b2c0193-dd98-4092-814f-220718692c97',
  'Premium Natural Color 50-59': '11ab29e3-d15b-4365-ab70-061b0948c786',
  'Premium Natural Color 60-69': 'b9ffecdf-a378-4867-b666-c6ec51beb745',
  'Premium Natural Color 70-110': 'cbfbf43f-5487-405d-a49d-8dbee0f9a426',
  'Premium Natural Blonde': '2c8b87a3-49ce-4a5c-883a-72aef32097cd',
  'Premium Platin': 'e0c67759-d1b7-4033-878a-8c589a85e71d',
  'Premium Ombre': 'af20463c-9e77-4510-b991-231f6a248991',
  'Premium Balayage': '5d6d6bb3-1464-4b70-95aa-6cc53b4faaee',
  'Lux Blonde 20-49': 'b4880ee4-7184-4802-aca5-4c6558f7f793',
  'Lux Blonde 50-59': '39e9e2bf-84e3-47b2-8628-bb83a3d079db',
  'Lux Blonde 60-69': 'dc46970d-4397-4413-b146-ebd875db662c',
  'Lux Blonde 70-110': 'c1d374dd-22ac-4553-9724-0a652b35c119',
  'Lux Natural Color 20-49': '3e7bc26a-5dfa-4e4a-b862-864cdaf60662',
  'Lux Natural Color 50-59': '901a7fb6-ded4-47c0-894d-c2ecdc7a248d',
  'Lux Natural Color 60-69': '956aacc4-b0da-45b2-8a8a-080d4315ee9c',
  'Lux Natural Color 70-110': '94354460-af1b-4ab3-b2bb-538508e87a19',
  'Lux Natural Blonde': '15b25c68-3ce5-4d4b-99f9-1ed0d850fc32',
  'Lux Platin': 'e6910c59-e364-4b6c-b3b2-f1468b51274f',
  'Lux Ombre': 'bf99bde1-f257-43f8-8a71-581bdff72245',
  'Lux Balayage': '603ae2ca-057e-40c1-b739-9ef9791bac26',
  'Empty': '72252172-7c60-40d5-9aad-2126010da7e5',
} as const

export const INVENTORY_CATEGORY_NAMES = Object.keys(INVENTORY_CATEGORY_BY_NAME) as Array<
  keyof typeof INVENTORY_CATEGORY_BY_NAME
>

type RawLengthBucket = '20-49' | '50-59' | '60-69' | '70-79' | '80-110'
type DyedLengthBucket = '20-49' | '50-59' | '60-69' | '70-110'

function rawLengthBucket(length: number): RawLengthBucket | null {
  if (length >= 20 && length <= 49)
    return '20-49'
  if (length >= 50 && length <= 59)
    return '50-59'
  if (length >= 60 && length <= 69)
    return '60-69'
  if (length >= 70 && length <= 79)
    return '70-79'
  if (length >= 80 && length <= 110)
    return '80-110'
  return null
}

function dyedLengthBucket(length: number): DyedLengthBucket | null {
  if (length >= 20 && length <= 49)
    return '20-49'
  if (length >= 50 && length <= 59)
    return '50-59'
  if (length >= 60 && length <= 69)
    return '60-69'
  if (length >= 70 && length <= 110)
    return '70-110'
  return null
}

/** Resolve inventory category UUID from product properties. Unmatched → Empty. */
export function resolveInventoryCategoryId(input: {
  groupId?: string
  length?: number
  typeIds: string[]
  segmentIds: string[]
  colorCategoryIds: string[]
}): string {
  const { propertyGroups, hairTypes, segments, colorCategories } = getHardcodeData()
  const empty = INVENTORY_CATEGORY_BY_NAME.Empty
  const { groupId, length, typeIds, segmentIds, colorCategoryIds } = input

  if (groupId === propertyGroups.services)
    return empty

  if (groupId === propertyGroups.dyed) {
    const segment
      = segmentIds.includes(segments.INDIA)
        ? 'India'
        : segmentIds.includes(segments.STANDART)
          ? 'Standart'
          : segmentIds.includes(segments.PREMIUM)
            ? 'Premium'
            : segmentIds.includes(segments.LUX)
              ? 'Lux'
              : null

    if (segment === null)
      return empty

    if (colorCategoryIds.includes(colorCategories.EXTREAMELY)) {
      return segment === 'India' ? INVENTORY_CATEGORY_BY_NAME['India Extremely'] : empty
    }

    if (colorCategoryIds.includes(colorCategories.NATURAL_BLONDE))
      return INVENTORY_CATEGORY_BY_NAME[`${segment} Natural Blonde`]
    if (colorCategoryIds.includes(colorCategories.PLATIN))
      return INVENTORY_CATEGORY_BY_NAME[`${segment} Platin`]
    if (colorCategoryIds.includes(colorCategories.OMBRE))
      return INVENTORY_CATEGORY_BY_NAME[`${segment} Ombre`]
    if (colorCategoryIds.includes(colorCategories.BALAYAGE))
      return INVENTORY_CATEGORY_BY_NAME[`${segment} Balayage`]

    if (typeof length !== 'number')
      return empty

    const bucket = dyedLengthBucket(length)
    if (bucket === null)
      return empty

    if (colorCategoryIds.includes(colorCategories.BLONDE))
      return INVENTORY_CATEGORY_BY_NAME[`${segment} Blonde ${bucket}`]
    if (colorCategoryIds.includes(colorCategories.NATURAL_COLOR))
      return INVENTORY_CATEGORY_BY_NAME[`${segment} Natural Color ${bucket}`]

    return empty
  }

  // raw / default
  const isCurly = typeIds.includes(hairTypes.CURLY)
  const types = typeIds.filter(id => id !== hairTypes.CURLY && id !== hairTypes.REMY)

  if (isCurly) {
    if (types.includes(hairTypes.VIRGIN))
      return INVENTORY_CATEGORY_BY_NAME['Virgin Curly']
    if (types.includes(hairTypes.SILKY))
      return INVENTORY_CATEGORY_BY_NAME['Silky Curly']
    if (types.includes(hairTypes.BROWN))
      return INVENTORY_CATEGORY_BY_NAME['Brown Curly']
    return INVENTORY_CATEGORY_BY_NAME['Raw Curly']
  }

  if (typeof length !== 'number')
    return empty

  const bucket = rawLengthBucket(length)
  if (bucket === null)
    return empty

  if (types.includes(hairTypes.VIRGIN))
    return INVENTORY_CATEGORY_BY_NAME[`Virgin ${bucket}`]
  if (types.includes(hairTypes.SILKY))
    return INVENTORY_CATEGORY_BY_NAME[`Silky ${bucket}`]
  if (types.includes(hairTypes.BROWN))
    return INVENTORY_CATEGORY_BY_NAME[`Brown ${bucket}`]
  if (types.includes(hairTypes.SLAVIC))
    return INVENTORY_CATEGORY_BY_NAME[`Slavic ${bucket}`]
  if (
    types.includes(hairTypes.GOLD)
    || types.includes(hairTypes.RED)
    || types.includes(hairTypes.GRAY)
    || types.includes(hairTypes.ALBINO)
  ) {
    return INVENTORY_CATEGORY_BY_NAME[`Raw ${bucket}`]
  }

  return empty
}

export function getHardcodeData() {
  const key = APP_INSTANCE as ConfigKey
  return CONFIGS[key] ?? CONFIGS.default
}

/** Invoice sale price per kg (major units). Temporary one-tenant pricing. */
export function getInvoiceProductPrice(
  lengthCm: number,
  type: string[],
  segmentIds: string[],
  colorCategoryIds: string[],
): number | null {
  const { hairTypes, colorCategories, segments } = getHardcodeData()

  const segmentTables: Record<string, { min: number, max: number, price: number }[]> = {
    [segments.INDIA]: [
      { min: 20, max: 24, price: 800 },
      { min: 25, max: 29, price: 850 },
      { min: 30, max: 34, price: 900 },
      { min: 35, max: 39, price: 950 },
      { min: 40, max: 44, price: 1000 },
      { min: 45, max: 49, price: 1050 },
      { min: 50, max: 54, price: 1100 },
      { min: 55, max: 59, price: 1150 },
      { min: 60, max: 64, price: 1200 },
      { min: 65, max: 69, price: 1250 },
      { min: 70, max: 74, price: 1300 },
      { min: 75, max: 79, price: 1350 },
      { min: 80, max: 84, price: 1400 },
      { min: 85, max: 89, price: 1450 },
      { min: 90, max: 94, price: 1500 },
      { min: 95, max: 99, price: 1550 },
      { min: 100, max: 104, price: 1600 },
    ],
    [segments.STANDART]: [
      { min: 20, max: 24, price: 1100 },
      { min: 25, max: 29, price: 1150 },
      { min: 30, max: 34, price: 1200 },
      { min: 35, max: 39, price: 1250 },
      { min: 40, max: 44, price: 1300 },
      { min: 45, max: 49, price: 1350 },
      { min: 50, max: 54, price: 1400 },
      { min: 55, max: 59, price: 1450 },
      { min: 60, max: 64, price: 1500 },
      { min: 65, max: 69, price: 1550 },
      { min: 70, max: 74, price: 1600 },
      { min: 75, max: 79, price: 1650 },
      { min: 80, max: 84, price: 1700 },
      { min: 85, max: 89, price: 1750 },
      { min: 90, max: 94, price: 1800 },
      { min: 95, max: 99, price: 1850 },
      { min: 100, max: 104, price: 1900 },
    ],
    [segments.PREMIUM]: [
      { min: 20, max: 24, price: 1400 },
      { min: 25, max: 29, price: 1450 },
      { min: 30, max: 34, price: 1500 },
      { min: 35, max: 39, price: 1550 },
      { min: 40, max: 44, price: 1600 },
      { min: 45, max: 49, price: 1650 },
      { min: 50, max: 54, price: 1700 },
      { min: 55, max: 59, price: 1750 },
      { min: 60, max: 64, price: 1800 },
      { min: 65, max: 69, price: 1850 },
      { min: 70, max: 74, price: 1900 },
      { min: 75, max: 79, price: 1950 },
      { min: 80, max: 84, price: 2000 },
      { min: 85, max: 89, price: 2050 },
      { min: 90, max: 94, price: 2100 },
      { min: 95, max: 99, price: 2150 },
      { min: 100, max: 104, price: 2200 },
    ],
    [segments.LUX]: [
      { min: 20, max: 24, price: 1400 },
      { min: 25, max: 29, price: 1500 },
      { min: 30, max: 34, price: 1600 },
      { min: 35, max: 39, price: 1700 },
      { min: 40, max: 44, price: 1800 },
      { min: 45, max: 49, price: 1900 },
      { min: 50, max: 54, price: 2000 },
      { min: 55, max: 59, price: 2100 },
      { min: 60, max: 64, price: 2200 },
      { min: 65, max: 69, price: 2300 },
      { min: 70, max: 74, price: 2400 },
      { min: 75, max: 79, price: 2500 },
      { min: 80, max: 84, price: 2600 },
      { min: 85, max: 89, price: 2700 },
      { min: 90, max: 94, price: 2800 },
      { min: 95, max: 99, price: 2900 },
      { min: 100, max: 104, price: 3000 },
    ],
  }

  let table = [
    { min: 20, max: 24, price: 700 },
    { min: 25, max: 29, price: 750 },
    { min: 30, max: 34, price: 800 },
    { min: 35, max: 39, price: 850 },
    { min: 40, max: 44, price: 900 },
    { min: 45, max: 49, price: 950 },
    { min: 50, max: 54, price: 1000 },
    { min: 55, max: 59, price: 1150 },
    { min: 60, max: 64, price: 1200 },
    { min: 65, max: 69, price: 1250 },
    { min: 70, max: 74, price: 1300 },
    { min: 75, max: 79, price: 1350 },
    { min: 80, max: 84, price: 1400 },
    { min: 85, max: 89, price: 1500 },
    { min: 90, max: 94, price: 1600 },
    { min: 95, max: 99, price: 1700 },
    { min: 100, max: 104, price: 1800 },
    { min: 105, max: 109, price: 1900 },
    { min: 110, max: 114, price: 2000 },
  ]

  let multiply = 1
  let surcharge = 0
  const matchedSegment = segmentIds.find(id => id !== '' && segmentTables[id] !== undefined)

  if (matchedSegment !== undefined) {
    table = segmentTables[matchedSegment]
    multiply = 1

    if (
      colorCategoryIds.includes(colorCategories.BLONDE)
      || colorCategoryIds.includes(colorCategories.PLATIN)
      || colorCategoryIds.includes(colorCategories.OMBRE)
      || colorCategoryIds.includes(colorCategories.BALAYAGE)
      || colorCategoryIds.includes(colorCategories.EXTREAMELY)
    ) {
      surcharge = 100
    }
  }
  else {
    if (type.includes(hairTypes.CURLY)) {
      multiply = 1.3
    }

    if (type.includes(hairTypes.VIRGIN)) {
      table = [
        { min: 20, max: 24, price: 1400 },
        { min: 25, max: 29, price: 1500 },
        { min: 30, max: 34, price: 1600 },
        { min: 35, max: 39, price: 1700 },
        { min: 40, max: 44, price: 1800 },
        { min: 45, max: 49, price: 1900 },
        { min: 50, max: 54, price: 2000 },
        { min: 55, max: 59, price: 2100 },
        { min: 60, max: 64, price: 2200 },
        { min: 65, max: 69, price: 2300 },
        { min: 70, max: 74, price: 2400 },
        { min: 75, max: 79, price: 2500 },
        { min: 80, max: 84, price: 2600 },
        { min: 85, max: 89, price: 2700 },
        { min: 90, max: 94, price: 2800 },
        { min: 95, max: 99, price: 2900 },
        { min: 100, max: 104, price: 3000 },
        { min: 105, max: 109, price: 3100 },
        { min: 110, max: 114, price: 3200 },
      ]
    }

    if (type.includes(hairTypes.GOLD)) {
      table = [
        { min: 20, max: 24, price: 3800 },
        { min: 25, max: 29, price: 4000 },
        { min: 30, max: 34, price: 4200 },
        { min: 35, max: 39, price: 4400 },
        { min: 40, max: 44, price: 4600 },
        { min: 45, max: 49, price: 4800 },
        { min: 50, max: 54, price: 5000 },
        { min: 55, max: 59, price: 5200 },
        { min: 60, max: 64, price: 5400 },
        { min: 65, max: 69, price: 5600 },
        { min: 70, max: 74, price: 5800 },
        { min: 75, max: 79, price: 6000 },
        { min: 80, max: 84, price: 6200 },
        { min: 85, max: 89, price: 6400 },
        { min: 90, max: 94, price: 6600 },
        { min: 95, max: 99, price: 6800 },
        { min: 100, max: 104, price: 7000 },
        { min: 105, max: 109, price: 7200 },
        { min: 110, max: 114, price: 7400 },
      ]
    }

    if (type.includes(hairTypes.RED)) {
      table = [
        { min: 20, max: 24, price: 1800 },
        { min: 25, max: 29, price: 2000 },
        { min: 30, max: 34, price: 2200 },
        { min: 35, max: 39, price: 2400 },
        { min: 40, max: 44, price: 2600 },
        { min: 45, max: 49, price: 2800 },
        { min: 50, max: 54, price: 3000 },
        { min: 55, max: 59, price: 3200 },
        { min: 60, max: 64, price: 3400 },
        { min: 65, max: 69, price: 3600 },
        { min: 70, max: 74, price: 3800 },
        { min: 75, max: 79, price: 4000 },
        { min: 80, max: 84, price: 4200 },
        { min: 85, max: 89, price: 4400 },
        { min: 90, max: 94, price: 4600 },
        { min: 95, max: 99, price: 4800 },
        { min: 100, max: 104, price: 5000 },
        { min: 105, max: 109, price: 5200 },
        { min: 110, max: 114, price: 5400 },
      ]
    }

    if (type.includes(hairTypes.SLAVIC)) {
      table = [
        { min: 20, max: 24, price: 1800 },
        { min: 25, max: 29, price: 2000 },
        { min: 30, max: 34, price: 2200 },
        { min: 35, max: 39, price: 2400 },
        { min: 40, max: 44, price: 2600 },
        { min: 45, max: 49, price: 2800 },
        { min: 50, max: 54, price: 3000 },
        { min: 55, max: 59, price: 3200 },
        { min: 60, max: 64, price: 3400 },
        { min: 65, max: 69, price: 3600 },
        { min: 70, max: 74, price: 3800 },
        { min: 75, max: 79, price: 4000 },
        { min: 80, max: 84, price: 4200 },
        { min: 85, max: 89, price: 4400 },
        { min: 90, max: 94, price: 4600 },
        { min: 95, max: 99, price: 4800 },
        { min: 100, max: 104, price: 5000 },
        { min: 105, max: 109, price: 5200 },
        { min: 110, max: 114, price: 5400 },
      ]
      multiply = 1
    }

    if (type.includes(hairTypes.SILKY) || type.includes(hairTypes.BROWN) || type.includes(hairTypes.NATURAL_BALAYAGE)) {
      table = [
        { min: 20, max: 24, price: 900 },
        { min: 25, max: 29, price: 1000 },
        { min: 30, max: 34, price: 1100 },
        { min: 35, max: 39, price: 1200 },
        { min: 40, max: 44, price: 1300 },
        { min: 45, max: 49, price: 1400 },
        { min: 50, max: 54, price: 1500 },
        { min: 55, max: 59, price: 1600 },
        { min: 60, max: 64, price: 1700 },
        { min: 65, max: 69, price: 1800 },
        { min: 70, max: 74, price: 1900 },
        { min: 75, max: 79, price: 2000 },
        { min: 80, max: 84, price: 2100 },
        { min: 85, max: 89, price: 2200 },
        { min: 90, max: 94, price: 2300 },
        { min: 95, max: 99, price: 2400 },
        { min: 100, max: 104, price: 2500 },
        { min: 105, max: 109, price: 2600 },
        { min: 110, max: 114, price: 2700 },
      ]
    }
  }

  for (const row of table) {
    if (lengthCm >= row.min && lengthCm <= row.max) {
      return row.price * multiply + surcharge
    }
  }

  return null
}
