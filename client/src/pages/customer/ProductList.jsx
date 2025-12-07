
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicProducts } from "../../store/slices/productSlice";
import Pagination from "../../components/Pagination";
import { Search, Filter, ShoppingCart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pagination, loading } = useSelector((state) => state.products);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "newest",
  });
    const [page,setPage]=useState(1);

  // Debounce search
  const [seatchInput, setseatchInput] = useState("");


  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: seatchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [seatchInput]);

  useEffect(() => {
    dispatch(fetchPublicProducts({...filters,page}));
  }, [dispatch, filters,page]);






  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Explore All PCs
          </h1>
          <p className="text-lg text-gray-500">
            Discover our range of pre-built systems and unique community
            creations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search PCs..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={seatchInput}
              onChange={(e) => setseatchInput(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <Filter size={18} className="text-gray-500" />
              <select
                className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value, page: 1 })
                }
              >
                <option value="">All Categories</option>
                <option value="Gaming">Gaming</option>
                <option value="Office">Office</option>
                <option value="Workstation">Workstation</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-500">Sort:</span>
              <select
                className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer"
                value={filters.sort}
                onChange={(e) =>
                  setFilters({ ...filters, sort: e.target.value, page: 1 })
                }
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-96 shadow-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {items.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={
                      product.images?.[0] ||
                      "https://via.placeholder.com/400x300?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 h-10">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        Starting at
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{(product.base_price / 100).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No products found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && items.length > 0 && (
          <div className="flex justify-center">
            <Pagination
             pagination={pagination}
              page={page}
              setPage={setPage}    
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
