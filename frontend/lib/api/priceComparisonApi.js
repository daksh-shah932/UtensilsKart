import { axiosClient } from "@/lib/api/axiosClient";

export async function fetchPriceComparison(productId) {
  const { data } = await axiosClient.get(`/api/products/${productId}/price-comparison`);
  return data;
}
