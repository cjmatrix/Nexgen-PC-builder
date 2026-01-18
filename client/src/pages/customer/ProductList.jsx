import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicProducts } from "../../store/slices/productSlice";
import Pagination from "../../components/Pagination";
import { Search, Filter, ShoppingCart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../hooks/useWishlist";
import { Heart as HeartIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import FeatureShowcase from "./components/FeatureShowcase";

const ProductList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, pagination, loading } = useSelector((state) => state.products);
  const {
    items: wishlistItems,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sort: "newest",
  });
  const [page, setPage] = useState(1);

  const [searchInput, setsearchInput] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (prev.search === searchInput) return prev;
        return { ...prev, search: searchInput, page: 1 };
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(fetchPublicProducts({ ...filters, page }));
  }, [dispatch, filters, page]);

  const isInWishlist = (productId) => {
    if (!wishlistItems) return false;
    return wishlistItems.some((item) => item.product?._id === productId);
  };

  const handleWishlistToggle = async (e, productId) => {
    e.stopPropagation();
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const { data: categories } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const response = await api.get("/category");
      return response?.data.categories;
    },
  });

  return (
    <div className="min-h-screen max-w-7xl mx-auto bg-gray-50 font-sans text-gray-900">
      <FeatureShowcase />

      <div className="px-4 sm:px-6 lg:px-8 py-8 -mt-4 relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 ring-1 ring-black/5">
          <div className="relative w-full md:w-96 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search PCs..."
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all"
              value={searchInput}
              onChange={(e) => setsearchInput(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm hover:border-gray-300 transition-colors">
              <Filter size={18} className="text-gray-500" />
              <select
                className="bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value, page: 1 })
                }
              >
                <option value="">All Categories</option>
                {categories?.map((category) => {
                  return <option value={category.name}>{category.name}</option>;
                })}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm hover:border-gray-300 transition-colors">
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 rounded-2xl h-96 shadow-sm"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {items.map((product, index) => {
              const isOutOfStock =
                product.default_config &&
                Object.values(product.default_config).some(
                  (component) => component?.stock < 1 || !component?.isActive
                );

              return (
                <div
                  key={product._id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {product.applied_offer > 0 && !isOutOfStock && (
                      <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg z-10 border border-red-500/20">
                        {product.applied_offer}% OFF
                      </div>
                    )}
                    <img
                      src={
                        product.images?.[0] ||
                        "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <button
                      onClick={(e) => handleWishlistToggle(e, product._id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-md z-20 hover:scale-110 active:scale-95"
                    >
                      <HeartIcon
                        className={`h-5 w-5 ${
                          isInWishlist(product._id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-5 flex flex-col flex-grow relative">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      {product.category && (
                        <span className="inline-flex items-center px-2.5 py-1 mb-3 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-widest border border-blue-100">
                          {product.category.name}
                        </span>
                      )}
                      <p className="text-sm text-gray-500 line-clamp-2 h-10 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        {product.applied_offer > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 line-through">
                              ₹{(product.base_price / 100).toLocaleString()}
                            </span>
                            <p className="text-xl font-bold text-gray-900">
                              ₹
                              {(
                                product.final_price / 100 ||
                                product.base_price / 100
                              ).toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 opacity-0">
                              Starting
                            </span>
                            <p className="text-xl font-bold text-gray-900">
                              ₹{(product.base_price / 100).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform group-hover:translate-x-1 flex items-center gap-2"
                      >
                        View
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              We couldn't find any PCs matching your search. Try adjusting
              filters or generic terms.
            </p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-12">
            <Pagination pagination={pagination} page={page} setPage={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
