/* eslint-disable @next/next/no-location-assign-relative-destination */
import axios, { AxiosError } from "axios";
import { redirect } from "next/navigation";
import { toast } from "sonner";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000, // nếu vượt quá thời gian này mà vẫn nhận được request trả về thì axios tự hủy request
  withCredentials: true, // tự động gửi cookie mỗi request
  headers: {
    "Content-Type": "application/json",
  },
});

// Mọi request và response đều phải đi qua trước khi tới phần code
axiosInstance.interceptors.response.use(
  // trả về 2 hàm 1 thành công và 1 thất bại
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      toast.error("Bạn cần đăng nhập để tiếp tục");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/signin";
      }
    } else if (error.response?.status === 403) {
      toast.error("Bạn không có quyền thực hiện thao tác này");
    } else if (!error.response) {
      toast.error("Không thể kết nối được máy chủ, vui lòng thử lại");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
