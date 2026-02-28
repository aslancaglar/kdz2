"use client";

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ConfirmModal from '../../../src/components/admin/ConfirmModal';
import { Plus, Edit, Trash2, X, GripVertical } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAdminAuth } from '../../../src/context/AdminAuthContext';

interface CategoryFormData {
    categoryId: string;
    name: string;
    minSelection: number;
    maxSelection: number | undefined;
    displayOrder: number;
    active: boolean;
}

export default function ToppingCategoriesPage() {
    const { adminToken } = useAdminAuth();
    const categories = useQuery(api.toppingsAdmin.listToppingCategories);
    const createCategory = useMutation(api.toppingsAdmin.createToppingCategory);
    const updateCategory = useMutation(api.toppingsAdmin.updateToppingCategory);
    const deleteCategory = useMutation(api.toppingsAdmin.removeToppingCategory);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<Id<'toppingCategories'> | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        categoryId: '',
        name: '',
        minSelection: 0,
        maxSelection: undefined,
        displayOrder: 0,
        active: true,
    });

    // Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: Id<'toppingCategories'> | null }>({
        isOpen: false,
        id: null
    });

    const handleCreate = () => {
        setEditingId(null);
        setFormData({
            categoryId: `cat-${Date.now()}`,
            name: '',
            minSelection: 0,
            maxSelection: undefined,
            displayOrder: categories?.length || 0,
            active: true,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (category: any) => {
        setEditingId(category._id);
        setFormData({
            categoryId: category.categoryId,
            name: category.name,
            minSelection: category.minSelection,
            maxSelection: category.maxSelection,
            displayOrder: category.displayOrder || 0,
            active: category.active !== false,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!adminToken) return;
            if (editingId) {
                await updateCategory({
                    adminToken,
                    id: editingId,
                    ...formData,
                });
            } else {
                await createCategory({ ...formData, adminToken });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category. See console for details.');
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: Id<'toppingCategories'>) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmModal({ isOpen: true, id });
    };

    const handleConfirmDelete = async () => {
        if (confirmModal.id) {
            try {
                if (!adminToken) return;
                await deleteCategory({ id: confirmModal.id, adminToken });
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Failed to delete category. See console for details.');
            }
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Topping Categories</h1>
                        <p className="text-slate-600 mt-2">Manage topping categories (Sauces, Crudités, etc.)</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Category
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Selection Rules
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {categories?.map((category) => (
                                    <tr key={category._id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <GripVertical className="w-4 h-4" />
                                                <span className="text-sm font-medium">{category.displayOrder}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">{category.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-600 font-mono">{category.categoryId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-600">
                                                Min: {category.minSelection} | Max: {category.maxSelection ?? '∞'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${category.active !== false
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {category.active !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-4">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleEdit(category);
                                                    }}
                                                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteClick(e, category._id)}
                                                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!categories || categories.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            No topping categories found. Click "Add Category" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-8 mt-16">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingId ? 'Edit Category' : 'Add Category'}
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
                                    placeholder="e.g., Sauces, Crudités"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Category ID</label>
                                <input
                                    type="text"
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent font-mono"
                                    placeholder="e.g., sauces"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Unique identifier for this category</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Min Selection
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minSelection}
                                        onChange={(e) => setFormData({ ...formData, minSelection: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">0 = optional</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Max Selection
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.maxSelection ?? ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            maxSelection: e.target.value ? parseInt(e.target.value) : undefined
                                        })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                        placeholder="∞"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Empty = unlimited</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
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
                title="Delete Topping Category"
                message="Are you sure you want to delete this category? All toppings in this category will remain but will be unassigned."
            />
        </>
    );
}
