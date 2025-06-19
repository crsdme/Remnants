import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import FormData from 'form-data'
import { STORAGE_PATHS } from '../config/constants'
import * as ProductService from './product.service'

export async function sendMessage(): Promise<any> {
  const { products } = await ProductService.get({ filters: { language: 'ru' }, pagination: { full: true }, sorters: { seq: 'asc' } })
  const product = products[0]
  const form = new FormData()
  form.append('chat_id', '-1002510719726')
  form.append('caption', product.names.ru || 'NO_NAME')
  form.append('photo', fs.createReadStream(path.join(STORAGE_PATHS.productImages, product.images[0].filename)))

  axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, form, {
    headers: form.getHeaders(),
  })
    .then((res) => {
      console.log('✅ Фото успешно отправлено:', res.data)
    })
    .catch((err) => {
      console.error('❌ Ошибка при отправке:', err.response?.data || err.message)
    })

  return { status: 'success', code: 'MESSAGE_SENT', message: 'Message sent' }
}
