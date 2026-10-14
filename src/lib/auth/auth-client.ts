import { createAuthClient } from "better-auth/client";

function serverBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

// Kết quả là client sẽ gọi tới baseURL + /api/auth/..., vd http://localhost:3000/api/auth/sign-in/email.
function createConfiguredClient(baseURL: string) {
  // tạo better-auth client
  // hàm tạo ra 1 client có thể dùng các hàm như signin, signout để truyền request đến đúng địa chỉ
  return createAuthClient({
    baseURL,
    basePath: "/api/auth",
  });
}

// Tạo kiểu AuthClient bằng cách lấy kiểu trả về của hàm
type AuthClient = ReturnType<typeof createAuthClient>;

// Hai biến dùng để lưu lại (cache) client trên trình duyệt:
let browserClient: AuthClient | null = null; // client đã tạo, ban đầu là null.
let browserOrigin: string | null = null; // origin lúc tạo client đó, dùng để biết có cần tạo lại không.

export function getAuthClient(): AuthClient {
  if (typeof window !== "undefined") {
    const origin = window.location.origin; // origin là http://localhost:3000

    if (!browserClient || browserOrigin !== origin) {
      browserClient = createConfiguredClient(origin);
      browserOrigin = origin;
    }
    return browserClient;
  }

  return createConfiguredClient(serverBaseUrl());
}
