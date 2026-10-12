import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // các thao tác lấy dữ liệu
        staleTime: 60 * 1000, // dữ liệu sau 1 phút sẽ được làm mới (gọi APi lại sau 1 phút)
        gcTime: 5 * 60 * 1000, // garbage collection (thời gian dữ lại trong cache bao lâu nếu không có component nào sử dụng lại nó)
        retry: 1, // = 1 ví dụ request lỗi 1 lần thì tanstack sẽ gọi lại 1 lần nữa
        refetchOnWindowFocus: true,
      },
      mutations: {
        // các thao tác làm thay đổi dữ liệu vd: tạo đơn hàng, thêm sản phẩm, cập nhật giỏ hàng
        retry: 0,
      },
    },
  });
};
