import { useTranslation } from "react-i18next";
import GoogleOAuth from "./GoogleAuth";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export default function NavLogin() {
  // translation
  const [t] = useTranslation("global");
  return (
    <div className="nav-login space-y-5 text-white p-5 bg-main-primary rounded-xl">
      <h2>{t("login")}</h2>
      <p>{t("Log_in_and_enjoy_an_easy_shopping_experience")}</p>
      <Link to={"/login"} className="block">
        <Button className="rounded-full w-full bg-accent hover:bg-accent hover:opacity-80 transition-opacity">
          {t("login")}
        </Button>
      </Link>

      <div className="login-register w-full hidden md:flex gap-5">
        <GoogleOAuth />
      </div>
    </div>
  );
}
