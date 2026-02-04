import { PriceOption } from '../types/order';

export function formatPriceOption(option: PriceOption): string {
  switch (option) {
    case 'seul':
      return 'Seul';
    case 'frites':
      return 'Avec Frites';
    case 'menu':
      return 'Menu Complet';
    default:
      return '';
  }
}

export function formatPrice(price: number): string {
  return `${price.toFixed(2)}€`;
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/(\d{2})(?=\d)/g, '$1 ');
}
