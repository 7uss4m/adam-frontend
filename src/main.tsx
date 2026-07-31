import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import axios from "axios";

// Fix old image URLs from old server
const OLD_DOMAIN = "https://omc.weisro.com/omcard";
const NEW_DOMAIN = (import.meta.env.VITE_PUBLIC_DOMAIN || "https://api.ubba-stoer.com/adam").replace(/\/$/, "");

function fixUrls(obj: unknown): unknown {
  if (typeof obj === "string") {
    let s = obj.replace(OLD_DOMAIN, NEW_DOMAIN);
    // Fix relative paths like "public/image-xxx.webp" → full URL
    if (s && !s.startsWith("http") && (s.startsWith("public/") || s.startsWith("uploads/"))) {
      s = `${NEW_DOMAIN}/${s}`;
    }
    return s;
  }
  if (Array.isArray(obj)) return obj.map(fixUrls);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, fixUrls(v)])
    );
  }
  return obj;
}

axios.interceptors.response.use((response) => {
  response.data = fixUrls(response.data);
  return response;
});
import { ThemeProvider } from "./components/theme-provider";
import Page from "./home/page";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SubCategoryPage from "./subcategory/page";
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardCategories from "./dashboard/categories/page";
import CategorySubs from "./dashboard/categories/subcategories/page";
import DashboardAllSub from "./dashboard/categories/allsubcategories/page";
// import DashboardProducts from "./dashboard/products/page";
import DashboardAds from "./dashboard/ads/page";
import DashboardUsers from "./dashboard/users/page";
import AboutPage from "./about/page";
import Wallet from "./wallet/page";
import Notifications from "./notifications/page";
import Badge from "./badge/page";
import DashboardOrders from "./dashboard/orders/page";
import WalletPayments from "./wallet/payments/page";
import Income from "./wallet/income/page";
import Dept from "./wallet/dept/page";
import DashboardLevels from "./dashboard/levels/page";
import DashboardCurrencies from "./dashboard/currencies/page";
import AddBalance from "./add-balance/page";
import Payments from "./payments/page";
import Orders from "./orders/page";
import Agents from "./agents/page";
import Security from "./security/page";
import DashboardCharges from "./dashboard/chargings/page";
import DashboardDepts from "./dashboard/depts/page";
import DashboardSubProducts from "./dashboard/sub's products/page";
import ErrorPage from "./components/error-page";
import DashboardInventory from "./dashboard/Inventory/page";
import DashboardReports from "./dashboard/reports/page";
import DashboardUserDebits from "./dashboard/users/user debits/page";
import DashboardUserOrders from "./dashboard/users/user orders/page";
import DashboardAdmins from "./dashboard/admins/page";
import global_ar from "./locales/ar/global.json";
import global_en from "./locales/en/global.json";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import DashboardChargeBoxes from "./dashboard/charge-boxes/page";
import BoxPage from "./add-balance/box-page/page";
import DashboardNotes from "./dashboard/notes/page";
import DashboardReconciliation from "./dashboard/reconciliation/page";
import DashboardActivityLogs from "./dashboard/activity-logs/page";
import ChargePage from "./add-balance/charge-page/page";
import DashboardInfo from "./dashboard/info/page";
import Products from "./products/page";
import Purchase from "./purchase/page";
import CategoriesPage from "./categories/page";
import LoginPage from "./login/page";
import RegisterPage from "./register/page";
import VerifyEmailPage from "./verify/page";
import ResetPasswordPage from "./reset-password/page";
import DashboardProducts from "./dashboard/products/page";
import DashboardHome from "./dashboard/page";
import DashboardClients from "./dashboard/clients/page";
import DashboardNotifications from "./dashboard/notifications/page";
import ApiPage from "./api-page/page";
import { Toaster } from "./components/ui/toaster";
import ReferralPage from "./referral/page";
import TermsPage from "./terms/page";
import PrivacyPage from "./privacy/page";
import FaqPage from "./faqs/page";

// firebase
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(function (registration) {
      console.log(
        "Service Worker registration successful with scope: ",
        registration.scope
      );
    })
    .catch(function (err) {
      console.log("Service Worker registration failed: ", err);
    });
}

