import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProducts, deleteProduct, updateProduct } from "../../../store/slices/productSlice";
import { Link } from "react-router-dom";
import { Edit, Trash2, Plus, Search, ToggleLeft, ToggleRight } from "lucide-react";
import Pagination from "../../../components/Pagination";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { items, pagination, loading } = useSelector((state) => state.products);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchAdminProducts({ page, limit: 10, search, category }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, page, search, category]);

  const handleToggleFeature = (id, currentStatus) => {
    dispatch(updateProduct({ id, data: { is_featured_community_build: !currentStatus } }));
    // Note: We're reusing the community flag as the "Featured" toggle for now
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to deactivate this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <Link
          to="/admin/products/create"
          className="flex items-center gap-2 bg-[#0f172a] text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition"
        >
          <Plus size={16} /> Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search Products..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="border rounded-lg px-4 py-2 outline-none"
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Gaming">Gaming</option>
          <option value="Office">Office</option>
          <option value="Workstation">Workstation</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-gray-500 font-medium text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Base Price (₹)</th>
              <th className="px-6 py-4">Featured</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-gray-500">{product.category}</td>
                <td className="px-6 py-4 font-mono text-gray-700">
                  ₹{(product.base_price / 100).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleToggleFeature(product._id, product.is_featured_community_build)}
                    className={`text-2xl ${product.is_featured_community_build ? "text-green-600" : "text-gray-300"}`}
                  >
                    {product.is_featured_community_build ? <ToggleRight /> : <ToggleLeft />}
                  </button>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                   <Link to={`/admin/products/edit/${product._id}`} className="text-gray-500 hover:text-blue-600">
                    <Edit size={18} />
                   </Link>
                   <button onClick={() => handleDelete(product._id)} className="text-gray-500 hover:text-red-600">
                    <Trash2 size={18} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination pagination={pagination} setPage={setPage} />
      </div>
    </div>
  );
};

export default ProductManagement;