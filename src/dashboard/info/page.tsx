import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// assets
import Spinner from "../../components/Spinner";

import { useTranslation } from "react-i18next";
import getInfo from "../../api/getInfo";
import getMoonPay from "../../api/getMoonPay";

export default function DashboardInfo() {
  // query
  const getDollarQuery = useQuery({
    queryKey: ["dollar_exchange"],
    queryFn: async () => {
      const response = await getInfo(
        localStorage.getItem("token") as string,
        "dollar_exchange"
      );

      return response.data.date as { dollar_exchange: string | null };
    },
    refetchOnWindowFocus: false,
  });
  const getEmailQuery = useQuery({
    queryKey: ["email"],
    queryFn: async () => {
      const response = await getInfo(
        localStorage.getItem("token") as string,
        "email"
      );

      return response.data.date as { email: string | null };
    },
    refetchOnWindowFocus: false,
  });
  const getPhoneQuery = useQuery({
    queryKey: ["phone"],
    queryFn: async () => {
      const response = await getInfo(
        localStorage.getItem("token") as string,
        "phone"
      );

      return response.data.date as { phone: string | null };
    },
    refetchOnWindowFocus: false,
  });
  const getPrivacyQuery = useQuery({
    queryKey: ["privacy"],
    queryFn: async () => {
      const response = await getInfo(
        localStorage.getItem("token") as string,
        "privacy"
      );

      return response.data.date as { privacy: string | null };
    },
    refetchOnWindowFocus: false,
  });
  const getAboutUsQuery = useQuery({
    queryKey: ["aboutus"],
    queryFn: async () => {
      const response = await getInfo(
        localStorage.getItem("token") as string,
        "aboutus"
      );

      return response.data.date as { aboutus: string | null };
    },
    refetchOnWindowFocus: false,
  });
  const getWhatsappQuery = useQuery({
    queryKey: ["whatsup"],
    queryFn: async () => {
      const response = await getInfo(
        localStorage.getItem("token") as string,
        "whatsup"
      );

      return response.data.date as { whatsup: string | null };
    },
    refetchOnWindowFocus: false,
  });
  const getFacebookQuery = useQuery({
    queryKey: ["facebook"],
    queryFn: async () => {
      const response = await getInfo(
        localStorage.getItem("token") as string,
        "facebook"
      );

      return response.data.date as { facebook: string | null };
    },
    refetchOnWindowFocus: false,
  });
  const getTelegramQuery = useQuery({
    queryKey: ["telegram"],
    queryFn: async () => {
      const response = await getInfo(
        localStorage.getItem("token") as string,
        "telegram"
      );

      return response.data.date as { telegram: string | null };
    },
    refetchOnWindowFocus: false,
  });
  const getPayMoonQuery = useQuery({
    queryKey: ["moonpay"],
    queryFn: async () => {
      const response = await getMoonPay(
        localStorage.getItem("token") as string
      );
      return response.data as { date: string };
    },
  });

  // translation
  const [t, i18n] = useTranslation("global");
  return (
    <section
      dir={i18n.language == "en" ? "ltr" : "rtl"}
      className="container mx-auto py-10 space-y-10"
    >
      <header className="flex justify-between items-center">
        <p className="text-2xl md:text-6xl">{t("info")}</p>
      </header>
      {getEmailQuery.isFetching ||
      getDollarQuery.isFetching ||
      getPhoneQuery.isFetching ||
      getTelegramQuery.isFetching ||
      getFacebookQuery.isFetching ||
      getWhatsappQuery.isFetching ||
      getAboutUsQuery.isFetching ||
      getPrivacyQuery.isFetching ||
      getPayMoonQuery.isFetching ? (
        <div className="min-h-svh flex justify-center items-center">
          <Spinner />
        </div>
      ) : getEmailQuery.isSuccess &&
        getEmailQuery.data &&
        getTelegramQuery.isSuccess &&
        getTelegramQuery.data &&
        getWhatsappQuery.isSuccess &&
        getWhatsappQuery.data &&
        getFacebookQuery.isSuccess &&
        getFacebookQuery.data &&
        getPrivacyQuery.isSuccess &&
        getPrivacyQuery.data &&
        getPhoneQuery.isSuccess &&
        getPhoneQuery.data &&
        getAboutUsQuery.isSuccess &&
        getAboutUsQuery.data &&
        getPayMoonQuery.isSuccess &&
        getPayMoonQuery.data ? (
        <>
          <DataTable
            getDollarQuery={getDollarQuery}
            getEmailQuery={getEmailQuery}
            getPhoneQuery={getPhoneQuery}
            getPrivacyQuery={getPrivacyQuery}
            getAboutUsQuery={getAboutUsQuery}
            getWhatsappQuery={getWhatsappQuery}
            getFacebookQuery={getFacebookQuery}
            getTelegramQuery={getTelegramQuery}
            getPayMoonQuery={getPayMoonQuery}
            columns={columns}
            data={[
              {
                email: getEmailQuery.data.email,
                phone: getPhoneQuery.data?.phone,
                privacy: getPrivacyQuery.data?.privacy,
                aboutus: getAboutUsQuery.data?.aboutus,
                whatsup: getWhatsappQuery.data?.whatsup,
                facebook: getFacebookQuery.data?.facebook,
                telegram: getTelegramQuery.data?.telegram,
                code: getPayMoonQuery.data.date,
                dollar_exchange: getDollarQuery.data?.dollar_exchange as string,
              },
            ]}
          />
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p>{t("something_went_wrong")}</p>
        </div>
      )}
    </section>
  );
}
