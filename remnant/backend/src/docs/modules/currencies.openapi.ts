import { batchCurrencySchema, createCurrencySchema, editCurrencySchema, getCurrencySchema, removeCurrencySchema } from '../../schemas/currency.schema'
import { registry } from '../registry'

registry.registerPath({
  method: 'get',
  path: '/currencies/get',
  summary: 'Получить список валют',
  operationId: 'getCurrencies',
  tags: ['Currencies'],
  request: {
    query: getCurrencySchema,
  },
  responses: {
    200: {
      description: 'Успешный ответ',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/CurrencyResponse',
            },
          },
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/currencies/create',
  summary: 'Создать новую валюту',
  operationId: 'createCurrency',
  tags: ['Currencies'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createCurrencySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Валюта успешно создана',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/currencies/edit',
  summary: 'Редактировать валюту',
  operationId: 'editCurrency',
  tags: ['Currencies'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: editCurrencySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Валюта успешно изменена',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/currencies/remove',
  summary: 'Удалить валюту',
  operationId: 'removeCurrency',
  tags: ['Currencies'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: removeCurrencySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Валюта успешно удалена',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/currencies/batch',
  summary: 'Массовое обновление валют',
  operationId: 'batchCurrencies',
  tags: ['Currencies'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: batchCurrencySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Массовое обновление успешно выполнено',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/currencies/import',
  summary: 'Импорт валют из файла',
  operationId: 'importCurrencies',
  tags: ['Currencies'],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                format: 'binary',
              },
            },
            required: ['file'],
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Файл успешно загружен',
    },
  },
})
