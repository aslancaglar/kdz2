import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { PriceOption, SelectedTopping, OrderItem } from '../types/order';
import { useOrder } from '../context/OrderContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { getBasePrice, calculateToppingsPrice, calculateTotalPrice } from '../utils/priceCalculator';
import { formatPrice } from '../utils/formatters';

interface MenuItemModalProps {
  item: {
    _id: Id<"menuItems">;
    _creationTime: number;
    name: string;
    description: string;
    price: number;
    priceWithFries?: number;
    priceMenu?: number;
    image: string;
    category: string;
    popular?: boolean;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  const { addToOrder } = useOrder();
  const [priceOption, setPriceOption] = useState<PriceOption>('seul');
  const [selectedToppings, setSelectedToppings] = useState<Record<string, SelectedTopping[]>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const availableCategories = useQuery(api.queries.getToppingsForMenuItem, { menuItemId: item._id });

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setSelectedToppings({});
      setValidationErrors({});
      setPriceOption('seul');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allSelectedToppings = Object.values(selectedToppings).flat();
  const currentPrice = getBasePrice(item, priceOption);
  const toppingsPrice = calculateToppingsPrice(allSelectedToppings);
  const totalPrice = calculateTotalPrice(item, priceOption, allSelectedToppings);

  const handleToppingToggle = (categoryId: string, toppingId: string, name: string, price: number | undefined) => {
    const category = availableCategories?.find(cat => cat.id === categoryId);
    if (!category) return;

    setSelectedToppings(prev => {
      const categoryToppings = prev[categoryId] || [];
      const isSelected = categoryToppings.some(t => t.toppingId === toppingId);

      if (isSelected) {
        return {
          ...prev,
          [categoryId]: categoryToppings.filter(t => t.toppingId !== toppingId),
        };
      } else {
        if (category.maxSelection && categoryToppings.length >= category.maxSelection) {
          return prev;
        }
        return {
          ...prev,
          [categoryId]: [...categoryToppings, { toppingId, name, price }],
        };
      }
    });

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[categoryId];
      return newErrors;
    });
  };

  const validateSelections = () => {
    const errors: Record<string, string> = {};

    availableCategories?.forEach(category => {
      const categoryToppings = selectedToppings[category.id] || [];
      const count = categoryToppings.length;

      if (category.minSelection > 0 && count < category.minSelection) {
        errors[category.id] = `Veuillez sélectionner au moins ${category.minSelection} option(s)`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddToOrder = () => {
    if (!validateSelections()) {
      return;
    }

    const orderItem: OrderItem = {
      id: `${item._id}-${Date.now()}`,
      menuItemId: item._id,
      name: item.name,
      image: item.image,
      priceOption,
      basePrice: currentPrice,
      selectedToppings: allSelectedToppings,
      totalPrice: totalPrice,
    };

    addToOrder(orderItem);
    onClose();
  };

  const getSelectionStatus = (categoryId: string) => {
    const category = availableCategories?.find(cat => cat.id === categoryId);
    if (!category) return '';

    const count = (selectedToppings[categoryId] || []).length;

    if (category.maxSelection) {
      return `${count}/${category.maxSelection}`;
    }
    return `${count}`;
  };

  const isToppingDisabled = (categoryId: string, toppingId: string) => {
    const category = availableCategories?.find(cat => cat.id === categoryId);
    if (!category || !category.maxSelection) return false;

    const categoryToppings = selectedToppings[categoryId] || [];
    const isSelected = categoryToppings.some(t => t.toppingId === toppingId);

    return !isSelected && categoryToppings.length >= category.maxSelection;
  };

  const hasPriceOptions = item.priceWithFries || item.priceMenu;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Absolute Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">{item.name}</h2>
          <p className="text-gray-600 mb-6">{item.description}</p>

          {hasPriceOptions && (
            <div className="mb-6">
              <h3 className="text-sm font-extrabold text-gray-900 mb-3 font-display">Formule</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPriceOption('seul')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    priceOption === 'seul'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">Seul</div>
                  <div className="text-lg font-bold font-display">{formatPrice(item.price)}</div>
                </button>

                {item.priceWithFries && (
                  <button
                    onClick={() => setPriceOption('frites')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      priceOption === 'frites'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">Frites</div>
                    <div className="text-lg font-bold font-display">{formatPrice(item.priceWithFries)}</div>
                  </button>
                )}

                {item.priceMenu && (
                  <button
                    onClick={() => setPriceOption('menu')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      priceOption === 'menu'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">Menu</div>
                    <div className="text-lg font-bold font-display">{formatPrice(item.priceMenu)}</div>
                  </button>
                )}
              </div>
            </div>
          )}

          {availableCategories && availableCategories.length > 0 && (
            <div className="space-y-6">
              {availableCategories.map(category => (
                <div key={category.id} className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-extrabold text-gray-900 font-display bg-red-50 px-3 py-2 rounded-lg">
                      {category.name}
                      {category.minSelection > 0 && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getSelectionStatus(category.id)}
                      {category.maxSelection && ` max`}
                    </span>
                  </div>

                  {validationErrors[category.id] && (
                    <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {validationErrors[category.id]}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {category.toppings.map(topping => {
                      const isSelected = (selectedToppings[category.id] || []).some(
                        t => t.toppingId === topping.id
                      );
                      const isDisabled = isToppingDisabled(category.id, topping.id);

                      return (
                        <button
                          key={topping.id}
                          onClick={() => handleToppingToggle(
                            category.id,
                            topping.id,
                            topping.name,
                            topping.price
                          )}
                          disabled={isDisabled}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-red-500 bg-red-50'
                              : isDisabled
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {topping.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {topping.price !== undefined && topping.price > 0
                                  ? `+${formatPrice(topping.price)}`
                                  : 'Gratuit'}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="border-t bg-white p-4 rounded-b-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-900 font-display">Total</span>
            <span className="text-2xl font-bold text-red-500 font-display">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <button
            onClick={handleAddToOrder}
            className="w-full bg-red-500 text-white py-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Ajouter à la commande
          </button>
        </div>
      </div>
    </div>
  );
}
