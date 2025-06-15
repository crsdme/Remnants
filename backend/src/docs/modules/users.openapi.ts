import { createUserSchema, editUserSchema, getUserSchema, removeUserSchema } from '../../schemas/user.schema'
import { registry } from '../registry'

registry.registerPath({
  method: 'get',
  path: '/users/get',
  summary: 'Получить список пользователей',
  operationId: 'getUsers',
  tags: ['Users'],
  request: {
    query: getUserSchema,
  },
  responses: {
    200: {
      description: 'Успешный ответ',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/UserResponse',
            },
          },
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/users/create',
  summary: 'Создать нового пользователя',
  operationId: 'createUser',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Пользователь успешно создан',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/users/edit',
  summary: 'Редактировать пользователя',
  operationId: 'editUser',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: editUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Пользователь успешно изменен',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/users/remove',
  summary: 'Удалить пользователя',
  operationId: 'removeUser',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: removeUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Пользователь успешно удален',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/users/import',
  summary: 'Импорт пользователей из файла',
  operationId: 'importUsers',
  tags: ['Users'],
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
