import { useTranslation } from "react-i18next"

export default function Security() {
    // translation
    const [t,] = useTranslation("global")
  return (
    <section className="relative container min-h-svh">
      <h2 className="text-accent text-lg">{t("security")}</h2>
    </section>
  )
}