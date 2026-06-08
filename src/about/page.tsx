import { useTranslation } from "react-i18next"
import getInfo from "../api/getInfo";
import { useQuery } from "@tanstack/react-query";
import Spinner from "../components/Spinner";

export default function AboutPage() {
  // translation
  const [t] = useTranslation("global")

  // query
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
  return (
    <section className="relative min-h-svh container max-w-[100%] md:max-w-[90%] lg:max-w-[70%] text-accent text-lg sm:text-xl text-center py-10">
      {getAboutUsQuery.isFetching ? <div className="flex justify-center items-center"><Spinner /></div> : <>
        <h2 className="text-2xl text-start mb-5">{t("about_us")}</h2>
        {getAboutUsQuery.data?.aboutus}
      </>
      }

    </section>
  )
}