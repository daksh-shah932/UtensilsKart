import { axiosClient } from "@/lib/api/axiosClient";

export async function requestOtp(identifier, channel = "sms") {
  const { data } = await axiosClient.post("/api/auth/otp/request", { identifier, channel });
  return data;
}

export async function verifyOtp(identifier, otp) {
  const { data } = await axiosClient.post("/api/auth/otp/verify", { identifier, otp });
  return data;
}

export async function resendOtp(identifier, channel = "sms") {
  const { data } = await axiosClient.post("/api/auth/otp/resend", { identifier, channel });
  return data;
}
