import { DEFAULT_SETTINGS } from '../../config/constants'
import { connectDB } from '../../config/db'
import { SettingModel } from '../../models/setting.model'
import { UserModel } from '../../models/user.model'
import * as UserRoleService from '../../services/user-role.service'
import * as UserService from '../../services/user.service'

async function initializeApp() {
  console.log('🔧 Initializing application...')

  await connectDB()

  const userCount = await UserModel.countDocuments()
  if (userCount === 0) {
    const roleRequest = await UserRoleService.create({
      names: { en: 'admin' },
      priority: 1,
      permissions: ['other.admin'],
      active: true,
    })

    await UserService.create({
      name: 'Admin',
      login: 'admin',
      access: {
        warehouseIds: [],
        cashregisterIds: [],
        siteIds: [],
        expenseCategoryIds: [],
        cashregisterAccountIds: [],
        deliveryServiceIds: [],
        orderSourceIds: [],
        orderStatusIds: [],
      },
      password: 'admin',
      roleId: roleRequest.data?.id?.toString() ?? '',
      active: true,
    })
    console.log('✅ Admin user created')
  }

  const settingsCount = await SettingModel.countDocuments()
  if (settingsCount !== DEFAULT_SETTINGS.length) {
    await SettingModel.deleteMany({})
    await SettingModel.insertMany(DEFAULT_SETTINGS)
    console.log('✅ Default settings loaded')
  }

  console.log('🎉 Application initialized')
}

initializeApp()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Error initializing:', err)
    process.exit(1)
  })
