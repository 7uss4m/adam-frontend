import { useTranslation } from "react-i18next"


export default function Dept() {
   // translation
   const [t,] = useTranslation("global")

  return (
    <>
      <section className="dept min-h-[30vh] text-accent text-2xl flex justify-center items-center">{t("no_items")}</section>
    </>
  )
}