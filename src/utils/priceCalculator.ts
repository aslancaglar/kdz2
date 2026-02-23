import { MenuItem } from '../types/order';
import { PriceOption, SelectedTopping } from '../types/order';

export function getBasePrice(menuItem: MenuItem, priceOption: PriceOption): number {
  switch (priceOption) {
    case 'seul':
      return menuItem.price;
    case 'frites':
      return menuItem.priceWithFries || menuItem.price;
    case 'menu':
      return menuItem.priceMenu || menuItem.price;
    default:
      return menuItem.price;
  }
}

export function calculateToppingsPrice(selectedToppings: SelectedTopping[]): number {
  return selectedToppings.reduce((sum, topping) => sum + (topping.price || 0), 0);
}

export function calculateTotalPrice(
  menuItem: MenuItem,
  priceOption: PriceOption,
  selectedToppings: SelectedTopping[]
): number {
  const basePrice = getBasePrice(menuItem, priceOption);
  const toppingsPrice = calculateToppingsPrice(selectedToppings);
  return basePrice + toppingsPrice;
}
