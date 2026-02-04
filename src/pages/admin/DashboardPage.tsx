import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { Pizza, Tag, UtensilsCrossed, ShoppingCart } from 'lucide-react';

export default function DashboardPage() {
  const categories = useQuery(api.categories.list);
  const menuItems = useQuery(api.menuItems.list);
  const toppingCategories = useQuery(api.toppingsAdmin.listToppingCategories);
  const orders = useQuery(api.queries.getAllOrders);

  const stats = [
    {
      label: 'Total Categories',
      value: categories?.length || 0,
      icon: Tag,
      color: 'bg-blue-500',
    },
    {
      label: 'Total Menu Items',
      value: menuItems?.length || 0,
      icon: Pizza,
      color: 'bg-green-500',
    },
    {
      label: 'Topping Categories',
      value: toppingCategories?.length || 0,
      icon: UtensilsCrossed,
      color: 'bg-yellow-500',
    },
    {
      label: 'Total Orders',
      value: orders?.length || 0,
      icon: ShoppingCart,
      color: 'bg-red-500',
    },
  ];

  const pendingOrders = orders?.filter((order) => order.status === 'pending').length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome to your restaurant admin panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Orders</h2>
            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">Order #{order._id.slice(-6)}</p>
                      <p className="text-sm text-slate-600">{order.items.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{order.totalPrice.toFixed(2)}€</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No orders yet</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-700">Pending Orders</span>
                <span className="font-bold text-slate-900">{pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-700">Active Menu Items</span>
                <span className="font-bold text-slate-900">
                  {menuItems?.filter((item) => item.active !== false).length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-700">Popular Items</span>
                <span className="font-bold text-slate-900">
                  {menuItems?.filter((item) => item.popular === true).length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
