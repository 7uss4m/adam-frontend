import { useTranslation } from "react-i18next"

export default function Agents() {
  // translation
  const [t,] = useTranslation("global")
  return (
    <section className="relative container min-h-svh">
      <h2 className="text-accent text-lg">{t("agents")}</h2>
    </section>
  )
}