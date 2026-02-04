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
    onMutate: async (productId) => {
      await queryClient.cancelQueries(["wishlist"]);
      const previousWishlist = queryClient.getQueryData(["wishlist"]);
      queryClient.setQueryData(["wishlist"], (old) => {
        return {
          ...old,
          items: old.items.filter((item) => item.product._id !== productId),
        };
      });

      return { previousWishlist };
    },
    onSettled: () => {
      console.log("heyy");
      queryClient.invalidateQueries(["wishlist"]);
      dispatch(fetchCart());
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["wishlist"], context.previousWishlist);
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
    moveError: moveToCartMutation.error,
  };
};
