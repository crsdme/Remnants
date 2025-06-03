import fs from 'node:fs'
import { STORAGE_PATHS } from './constants'

export function initStorageDirectories() {
  for (const dir of Object.values(STORAGE_PATHS)) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}
