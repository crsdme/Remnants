import { batchCategorySchema, createCategorySchema, editCategorySchema, getCategorySchema, removeCategorySchema } from '../../schemas/category.schema'
import { registry } from '../registry'

registry.registerPath({
  method: 'get',
  path: '/categories/get',
  summary: 'Получить список категорий',
  operationId: 'getCategories',
  tags: ['Categories'],
  request: {
    query: getCategorySchema,
  },
  responses: {
    200: {
      description: 'Успешный ответ',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/CategoryResponse',
            },
          },
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/categories/create',
  summary: 'Создать новую категорию',
  operationId: 'createCategory',
  tags: ['Categories'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createCategorySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Категория успешно создана',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/categories/edit',
  summary: 'Редактировать категорию',
  operationId: 'editCategory',
  tags: ['Categories'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: editCategorySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Категория успешно изменена',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/categories/remove',
  summary: 'Удалить категорию',
  operationId: 'removeCategory',
  tags: ['Categories'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: removeCategorySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Категория успешно удалена',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/categories/batch',
  summary: 'Массовое обновление категорий',
  operationId: 'batchCategories',
  tags: ['Categories'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: batchCategorySchema,
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
  path: '/categories/import',
  summary: 'Импорт категорий из файла',
  operationId: 'importCategories',
  tags: ['Categories'],
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
