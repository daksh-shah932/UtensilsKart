import { axiosClient } from "@/lib/api/axiosClient";

export async function fetchProducts(params = {}) {
  const { data } = await axiosClient.get("/api/products", { params });
  return data;
}

export async function fetchProductById(id) {
  const { data } = await axiosClient.get(`/api/products/${id}`);
  return data;
}
