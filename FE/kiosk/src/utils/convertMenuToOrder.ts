// utils/convertMenuToOrderItem.ts
import { OrderItem, SelectedOption } from '@/interfaces/OrderInterface'
import { MenuItem } from '@/interfaces/RecommendInterface'

export function convertMenuToOrderItem(menu: MenuItem): OrderItem {
  const selectedOptions: SelectedOption[] = []

  menu.options.forEach((optionGroup) => {
    optionGroup.isDefault.forEach((isSelected, index) => {
      if (isSelected) {
        selectedOptions.push({
          category: optionGroup.optionCategory,
          value: optionGroup.optionNames[index],
          price: optionGroup.additionalPrices[index],
          optionId: optionGroup.optionIds[index],
        })
      }
    })
  })

  const basePrice = menu.price
  const totalPrice =
    basePrice + selectedOptions.reduce((acc, opt) => acc + opt.price, 0)

  return {
    menuId: menu.menuId,
    name: menu.menuName,
    basePrice,
    quantity: 1,
    options: selectedOptions,
    totalPrice,
  }
}
