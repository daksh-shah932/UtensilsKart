import { axiosClient } from "@/lib/api/axiosClient";

export async function imageSearch(file) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await axiosClient.post("/api/search/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
