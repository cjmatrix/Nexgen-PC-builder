import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { useDispatch } from "react-redux";
import { fetchCart } from "../store/slices/cartSlice";
import toast from "react-hot-toast";

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const {
    data: wishlist,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await api.get("/wishlist");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, 
  });

  
  const addToWishlistMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await api.post("/wishlist/add", { productId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["wishlist"], data.data);
      toast.success("Added to Wishlist");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add to wishlist");
    },
  });

 
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId) => {
      const res = await api.delete(`/wishlist/remove/${productId}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["wishlist"], data.data);
      toast.success("Removed from Wishlist");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to remove");
    },
  });

 
  const moveToCartMutation = useMutation({
    mutationFn: async (productId) => {
      await api.post("/wishlist/move-to-cart", { productId });
      return productId;
    },
    onSuccess: (productId) => {
      
      queryClient.setQueryData(["wishlist"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          items: oldData.items.filter((item) => item.product._id !== productId),
        };
      });
    
      dispatch(fetchCart());
      toast.success("Moved to Cart");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to move to cart");
    },
  });

  return {
    wishlist: wishlist,
    items: wishlist?.items || [],
    loading: isLoading,
    error,
    addToWishlist:
      addToWishlistMutation.mutateOnly || addToWishlistMutation.mutate, 
    removeFromWishlist: removeFromWishlistMutation.mutate,
    moveToCart: moveToCartMutation.mutate,
  
    isAdding: addToWishlistMutation.isPending,
    isRemoving: removeFromWishlistMutation.isPending,
    isMoving: moveToCartMutation.isPending, 
    moveError:moveToCartMutation.error
  };
};
