import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const verifyOTPSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format"),
    otp: z.string().length(6, "OTP must be 6 digits"),
  }),
});

export const resendOTPSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email("Invalid email format"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  params: z.object({
    resetToken: z.string().min(1, "Reset token is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  }),
});
