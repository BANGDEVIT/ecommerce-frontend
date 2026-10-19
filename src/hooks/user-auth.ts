import { authService } from "@/services/auth.service";
import { SignUpDto } from "@/types/api.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { error } from "console";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AuthToastMessage = {
  success?: string;
  error?: string;
};

export const useSignUp = (message?: AuthToastMessage & { verifyEmail?: string }) => {
  const router = useRouter(); // dùng để redirect
  const queryClient = useQueryClient(); // để cập nhật sesion trong tanstack query

  return useMutation({
    mutationFn: (data: SignUpDto) => authService.signUp(data),
    onSuccess: (response) => {
      queryClient.setQueryData(["auth", "session"], {
        // key là auth và sesion
        user: response.user,
        isGuest: false,
        isAuthenticated: true,
      }); // nếu chưa có tạo mới query này, nếu có rồi thì update(thông tin đăng nhập là thông tin của user)

      if (response.token) {
        toast.success(message?.success ?? "Acount created successfully");
        router.push("/product/catalog"); // trang product
        return;
      }

      toast.info(
        message?.verifyEmail ??
          message?.success ??
          "Acount created, please check yoir email to verify account ",
      );

      router.push("/auth/signin");
    },

    onError: (error: unknown) => {
      const message = (
        error as {
          response?: {
            data?: { message?: string };
          };
        }
      )?.response?.data?.message; // Lấy ra message từ error response

      toast.error(typeof message === "string" ? message : "sign up failed");
    },
  });
};
