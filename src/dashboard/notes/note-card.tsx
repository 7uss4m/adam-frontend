import { UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, Coins, CreditCard, Mail, User } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import NoteRowActions from "./note-row-actions";
import NoteStatusBadge from "./note-status-badge";
import type { DashboardNote } from "./note-utils";
import {
  fmtCoins,
  formatNoteDate,
  noteImageUrl,
  relativeNoteTime,
} from "./note-utils";
import { cn } from "../../lib/utils";

type NoteCardProps = {
  note: DashboardNote;
  query: UseQueryResult;
};

export default function NoteCard({ note, query }: NoteCardProps) {
  const [t, i18n] = useTranslation("global");
  const [imageOpen, setImageOpen] = useState(false);
  const imageUrl = noteImageUrl(note.image);
  const isPending = note.status === "pinding";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card/80 transition-all hover:-translate-y-0.5 hover:shadow-lg",
        isPending
          ? "border-amber-500/30 hover:border-amber-500/50"
          : "border-border/50 hover:border-primary/30"
      )}
    >
      {isPending && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />
      )}

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">#{note.id}</span>
              <NoteStatusBadge status={note.status} />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-2xl font-black tabular-nums text-foreground">
              <Coins className="h-5 w-5 text-primary" />
              {fmtCoins(note.coins)}
              <span className="text-sm font-bold text-muted-foreground">
                {note.currencyName || t("deleted")}
              </span>
            </p>
          </div>
          <NoteRowActions note={note} query={query} compact />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
              <User className="h-3 w-3" />
              {t("users")}
            </p>
            <p className="mt-0.5 truncate font-bold text-foreground">{note.username}</p>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              {note.email || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/50 px-3 py-2.5">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase text-muted-foreground">
              <CreditCard className="h-3 w-3" />
              {t("charge_boxes")}
            </p>
            <p className="mt-0.5 truncate font-bold text-foreground">
              {note.boxName || t("deleted")}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {note.currencies?.boxes?.account_name || "—"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {relativeNoteTime(note.created_at, i18n.language)}
          </span>
          <span>·</span>
          <span>{formatNoteDate(note.created_at, i18n.language)}</span>
        </div>

        {imageUrl ? (
          <>
            <button
              type="button"
              onClick={() => setImageOpen(true)}
              className="mt-4 block w-full overflow-hidden rounded-xl border border-border/50 bg-muted/30"
            >
              <img
                src={imageUrl}
                alt={`Receipt ${note.id}`}
                className="max-h-40 w-full object-contain transition-transform group-hover:scale-[1.02]"
              />
            </button>
            <Dialog open={imageOpen} onOpenChange={setImageOpen}>
              <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("view_image")}</DialogTitle>
                </DialogHeader>
                <img
                  src={imageUrl}
                  alt={`Receipt ${note.id}`}
                  className="w-full rounded-xl border border-border object-contain"
                />
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="mt-4 flex h-24 items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/20 text-xs text-muted-foreground">
            {t("note_no_receipt")}
          </div>
        )}

        {(isPending || note.status === "reject") && (
          <div className="mt-4 border-t border-border/40 pt-4">
            <NoteRowActions note={note} query={query} />
          </div>
        )}
      </div>
    </div>
  );
}
