import { useState, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  priceWithFries?: number;
  priceMenu?: number;
  image: string;
  imageStorageId?: Id<'_storage'>;
  categories: string[];
  popular: boolean;
  displayOrder: number;
  categoryOrders: { category: string; order: number }[];
  active: boolean;
}

export default function MenuItemsPage() {
  const menuItems = useQuery(api.menuItems.list);
  const categories = useQuery(api.categories.list);
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const createMenuItem = useMutation(api.menuItems.create);
  const updateMenuItem = useMutation(api.menuItems.update);
  const deleteMenuItem = useMutation(api.menuItems.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const setMenuItemToppingCategories = useMutation(api.toppingsAdmin.setMenuItemToppingCategories);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<'menuItems'> | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: 0,
    priceWithFries: 0,
    priceMenu: 0,
    image: '',
    categories: [],
    popular: false,
    displayOrder: 0,
    categoryOrders: [],
    active: true,
  });

  // Image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Topping categories state
  const [selectedToppingCategories, setSelectedToppingCategories] = useState<string[]>([]);

  // Category filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: Id<'menuItems'> | null }>({
    isOpen: false,
    id: null
  });

  // Filter menu items by category
  const filteredMenuItems = menuItems?.filter((item) =>
    categoryFilter === 'all' ? true : item.categories?.includes(categoryFilter)
  ).sort((a, b) => {
    if (categoryFilter === 'all') {
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    }
    const orderA = a.categoryOrders?.find(o => o.category === categoryFilter)?.order ?? (a.displayOrder || 0);
    const orderB = b.categoryOrders?.find(o => o.category === categoryFilter)?.order ?? (b.displayOrder || 0);
    return orderA - orderB;
  });

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      priceWithFries: 0,
      priceMenu: 0,
      image: '',
      categories: categories?.[0]?.slug ? [categories[0].slug] : [],
      popular: false,
      displayOrder: menuItems?.length || 0,
      categoryOrders: [],
      active: true,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedToppingCategories([]);
    setIsModalOpen(true);
  };

  const handleEdit = async (item: any) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      priceWithFries: item.priceWithFries,
      priceMenu: item.priceMenu,
      image: item.image,
      imageStorageId: item.imageStorageId,
      categories: item.categories || [],
      popular: item.popular || false,
      displayOrder: item.displayOrder || 0,
      categoryOrders: item.categoryOrders || [],
      active: item.active !== false,
    });
    setSelectedFile(null);
    setPreviewUrl(item.image);

    // Load existing topping category assignments (deduplicate to prevent rendering issues)
    const toppingIds = (item.toppingCategoryIds as string[] | undefined) || [];
    const uniqueCategoryIds = [...new Set(toppingIds)];
    setSelectedToppingCategories(uniqueCategoryIds);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let imageStorageId: Id<'_storage'> | undefined = formData.imageStorageId;
      let imageUrl = formData.image;

      // Upload file if selected
      if (selectedFile) {
        // Step 1: Get upload URL
        const uploadUrl = await generateUploadUrl();

        // Step 2: Upload file
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': selectedFile.type },
          body: selectedFile,
        });

        const { storageId } = await result.json();
        imageStorageId = storageId;
        // Clear the external URL so the backend resolves the image from storage
        imageUrl = '';
      }

      let menuItemId: Id<'menuItems'>;

      if (editingId) {
        await updateMenuItem({
          id: editingId,
          ...formData,
          image: imageUrl,
          imageStorageId,
        });
        menuItemId = editingId;
      } else {
        menuItemId = await createMenuItem({
          ...formData,
          image: imageUrl || '',
          imageStorageId,
        });
      }

      // Save topping category assignments
      await setMenuItemToppingCategories({
        menuItemId,
        categoryIds: selectedToppingCategories,
      });

      setIsModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClick = (id: Id<'menuItems'>) => {
    setConfirmModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (confirmModal.id) {
      await deleteMenuItem({ id: confirmModal.id });
    }
  };


  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Menu Items</h1>
            <p className="text-slate-600 mt-2">Manage your restaurant menu items</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            <Plus className="w-5 h-5" />
            Add Menu Item
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <label className="text-sm font-medium text-slate-700">Filter by category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            {filteredMenuItems?.length ?? 0} item{(filteredMenuItems?.length ?? 0) !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMenuItems?.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col">
              <div className="aspect-video bg-slate-100 relative group">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                {!item.active && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <span className="bg-gray-900/80 text-white text-xs px-2 py-1 rounded-full">Inactive</span>
                  </div>
                )}
                {categoryFilter !== 'all' && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                    #{item.categoryOrders?.find((o: any) => o.category === categoryFilter)?.order ?? (item.displayOrder || 0)}
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-1 gap-2">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1" title={item.name}>{item.name}</h3>
                  {item.popular && (
                    <span className="flex-shrink-0 text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2 h-8 leading-4">{item.description}</p>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900">{item.price.toFixed(2)}€</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs font-medium"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8 mt-16">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Optional description"
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price with Fries</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceWithFries || ''}
                    onChange={(e) => setFormData({ ...formData, priceWithFries: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Menu Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceMenu || ''}
                    onChange={(e) => setFormData({ ...formData, priceMenu: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category Orders</label>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {formData.categories.map((categorySlug) => {
                      const categoryName = categories?.find(c => c.slug === categorySlug)?.name || categorySlug;
                      const currentOrder = formData.categoryOrders?.find(o => o.category === categorySlug)?.order ?? 0;

                      return (
                        <div key={categorySlug} className="flex items-center gap-3">
                          <label className="text-sm text-slate-600 w-32 truncate">{categoryName}:</label>
                          <input
                            type="number"
                            value={currentOrder}
                            onChange={(e) => {
                              const newOrder = parseInt(e.target.value) || 0;
                              const newCategoryOrders = [...(formData.categoryOrders || [])];
                              const existingIndex = newCategoryOrders.findIndex(o => o.category === categorySlug);

                              if (existingIndex >= 0) {
                                newCategoryOrders[existingIndex] = { category: categorySlug, order: newOrder };
                              } else {
                                newCategoryOrders.push({ category: categorySlug, order: newOrder });
                              }

                              setFormData({ ...formData, categoryOrders: newCategoryOrders });
                            }}
                            className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        </div>
                      );
                    })}
                    {formData.categories.length === 0 && (
                      <p className="text-xs text-slate-400">Select categories to set their display order</p>
                    )}
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Image</label>
                  <div className="space-y-3">
                    {/* Preview */}
                    {previewUrl && (
                      <div className="relative w-full aspect-video bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
                        />
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition"
                      >
                        <Upload className="w-5 h-5 text-slate-500" />
                        <span className="text-slate-600">
                          {selectedFile ? selectedFile.name : 'Upload Image'}
                        </span>
                      </button>

                      {selectedFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(formData.image || null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Or use URL */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-200"></div>
                      <span className="text-xs text-slate-400">or use URL</span>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        if (!selectedFile) setPreviewUrl(e.target.value);
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categories</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    {categories?.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat.slug)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...formData.categories, cat.slug]
                              : formData.categories.filter((c) => c !== cat.slug);
                            setFormData({ ...formData, categories: newCategories });
                          }}
                          className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition">
                          {cat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.categories.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Please select at least one category</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={formData.popular}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                  />
                  <label htmlFor="popular" className="ml-2 text-sm font-medium text-slate-700">
                    Popular
                  </label>
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

                {/* Topping Categories Section */}
                {toppingCategories && toppingCategories.length > 0 && (
                  <div className="col-span-2 border-t border-slate-200 pt-4 mt-2">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Topping Categories
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      Select categories and drag to reorder. Order affects frontend display.
                    </p>

                    {/* Selected categories - reorderable */}
                    {selectedToppingCategories.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-xs font-medium text-slate-600 mb-2">Selected (in order):</p>
                        {selectedToppingCategories.map((catId, index) => {
                          const cat = toppingCategories.find((c) => c.categoryId === catId);
                          if (!cat) return null;
                          return (
                            <div
                              key={catId}
                              className="flex items-center gap-2 p-2 border border-blue-200 bg-blue-50 rounded-lg"
                            >
                              <span className="text-xs text-slate-400 w-5">{index + 1}.</span>
                              <span className="text-sm text-slate-700 flex-1">{cat.name}</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (index > 0) {
                                      const newOrder = [...selectedToppingCategories];
                                      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                                      setSelectedToppingCategories(newOrder);
                                    }
                                  }}
                                  disabled={index === 0}
                                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                  title="Move up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (index < selectedToppingCategories.length - 1) {
                                      const newOrder = [...selectedToppingCategories];
                                      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                      setSelectedToppingCategories(newOrder);
                                    }
                                  }}
                                  disabled={index === selectedToppingCategories.length - 1}
                                  className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                  title="Move down"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedToppingCategories(
                                      selectedToppingCategories.filter((id) => id !== catId)
                                    );
                                  }}
                                  className="p-1 text-red-400 hover:text-red-600"
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Unselected categories - click to add */}
                    {toppingCategories.filter((c) => !selectedToppingCategories.includes(c.categoryId)).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-slate-600 mb-2">Available:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {toppingCategories
                            .filter((c) => !selectedToppingCategories.includes(c.categoryId))
                            .map((cat) => (
                              <button
                                key={cat._id}
                                type="button"
                                onClick={() => {
                                  setSelectedToppingCategories([...selectedToppingCategories, cat.categoryId]);
                                }}
                                className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-left"
                              >
                                <span className="text-green-500">+</span>
                                <span className="text-sm text-slate-700">{cat.name}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    editingId ? 'Update' : 'Create'
                  )}
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
        title="Delete Menu Item"
        message="Are you sure you want to delete this menu item? This action cannot be undone."
      />
    </AdminLayout>
  );
}
