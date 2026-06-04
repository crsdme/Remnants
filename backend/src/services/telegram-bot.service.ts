import type { Product } from '@remnant/shared'
import fs from 'node:fs'
import path from 'node:path'
import axios from 'axios'
import FormData from 'form-data'
import { STORAGE_PATHS } from '@/config/constants'

export async function sendMessage(product: Product): Promise<any> {
  const form = new FormData()
  form.append('chat_id', '-1002510719726')

  const weightProperty = { value: 123 }
  const lengthProperty = { value: 55 }

  const name = product.names.en
  const weight = `${weightProperty.value} g`
  const length = `${lengthProperty.value} cm`
  const price = `€${product.price}`

  const caption = `🧶 ${name}\n📏 ${length} ‧ ⚖️ ${weight} ‧ 💶 ${price}`

  form.append('caption', caption)

  form.append(
    'reply_markup',
    JSON.stringify({
      inline_keyboard: [
        [
          {
            text: '📩 Order Now',
            url: 'https://t.me/rawhairwholesalemanager',
          },
        ],
      ],
    }),
  )

  form.append('photo', fs.createReadStream(path.join(STORAGE_PATHS.productImages, product.images[0].filename)))

  await axios
    .post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, form, {
      headers: form.getHeaders(),
    })
    .then((res) => {
      console.log('✅ Фото успешно отправлено:', res.data)
    })
    .catch((err) => {
      console.error('❌ Ошибка при отправке:', err.response?.data || err.message)
    })
  // const form = new FormData()
  // form.append('chat_id', '-1002510719726')
  // form.append('caption', product.names.ru || 'NO_NAME')
  // form.append('photo', fs.createReadStream(path.join(STORAGE_PATHS.productImages, product.images[0].filename)))

  // axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, form, {
  //   headers: form.getHeaders(),
  // })
  //   .then((res) => {
  //     console.log('✅ Фото успешно отправлено:', res.data)
  //   })
  //   .catch((err) => {
  //     console.error('❌ Ошибка при отправке:', err.response?.data || err.message)
  //   })

  return { status: 'success', code: 'MESSAGE_SENT', message: 'Message sent' }
}
