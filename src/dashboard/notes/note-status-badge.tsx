import { Badge } from "../../components/ui/badge";
import { useTranslation } from "react-i18next";

export default function NoteStatusBadge({ status }: { status: string }) {
  const [t] = useTranslation("global");

  if (status === "reject") {
    return (
      <Badge variant="destructive" className="font-bold">
        {t("rejected")}
      </Badge>
    );
  }

  if (status === "pinding") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 bg-amber-500/10 font-bold text-amber-600 dark:text-amber-400"
      >
        {t("pending")}
      </Badge>
    );
  }

  if (status === "success") {
    return (
      <Badge className="border-0 bg-emerald-500/15 font-bold text-emerald-600 dark:text-emerald-400">
        {t("succeed")}
      </Badge>
    );
  }

  return <Badge variant="secondary">{status}</Badge>;
}
