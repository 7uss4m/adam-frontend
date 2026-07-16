import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "./ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import postGoogleSignin from "../api/postGoogleSignin";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { Loader2 } from "lucide-react";

type GoogleOAuthProps = {
  redirectTo?: string;
  buttonClassName?: string;
  disabled?: boolean;
};

function GoogleOAuth({
  redirectTo = "/",
  buttonClassName,
  disabled = false,
}: GoogleOAuthProps) {
  const [t] = useTranslation("global");
  const { toast } = useToast();
  const navigate = useNavigate();

  const googleSign = useMutation({
    mutationFn: async (token: string) => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const response = await postGoogleSignin(token, result.visitorId);
      if (response?.response?.data?.error) {
        throw new Error(response.response.data.error);
      }
      if (!response?.data?.token) {
        throw new Error(t("something_wrong_happened"));
      }
      return { token: response.data.token, message: response.data?.result };
    },
    onSuccess: (data) => {
      toast({ title: t("welcome_back") });
      localStorage.setItem("token", data.token);
      navigate(redirectTo, { replace: true });
    },
    onError: (error: Error) => {
      toast({
        title: error?.message || t("something_wrong_happened"),
        variant: "destructive",
      });
    },
  });

  const isBusy = disabled || googleSign.isPending;

  return (
    <div className="relative w-full">
      {/* Visual button (what the user sees) */}
      <div
        className={cn(
          "flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-background font-bold text-foreground",
          isBusy && "opacity-60",
          buttonClassName
        )}
      >
        {googleSign.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="h-4 w-4" />
        )}
        <span>{t("login_with")} Google</span>
      </div>

      {/* Real Google button overlaid transparently on top — captures the click */}
      {!isBusy && (
        <div className="absolute inset-0 z-10 overflow-hidden opacity-[0.001]">
          <div className="scale-[3] origin-top-left">
            <GoogleLogin
              shape="rectangular"
              size="large"
              ux_mode="popup"
              text="signin"
              theme="outline"
              width="400"
              auto_select={false}
              onSuccess={(credentialResponse) => {
                googleSign.mutate(credentialResponse.credential as string);
              }}
              onError={() => {
                toast({
                  title: t("something_wrong_happened"),
                  variant: "destructive",
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
export default GoogleOAuth;
