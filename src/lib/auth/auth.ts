import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { v7 as uuidv7 } from "uuid";
import { sendPasswordResetEmail, sendVerificationEmail } from "./send-auth.emaul";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "ecommerce",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

function getAppUrl(): string {
  const raw =
    process.env.BETTER_AUTH_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return raw.replace(/\/+$/, "");
}

const appUrl = getAppUrl();

export const auth = betterAuth({
  database: pool, // dùng cấu hình pool trên và better-auth sẽ tự động tạo bảng trong DB, ta không cần phải viết truy vấn
  plugins: [bearer(), nextCookies()], // 1.cho phép bearer Auth nhận session từ authorization header, 2. đọc và ghi sesion ở cookie(tự động set cookie khi signin hoặc signup)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // người dùng đăng kí xong chưa đăng nhập được ngay mà cần phải xác minh email trước
    // là hàm để better-auth gửi resetpassword (flow: user yều cầu reset password -> better-auth tạo token -> chạy hàm sendresetpassword -> đường link xác minh được tạo -> xong gọi sang BE để tạo và gửi email -> xong user bấm đường link -> đg link dẫn đến nextjs -> user sửa mk mới -> xong BE cập nhật lại mk)
    sendResetPassword: async ({ user, token }) => {
      // user và token sẽ được truyền tự động vào better-auth
      const resetPasswordUrl = `${appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`; // bọc trong encode để nó có kí tự đặc biệt sẽ ko làm hỏng url

      await sendPasswordResetEmail(user.email, user.name, resetPasswordUrl);
    },
  },
  emailVerification: {
    sendOnSignUp: true, // vửa đăng kí xong là gửi email xác minh ngay
    autoSignInAfterVerification: false, // xác minh xong thì người dùng tự đăng nhập hệ thống không tự đăng nhập dùm
    expiresIn: 24 * 60 * 60, // thời gian xác thực của token email
    sendVerificationEmail: async ({ user, token }) => {
      const verifyUrl = `${appUrl}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;

      await sendVerificationEmail(user.email, user.name, verifyUrl);
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "", // dùng khi better-auth tạo token
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000", // địa chỉ nestjs
  basePath: "/api/auth", // endpont nestjs
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // thời gian 1 phiên session sống đc
    updateAge: 60 * 60 * 24, // 1 ngày phiên đăng nhập hoạt động đều thì sẽ hết sau 1 tuần
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  account: {
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      idToken: "id_token",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
  },
});
