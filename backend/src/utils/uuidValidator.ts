import { validate as isUuid } from 'uuid'

export const uuidValidator = {
  validator: (value: any) => value == null || isUuid(value),
  message: (props: { value: any }) => `${props.value} is not a valid UUID`,
}
