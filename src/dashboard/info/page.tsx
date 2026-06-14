import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Banknote,
  BookOpen,
  DollarSign,
  Facebook,
  Info,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  Shield,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import Spinner from "../../components/Spinner";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { fetchSiteSettings } from "./info-utils";
import SettingFieldCard from "./setting-field-card";
import MaintenanceModeCard from "./maintenance-mode-card";

function SectionBlock({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </motion.section>
  );
}

export default function DashboardInfo() {
  const [t, i18n] = useTranslation("global");
  const token = localStorage.getItem("token") || "";

  const settingsQuery = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => fetchSiteSettings(token),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  const refetch = () => settingsQuery.refetch();

  if (settingsQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("something_went_wrong")}</p>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("refresh")}
        </Button>
      </div>
    );
  }

  const s = settingsQuery.data;

  return (
    <div
      dir={i18n.language === "en" ? "ltr" : "rtl"}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-orbitron text-xl font-bold text-foreground sm:text-2xl">
              {t("info")}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {t("info_page_subtitle")}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={settingsQuery.isFetching}
          className="gap-2 self-end sm:self-auto"
        >
          <RefreshCw
            className={cn("h-4 w-4", settingsQuery.isFetching && "animate-spin")}
          />
          {t("refresh")}
        </Button>
      </div>

      <SectionBlock
        title={t("maintenance_section")}
        subtitle={t("maintenance_section_hint")}
        delay={0.02}
      >
        <MaintenanceModeCard />
      </SectionBlock>

      <SectionBlock
        title={t("info_finance_section")}
        subtitle={t("info_finance_section_hint")}
        delay={0.05}
      >
        <SettingFieldCard
          label={t("info_dollar_exchange")}
          value={s.dollar_exchange}
          fieldKey="dollar_exchange"
          type="number"
          icon={<DollarSign className="h-4 w-4" />}
          onSaved={refetch}
        />
        <SettingFieldCard
          label={t("info_tr_exchange")}
          value={s.tr_exchange}
          fieldKey="tr_exchange"
          type="number"
          icon={<Banknote className="h-4 w-4" />}
          onSaved={refetch}
        />
        <SettingFieldCard
          label={t("info_dash_exchange")}
          value={s.dash_exchange}
          fieldKey="dash_exchange"
          type="number"
          icon={<Banknote className="h-4 w-4" />}
          onSaved={refetch}
        />
        <SettingFieldCard
          label={t("wallet_address")}
          value={s.moonPay_code}
          fieldKey="moonPay_code"
          icon={<Wallet className="h-4 w-4" />}
          copyable
          onSaved={refetch}
        />
      </SectionBlock>

      <SectionBlock
        title={t("info_contact_section")}
        subtitle={t("info_contact_section_hint")}
        delay={0.1}
      >
        <SettingFieldCard
          label={t("email")}
          value={s.email}
          fieldKey="email"
          icon={<Mail className="h-4 w-4" />}
          onSaved={refetch}
        />
        <SettingFieldCard
          label={t("info_phone")}
          value={s.phone}
          fieldKey="phone"
          icon={<Phone className="h-4 w-4" />}
          onSaved={refetch}
        />
      </SectionBlock>

      <SectionBlock
        title={t("info_social_section")}
        subtitle={t("info_social_section_hint")}
        delay={0.15}
      >
        <SettingFieldCard
          label={t("info_telegram")}
          value={s.telegram}
          fieldKey="telegram"
          icon={<Send className="h-4 w-4" />}
          onSaved={refetch}
        />
        <SettingFieldCard
          label={t("info_whatsapp")}
          value={s.whatsup}
          fieldKey="whatsup"
          icon={<MessageCircle className="h-4 w-4" />}
          onSaved={refetch}
        />
        <SettingFieldCard
          label={t("info_facebook")}
          value={s.facebook}
          fieldKey="facebook"
          icon={<Facebook className="h-4 w-4" />}
          onSaved={refetch}
        />
      </SectionBlock>

      <SectionBlock
        title={t("info_content_section")}
        subtitle={t("info_content_section_hint")}
        delay={0.2}
      >
        <div className="sm:col-span-2 xl:col-span-3">
          <SettingFieldCard
            label={t("about_us")}
            value={s.aboutus}
            fieldKey="aboutus"
            type="textarea"
            icon={<BookOpen className="h-4 w-4" />}
            onSaved={refetch}
          />
        </div>
        <div className="sm:col-span-2 xl:col-span-3">
          <SettingFieldCard
            label={t("info_privacy")}
            value={s.privacy}
            fieldKey="privacy"
            type="textarea"
            icon={<Shield className="h-4 w-4" />}
            onSaved={refetch}
          />
        </div>
      </SectionBlock>
    </div>
  );
}
