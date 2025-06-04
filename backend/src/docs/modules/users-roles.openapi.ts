import { createUserRoleSchema, duplicateUserRoleSchema, editUserRoleSchema, getUserRoleSchema, removeUserRoleSchema } from '../../schemas/user-role.schema'
import { registry } from '../registry'

registry.registerPath({
  method: 'get',
  path: '/user-roles/get',
  summary: 'Получить список ролей пользователей',
  operationId: 'getUserRoles',
  tags: ['User Roles'],
  request: {
    query: getUserRoleSchema,
  },
  responses: {
    200: {
      description: 'Успешный ответ',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/UserRoleResponse',
            },
          },
        },
      },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/user-roles/create',
  summary: 'Создать новую роль пользователя',
  operationId: 'createUserRole',
  tags: ['User Roles'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserRoleSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Роль пользователя успешно создана',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/user-roles/edit',
  summary: 'Редактировать роль пользователя',
  operationId: 'editUserRole',
  tags: ['User Roles'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: editUserRoleSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Роль пользователя успешно изменена',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/user-roles/remove',
  summary: 'Удалить роль пользователя',
  operationId: 'removeUserRole',
  tags: ['User Roles'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: removeUserRoleSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Роль пользователя успешно удалена',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/user-roles/import',
  summary: 'Импорт ролей пользователей из файла',
  operationId: 'importUserRoles',
  tags: ['User Roles'],
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
      description: 'Роли пользователей успешно импортированы',
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/user-roles/duplicate',
  summary: 'Дублировать роль пользователя',
  operationId: 'duplicateUserRole',
  tags: ['User Roles'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: duplicateUserRoleSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Роли пользователей успешно дублированы',
    },
  },
})
