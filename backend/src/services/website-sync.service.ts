import type { Product } from '../types/product.type'
import axios from 'axios'
import slugify from 'slugify'

export async function createProduct(product: Product): Promise<any> {
  const productForSite = {
    product_description: {
      ru: {
        name: product.names.ru,
        url: slugify(product.names.ru || '', { lower: true }),
      },
    },
    model: `ROCKCRM ${product.names.ru}`,
    _id: product.id,
    price: product.price,
    // imagesToDownload: product.images.toObject().map(item => ({
    //   ...item,
    //   imageName: `${slugify(product.names.ru || '', { lower: true })}_${Math.floor(Math.random() * 90000)}.jpg`,
    // })),
  }

  const data = await axios.post(
    `https://raw-hair-wholesale.com/index.php?route=extension/module/rockcrm&key=64926492&type=createproduct`,
    JSON.stringify(productForSite),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  )

  console.log(data)

  return { status: 'success', code: 'MESSAGE_SENT', message: 'Message sent' }
}
