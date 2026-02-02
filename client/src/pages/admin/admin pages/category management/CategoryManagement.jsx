import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import api from "../../../../api/axios";
import { RefreshCcw } from "lucide-react";
import CustomModal from "../../../../components/CustomModal";
import Pagination from "../../../../components/Pagination";
import { ChevronDown } from "lucide-react";
const CategoryManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const [searchInput, setSearchInput] = useState("");

 
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminCategory", searchInput, page, status],
    queryFn: async () => {
      const response = await api.get("/admin/category", {
        params: {
          search: searchInput,
          page,
          limit: 10,
          status,
        },
      });
     
      return response.data;
    },
  });

  useEffect(() => {
    let id = setTimeout(() => {
      setSearchInput(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(id);
  }, [searchTerm]);

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/category/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminCategory"]);
    },
    onError: (error) => {
      setModal({
        isOpen: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to delete category",
        type: "error",
      });
    },
  });

  const handleDelete = (id) => {
    setModal({
      isOpen: true,
      title: "Confirm Action",
      message: "Are you sure you want to deactivate this category?",
      type: "confirmation",
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  //   const filteredCategories = categories.filter((category) =>
  //     category.name.toLowerCase().includes(searchTerm.toLowerCase())
  //   );

  return (
    <div className="animate-fade-up font-sans">
      <CustomModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Category Management
        </h1>
        <Link
          to="/admin/categories/create"
          className="flex items-center gap-2 bg-[#0f172a] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Category
        </Link>
      </div>

      <div className="flex bg-white p-4 rounded-xl shadow-sm mb-6 w-full justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
          />
        </div>
        <div className="relative">
          <select
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">Status All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : data.categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                data?.categories.map((category) => (
                  <tr
                    key={category._id}
                    className={`hover:bg-gray-50/80 transition-colors group ${
                      !category.isActive ? "opacity-60 bg-gray-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 text-sm">
                        {category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          category.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/categories/edit/${category._id}`}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(category._id)}
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          title="Deactivate"
                        >
                          {category.isActive ? (
                            <Trash2 className="w-4 h-4" />
                          ) : (
                            <RefreshCcw className="w-4 h-4"></RefreshCcw>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        pagination={data?.pagination}
        page={page}
        setPage={setPage}
      ></Pagination>
    </div>
  );
};

export default CategoryManagement;
