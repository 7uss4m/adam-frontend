import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "./ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import postGoogleSignin from "../api/postGoogleSignin";
import { Button } from "./ui/button";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useTranslation } from "react-i18next";

// import { useMutation } from "@tanstack/react-query";
// import { googleSign } from "../api/googleSign";
// import { useContext } from "react";
// import AuthContext from "../context/AuthProvider";
// import { jwtDecode } from "jwt-decode";
// import getUser from "../api/getUser";
import { useLocation } from "react-router-dom";
function GoogleOAuth() {
  // translation
  const [t] = useTranslation("global");
  // toast
  const { toast } = useToast();
  // navigaton
  const navigate = useNavigate();
  const location = useLocation();
  // const getUserQuery = useMutation({
  //   mutationFn: async (obj) => {
  //     const data = await getUser(obj.token);
  //     return { user: data.data, token: obj.token };
  //   },
  //   onSuccess: (data) => {
  //     if (data.user.phone) {
  //       setAuth(() => {
  //         return {
  //           id: data.user.id,
  //           user: data.user.first_name + " " + data.user.last_name,
  //           token: data.token,
  //         };
  //       });
  //       localStorage.setItem("token", data.token);
  //       localStorage.setItem("id", data.user.id);
  //       localStorage.setItem(
  //         "user",
  //         data.user.first_name + " " + data.user.last_name
  //       );

  //       localStorage.setItem("postal", data.user.postal_code);
  //       setIsModalOpen(false);
  //       setLoggedMsg(true);
  //     } else {
  //       setCompleteSignup(() => {
  //         return { info: data.user, open: true, token: data.token };
  //       });
  //       setGoogleLoading(false);
  //     }
  //   },
  // });

  // const googleMutation = useMutation({
  //   mutationFn: async (token) => {
  //     const res = await googleSign(token);
  //     return res;
  //   },
  //   onSuccess: (data) => {
  //     const newToken = data.token;
  //     const user = jwtDecode(newToken);
  //     getUserQuery.mutate({ id: user.id, token: newToken });
  //   },
  // });

  // mutation
  const googleSign = useMutation({
    mutationFn: async (token: string) => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const resposne = await postGoogleSignin(token, result.visitorId);
      return { token: resposne.data.token, message: resposne.data?.result };
    },
    onSuccess: (data) => {
      toast({
        title: t("welcome_back"),
        className: "bg-accent text-white fixed top-10 right-10 w-[40%]",
      });
      localStorage.setItem("token", data.token);

      if (location.pathname === "/") {
        window.location.reload(); // force refresh if already on home
      } else {
        navigate("/");
      }
    },
    onError: () => {
      toast({
        title: t("something_wrong_happened"),
        className: "bg-accent text-white fixed top-10 right-10 w-[40%]",
      });
    },
  });
  return (
    <>
      <div className="w-full">
        <Button
          type="button"
          size={"sm"}
          className="w-full flex justify-center items-center gap-2 bg-accent text-accent-foreground hover:bg-white hover:opacity-80 transition-all h-9 sm:h-10 sm:px-5 px-3 text-xs sm:text-sm rounded-full"
          onClick={(e) => {
            const btn = e.currentTarget.nextElementSibling?.firstElementChild
              ?.firstElementChild?.firstElementChild
              ?.firstElementChild as HTMLElement;
            btn.click();
          }}
        >
          <span>{t("login_with")}</span> <FaGoogle />
        </Button>

        <div className="hidden justify-center items-center">
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
              });
              console.error("error");
            }}
          />
        </div>
      </div>
    </>
  );
}
export default GoogleOAuth;
