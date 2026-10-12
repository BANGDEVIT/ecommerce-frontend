"use client";

import { QueryClientProvider } from "@tanstack/react-query"; // có nhiệm vụ đưa query-client xuống các component con bên dưới nó
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { createQueryClient } from "@/lib/query-client";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient()); // chỉ tạo queryClent 1 lần thay vi dùng const thì mỗi lần render thì tạo lại

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <ReactQueryDevtools
        initialIsOpen={false} // để devtool không tự mở khi chạy app
        buttonPosition="bottom-right" // để nút mở nàm ở nút dưới bên phải
      />
    </QueryClientProvider>
  );
}
