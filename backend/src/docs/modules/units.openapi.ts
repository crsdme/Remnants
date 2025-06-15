import { batchUnitSchema, createUnitSchema, editUnitSchema, getUnitSchema, removeUnitSchema } from '../../schemas/unit.schema'
import { registry } from '../registry'

registry.registerPath({
  method: 'get',
  path: '/units/get',
  summary: 'Получить список единиц',
  operationId: 'getUnits',
  tags: ['Units'],
  request: {
    query: getUnitSchema,
  },
  responses: {
    200: {
      description: 'Успешный ответ',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/UnitResponse',
            },
          },
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/units/create',
  summary: 'Создать новую единицу',
  operationId: 'createUnit',
  tags: ['Units'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUnitSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Единица успешно создана',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/units/edit',
  summary: 'Редактировать еденицу',
  operationId: 'editUnit',
  tags: ['Units'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: editUnitSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Еденица успешно изменена',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/units/remove',
  summary: 'Удалить еденицу',
  operationId: 'removeUnit',
  tags: ['Units'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: removeUnitSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Еденица успешно удалена',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/units/batch',
  summary: 'Массовое обновление едениц',
  operationId: 'batchUnits',
  tags: ['Units'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: batchUnitSchema,
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
  path: '/units/import',
  summary: 'Импорт единиц из файла',
  operationId: 'importUnits',
  tags: ['Units'],
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
