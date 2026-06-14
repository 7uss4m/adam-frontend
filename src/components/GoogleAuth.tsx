import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "./ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import postGoogleSignin from "../api/postGoogleSignin";
import { Button } from "./ui/button";
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
      const resposne = await postGoogleSignin(token, result.visitorId);
      return { token: resposne.data.token, message: resposne.data?.result };
    },
    onSuccess: (data) => {
      toast({ title: t("welcome_back") });
      localStorage.setItem("token", data.token);
      navigate(redirectTo, { replace: true });
    },
    onError: () => {
      toast({
        title: t("something_wrong_happened"),
        variant: "destructive",
      });
    },
  });

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        disabled={disabled || googleSign.isPending}
        className={cn(
          "h-11 w-full gap-2 rounded-xl border-border/70 font-bold",
          buttonClassName
        )}
        onClick={(e) => {
          const btn = e.currentTarget.nextElementSibling?.firstElementChild
            ?.firstElementChild?.firstElementChild
            ?.firstElementChild as HTMLElement;
          btn?.click();
        }}
      >
        {googleSign.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FaGoogle className="h-4 w-4" />
        )}
        <span>{t("login_with")} Google</span>
      </Button>

      <div className="hidden">
        <GoogleLogin
          shape="rectangular"
          size="large"
          ux_mode="popup"
          text="signin"
          theme="outline"
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
  );
}
export default GoogleOAuth;
