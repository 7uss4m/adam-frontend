import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { Toaster } from "../components/ui/toaster";
import "../main.css";

import { useMutation, useQuery } from "@tanstack/react-query";
import getAds from "../api/getAds";
import { Ad, User } from "../types/types";
import { useEffect, useState } from "react";
import getUser from "../api/getUser";
import { useTranslation } from "react-i18next";
import useFCMToken from "../hooks/useFcmToken";
import postFcmToken from "../api/postFcmToken";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "../components/ui/dialog";
// import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { CurrencyProvider } from "../context/CurrencyContext";
import Footer from "./Footer";
import BottomNav from "../components/BottomNav";
import ScrollToTop from "../components/ScrollToTop";
import MaintenanceGate from "../components/maintenance-gate";

const AUTH_REQUIRED_PAGES = [
  "/security",
  "/agents",
  "/orders",
  "/payments",
  "/add-balance",
  "/add-balance/charge",
  "/wallet/payments",
  "/wallet/income",
  "/wallet/debit",
  "/badge",
];

export default function MainLayout() {
  // params
  // const [searchParams] = useSearchParams();
  // const params = new URLSearchParams(searchParams);
  // pathname
  const { pathname } = useLocation();

  // query
  const getAdsQuery = useQuery({
    queryKey: ["advers"],
    queryFn: async () => {
      const response = await getAds();
      const ads: Ad[] = response.data.result;

      return ads;
    },
    refetchOnWindowFocus: false,
  });
  // translation
  const [, i18n] = useTranslation("global");
  // state
  const [currentAdId, setCurrentAdId] = useState(0);
  const [currentTextId, setCurrentTextId] = useState<number>(0);
  // const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  // navigate
  const navigate = useNavigate();
  // query
  const getUserQuery = useQuery({
    queryKey: ["user", "id"],
    queryFn: async () => {
      const response = await getUser(localStorage.getItem("token") as string);
      return response.data.result as User;
    },
    retry: 0,
    refetchOnWindowFocus: false,
  });

  // mutation
  const postFcmTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await postFcmToken(
        localStorage.getItem("token") as string,
        fcmToken as string
      );
      return response.data;
    },
  });
  // firebase
  const { fcmToken } = useFCMToken();

  // effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdId(
        currentAdId + 1 == getAdsQuery.data?.length ? 0 : currentAdId + 1
      );
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  });

  useEffect(() => {
    const interval2 = setInterval(() => {
      setCurrentTextId(
        currentTextId + 1 == getAdsQuery.data?.length ? 0 : currentTextId + 1
      );
    }, 20000);
    return () => {
      clearInterval(interval2);
    };
  }, [currentTextId, getAdsQuery.data?.length]);

  useEffect(() => {
    if (
      pathname.split("/").length == 4 &&
      pathname.split("/")[3] == "box" &&
      !getUserQuery.isLoading &&
      getUserQuery.isError
    ) {
      navigate("/");
    }
    if (
      !getUserQuery.isLoading &&
      getUserQuery.isError &&
      AUTH_REQUIRED_PAGES.includes(pathname)
    ) {
      navigate("/");
    }
  }, [getUserQuery.isError, getUserQuery.isLoading, navigate, pathname]);

  useEffect(() => {
    if (getUserQuery.isFetched && getUserQuery.isSuccess) {
      postFcmTokenMutation.mutate();
    }
  }, [getUserQuery.isFetched, getUserQuery.isSuccess]);

  // useEffect(() => {
  //   if (params.get("purchase")) {
  //     setShowPurchaseSuccess(true);
  //   }
  // }, [params, showPurchaseSuccess]);
  return (
    <MaintenanceGate>
      <main
        dir={i18n.language == "ar" ? "rtl" : "ltr"}
        className="main bg-background area relative min-h-[90vh] sm:min-h-[100vh] "
      >
        <CurrencyProvider>
          <ScrollToTop />
          <Header />

          <div className="pb-16 md:pb-0">
            <Outlet />
          </div>
          <Footer />
          <BottomNav />
        </CurrencyProvider>
      </main>
    </MaintenanceGate>
  );
}
