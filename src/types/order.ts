export interface Topping {
  id: string;
  name: string;
  price?: number;
}

export interface ToppingCategory {
  id: string;
  name: string;
  minSelection: number;
  maxSelection?: number;
  toppings: Topping[];
}

export interface SelectedTopping {
  toppingId: string;
  name: string;
  price?: number;
}

export type PriceOption = 'seul' | 'frites' | 'menu';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  image: string;
  priceOption: PriceOption;
  basePrice: number;
  selectedToppings: SelectedTopping[];
  totalPrice: number;
}

export interface MenuItemToppingAssignment {
  menuItemId: string;
  categoryIds: string[];
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  priceWithFries?: number;
  priceMenu?: number;
  image: string;
  categories?: string[];
  popular?: boolean;
}
