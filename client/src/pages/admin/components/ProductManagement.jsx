import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminProducts,
  deleteProduct,
  updateProduct,
} from "../../../store/slices/productSlice";
import { Link } from "react-router-dom";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";
import Swal from "sweetalert2";
import Pagination from "../../../components/Pagination";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { items, pagination, loading } = useSelector((state) => state.products);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const {data:categories=[]}=useQuery({
    queryKey:["adminCategory"],
    queryFn: async()=>{
      const response=await api.get("/admin/category")
      return response.data
    }
  })

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchAdminProducts({ page, limit: 10, search, category }));
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, page, search, category]);

  const handleToggleFeature = (id, currentStatus) => {
    dispatch(
      updateProduct({
        id,
        data: { is_featured_community_build: !currentStatus },
      })
    );
  };
  

     const statusList=categories.map(category=>{
      return <option key={category._id} value={category.name}>{category.name}</option>
     })

  


  const handleDelete = (id, isActive) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to ${
        isActive ? "deactivate" : "restore"
      } this product!`,
      icon: "question",
      iconColor: "#3B82F6",
      showCancelButton: true,
      confirmButtonText: `Yes, ${isActive ? "deactivate" : "restore"} it!`,
      buttonsStyling: false,
      customClass: {
        popup: "rounded-2xl shadow-2xl font-sans border border-gray-100",
        title: "text-xl font-bold text-gray-900",
        htmlContainer: "text-gray-600",
        confirmButton:
          "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 m-2",
        cancelButton:
          "bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 m-2",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteProduct(id)); 
      }
    });
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
          {statusList}
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
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Featured</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-gray-500">{product.category}</td>
                <td className="px-6 py-4 font-mono text-gray-700">
                  ₹{(product.base_price / 100).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      product.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.isActive ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      handleToggleFeature(
                        product._id,
                        product.is_featured_community_build
                      )
                    }
                    className={`text-2xl ${
                      product.is_featured_community_build
                        ? "text-green-600"
                        : "text-gray-300"
                    }`}
                  >
                    {product.is_featured_community_build ? (
                      <ToggleRight />
                    ) : (
                      <ToggleLeft />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <Link
                    to={`/admin/products/edit/${product._id}`}
                    className="text-gray-500 hover:text-blue-600"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id, product.isActive)}
                    className={`text-gray-500 ${
                      product.isActive
                        ? "hover:text-red-600"
                        : "hover:text-green-600"
                    }`}
                    title={product.isActive ? "Deactivate" : "Restore"}
                  >
                    {product.isActive ? (
                      <Trash2 size={18} />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination pagination={pagination} page={page} setPage={setPage} />
      </div>
    </div>
  );
};

export default ProductManagement;
