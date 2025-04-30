import { batchLanguageSchema, createLanguageSchema, editLanguageSchema, getLanguageSchema, removeLanguageSchema } from '../../schemas/language.schema'
import { registry } from '../registry'

registry.registerPath({
  method: 'get',
  path: '/languages/get',
  summary: 'Получить список языков',
  operationId: 'getLanguages',
  tags: ['Languages'],
  request: {
    query: getLanguageSchema,
  },
  responses: {
    200: {
      description: 'Успешный ответ',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/LanguageResponse',
            },
          },
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/languages/create',
  summary: 'Создать новый язык',
  operationId: 'createLanguage',
  tags: ['Languages'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createLanguageSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Язык успешно создан',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/languages/edit',
  summary: 'Редактировать язык',
  operationId: 'editLanguage',
  tags: ['Languages'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: editLanguageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Язык успешно изменен',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/languages/remove',
  summary: 'Удалить язык',
  operationId: 'removeLanguage',
  tags: ['Languages'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: removeLanguageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Язык успешно удален',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/languages/batch',
  summary: 'Массовое обновление языков',
  operationId: 'batchLanguages',
  tags: ['Languages'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: batchLanguageSchema,
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
  path: '/languages/import',
  summary: 'Импорт языков из файла',
  operationId: 'importLanguages',
  tags: ['Languages'],
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
