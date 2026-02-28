import { PriceOption } from '../types/order';
import { formatPrice } from '../utils/formatters';

interface FormuleOptionsProps {
    price: number;
    priceWithFries?: number;
    priceMenu?: number;
    selectedOption: PriceOption;
    onSelect: (option: PriceOption) => void;
}

export default function FormuleOptions({
    price,
    priceWithFries,
    priceMenu,
    selectedOption,
    onSelect,
}: FormuleOptionsProps) {
    return (
        <div className="mb-6">
            <h3 className="text-sm font-extrabold text-gray-900 mb-3 font-display">Formule</h3>
            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => onSelect('seul')}
                    className={`p-3 rounded-lg border-2 transition-all ${selectedOption === 'seul'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="text-sm font-medium">Seul</div>
                    <div className="text-lg font-bold font-display">{formatPrice(price)}</div>
                </button>

                {priceWithFries && (
                    <button
                        onClick={() => onSelect('frites')}
                        className={`p-3 rounded-lg border-2 transition-all ${selectedOption === 'frites'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="text-sm font-medium">Frites</div>
                        <div className="text-lg font-bold font-display">{formatPrice(priceWithFries)}</div>
                    </button>
                )}

                {priceMenu && (
                    <button
                        onClick={() => onSelect('menu')}
                        className={`p-3 rounded-lg border-2 transition-all ${selectedOption === 'menu'
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="text-sm font-medium">Menu</div>
                        <div className="text-lg font-bold font-display">{formatPrice(priceMenu)}</div>
                    </button>
                )}
            </div>
        </div>
    );
}
