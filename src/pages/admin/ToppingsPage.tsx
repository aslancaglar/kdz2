import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

export default function ToppingsPage() {
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const allToppings = useQuery(api.toppingsAdmin.listToppings);
  const createTopping = useMutation(api.toppingsAdmin.createTopping);
  const updateTopping = useMutation(api.toppingsAdmin.updateTopping);
  const deleteTopping = useMutation(api.toppingsAdmin.removeTopping);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<'toppings'> | null>(null);
  const [formData, setFormData] = useState({
    toppingId: '',
    name: '',
    price: 0,
    categoryId: '',
    displayOrder: 0,
    active: true,
  });

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: Id<'toppings'> | null }>({
    isOpen: false,
    id: null
  });

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      toppingId: `topping-${Date.now()}`,
      name: '',
      price: 0,
      categoryId: toppingCategories?.[0]?.categoryId || '',
      displayOrder: allToppings?.length || 0,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (topping: any) => {
    setEditingId(topping._id);
    setFormData({
      toppingId: topping.toppingId,
      name: topping.name,
      price: topping.price || 0,
      categoryId: topping.categoryId,
      displayOrder: topping.displayOrder || 0,
      active: topping.active !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateTopping({ id: editingId, ...formData });
      } else {
        await createTopping(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving topping:', error);
    }
  };

  const handleDeleteClick = (id: Id<'toppings'>) => {
    setConfirmModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.id) {
      await deleteTopping({ id: confirmModal.id });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Toppings Management</h1>
            <p className="text-slate-600 mt-2">Manage toppings and their categories</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <Plus className="w-5 h-5" />
            Add Topping
          </button>
        </div>

        <div className="space-y-6">
          {toppingCategories?.map((category) => {
            const categoryToppings = allToppings?.filter(
              (t) => t.categoryId === category.categoryId
            ) || [];

            return (
              <div key={category._id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-200 p-4 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-900">{category.name}</h2>
                  <p className="text-sm text-slate-600">
                    Min: {category.minSelection} | Max: {category.maxSelection || 'Unlimited'}
                  </p>
                </div>

                <div className="p-4">
                  {categoryToppings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryToppings.map((topping) => (
                        <div
                          key={topping._id}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                        >
                          <div>
                            <p className="font-medium text-slate-900">{topping.name}</p>
                            <p className="text-sm text-slate-600">
                              {topping.price ? `+${topping.price.toFixed(2)}€` : 'Free'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(topping)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(topping._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No toppings in this category</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Topping' : 'Add Topping'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                >
                  {toppingCategories?.map((cat) => (
                    <option key={cat._id} value={cat.categoryId}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                />
                <label htmlFor="active" className="ml-2 text-sm font-medium text-slate-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Topping"
        message="Are you sure you want to delete this topping? This action cannot be undone."
      />
    </AdminLayout>
  );
}