const dashEndpoint = import.meta.env.VITE_DASHBOARD;
// router
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Page />,
      },

      {
        path: "wallet",
        element: <Wallet />,
        children: [
          {
            path: "payments",
            element: <WalletPayments />,
          },
          {
            path: "income",
            element: <Income />,
          },
          {
            path: "debit",
            element: <Dept />,
          },
        ],
      },
      {
        path: "about-us",
        element: <AboutPage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "notifications",
        element: <Notifications />,
      },

      {
        path: "categories/:id/subs",
        element: <SubCategoryPage />,
      },
      {
        path: "categories/:id/subs/:subId",
        element: <Products />,
      },
      {
        path: "categories/:id/subs/:subId/product/:productId",
        element: <Purchase />,
      },
      {
        path: "badge",
        element: <Badge />,
      },
      {
        path: "add-balance",
        element: <AddBalance />,
      },
      {
        path: "add-balance/charge",
        element: <ChargePage />,
      },
      {
        path: "add-balance/:id/box",
        element: <BoxPage />,
      },
      {
        path: "payments",
        element: <Payments />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "referral",
        element: <ReferralPage />,
      },
      {
        path: "api",
        element: <ApiPage />,
      },
      {
        path: "agents",
        element: <Agents />,
      },
      {
        path: "security",
        element: <Security />,
      },
      {
        path: "faqs",
        element: <FaqPage />,
      },
      {
        path: "terms",
        element: <TermsPage />,
      },
      {
        path: "privacy",
        element: <PrivacyPage />,
      },
    ],
  },

  {
    path: `/${dashEndpoint}`,
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: "clients",
        element: <DashboardClients />,
      },
      {
        path: "admins",
        element: <DashboardAdmins />,
      },
      {
        path: "users",
        element: <DashboardUsers />,
      },
      {
        path: "users/:id/debits",
        element: <DashboardUserDebits />,
      },
      {
        path: "users/:id/orders",
        element: <DashboardUserOrders />,
      },
      {
        path: "categories",
        element: <DashboardCategories />,
      },
      {
        path: "categories/:id/sub",
        element: <CategorySubs />,
      },
      {
        path: "categories/sub",
        element: <DashboardAllSub />,
      },
      {
        path: "categories/sub/:id/products",
        element: <DashboardSubProducts />,
      },
      {
        path: "products",
        element: <DashboardProducts />,
      },
      {
        path: "ads",
        element: <DashboardAds />,
      },
      {
        path: "orders",
        element: <DashboardOrders />,
      },
      {
        path: "levels",
        element: <DashboardLevels />,
      },
      {
        path: "currencies",
        element: <DashboardCurrencies />,
      },
      {
        path: "charges",
        element: <DashboardCharges />,
      },
      {
        path: "debts",
        element: <DashboardDepts />,
      },
      {
        path: "inventory",
        element: <DashboardInventory />,
      },
      {
        path: "reports",
        element: <DashboardReports />,
      },
      {
        path: "boxes",
        element: <DashboardChargeBoxes />,
      },
      {
        path: "notes",
        element: <DashboardNotes />,
      },
      {
        path: "reconciliation",
        element: <DashboardReconciliation />,
      },
      {
        path: "activity-logs",
        element: <DashboardActivityLogs />,
      },
      {
        path: "info",
        element: <DashboardInfo />,
      },
      {
        path: "notifications",
        element: <DashboardNotifications />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  {
    path: "/verify",
    element: <VerifyEmailPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
]);
// language

i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: localStorage.getItem("lng")
    ? localStorage.getItem("lng") == "ar"
      ? "ar"
      : localStorage.getItem("lng") == "en"
      ? "en"
      : "ar"
    : "ar",
  resources: {
    ar: {
      global: global_ar,
    },
    en: {
      global: global_en,
    },
  },
  nonExplicitSupportedLngs: false,
  cleanCode: true,
});

// query client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <I18nextProvider i18n={i18next}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  </GoogleOAuthProvider>
);
