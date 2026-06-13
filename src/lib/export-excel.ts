import { utils, writeFile } from "xlsx";

import type { DailyReconciliation } from "../api/getDailyReconciliation";
import type { DashboardNote } from "../dashboard/notes/note-utils";
import { formatNoteDate } from "../dashboard/notes/note-utils";

function statusLabel(status: string, ar: boolean) {
  if (status === "pinding") return ar ? "معلق" : "Pending";
  if (status === "success") return ar ? "ناجح" : "Success";
  if (status === "reject") return ar ? "مرفوض" : "Rejected";
  if (status === "accept") return ar ? "مقبول" : "Accepted";
  if (status === "wait") return ar ? "انتظار" : "Wait";
  return status;
}

export function exportNotesToExcel(
  notes: DashboardNote[],
  filename: string,
  locale: string = "ar"
) {
  const ar = locale === "ar";
  const rows = notes.map((n) =>
    ar
      ? {
          المعرف: n.id,
          المستخدم: n.username,
          الايميل: n.email,
          المبلغ: Number(n.coins),
          العملة: n.currencyName,
          "صندوق الشحن": n.boxName,
          الحالة: statusLabel(n.status, true),
          التاريخ: formatNoteDate(n.created_at, locale),
        }
      : {
          ID: n.id,
          User: n.username,
          Email: n.email,
          Amount: Number(n.coins),
          Currency: n.currencyName,
          "Charge box": n.boxName,
          Status: statusLabel(n.status, false),
          Date: formatNoteDate(n.created_at, locale),
        }
  );

  const ws = utils.json_to_sheet(rows);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, ar ? "الإيداعات" : "Deposits");
  writeFile(wb, filename);
}

export function exportReconciliationToExcel(
  data: DailyReconciliation,
  filename: string,
  locale: string = "ar"
) {
  const ar = locale === "ar";
  const wb = utils.book_new();

  const noteRows = data.notes.map((n) =>
    ar
      ? {
          المعرف: n.id,
          المستخدم: n.user?.user_name ?? "—",
          الايميل: n.user?.email ?? "—",
          المبلغ: Number(n.coins),
          العملة: n.currencies?.name ?? "—",
          الصندوق: n.currencies?.boxes?.name ?? "—",
          الحالة: statusLabel(n.status, true),
          التاريخ: formatNoteDate(n.created_at, locale),
        }
      : {
          ID: n.id,
          User: n.user?.user_name ?? "—",
          Email: n.user?.email ?? "—",
          Amount: Number(n.coins),
          Currency: n.currencies?.name ?? "—",
          Box: n.currencies?.boxes?.name ?? "—",
          Status: statusLabel(n.status, false),
          Date: formatNoteDate(n.created_at, locale),
        }
  );

  const orderRows = data.orders.map((o) =>
    ar
      ? {
          المعرف: o.id,
          المستخدم: o.user?.user_name ?? "—",
          المنتج: o.product?.name ?? "—",
          الفئة: o.product?.categories?.name ?? "—",
          الكمية: Number(o.quantity),
          الإجمالي: Number(o.total),
          الحالة: statusLabel(o.status, true),
          التاريخ: formatNoteDate(o.created_at, locale),
        }
      : {
          ID: o.id,
          User: o.user?.user_name ?? "—",
          Product: o.product?.name ?? "—",
          Category: o.product?.categories?.name ?? "—",
          Quantity: Number(o.quantity),
          Total: Number(o.total),
          Status: statusLabel(o.status, false),
          Date: formatNoteDate(o.created_at, locale),
        }
  );

  const summaryRows = ar
    ? [
        { البند: "تاريخ الجرد", القيمة: data.date },
        { البند: "عدد الإيداعات", القيمة: data.summary.notesCount },
        {
          البند: "إيداعات ناجحة (عدد)",
          القيمة: data.summary.notesSuccessCount,
        },
        {
          البند: "إيداعات ناجحة (مبلغ)",
          القيمة: data.summary.notesSuccessAmount,
        },
        {
          البند: "إيداعات معلّقة (عدد)",
          القيمة: data.summary.notesPendingCount,
        },
        {
          البند: "إيداعات معلّقة (مبلغ)",
          القيمة: data.summary.notesPendingAmount,
        },
        { البند: "عدد الطلبات", القيمة: data.summary.ordersCount },
        { البند: "إجمالي الطلبات", القيمة: data.summary.ordersTotal },
      ]
    : [
        { Item: "Date", Value: data.date },
        { Item: "Deposits count", Value: data.summary.notesCount },
        { Item: "Successful deposits", Value: data.summary.notesSuccessCount },
        {
          Item: "Successful deposit amount",
          Value: data.summary.notesSuccessAmount,
        },
        { Item: "Pending deposits", Value: data.summary.notesPendingCount },
        {
          Item: "Pending deposit amount",
          Value: data.summary.notesPendingAmount,
        },
        { Item: "Orders count", Value: data.summary.ordersCount },
        { Item: "Orders total", Value: data.summary.ordersTotal },
      ];

  utils.book_append_sheet(
    wb,
    utils.json_to_sheet(summaryRows),
    ar ? "الملخص" : "Summary"
  );
  utils.book_append_sheet(
    wb,
    utils.json_to_sheet(noteRows),
    ar ? "الإيداعات" : "Deposits"
  );
  utils.book_append_sheet(
    wb,
    utils.json_to_sheet(orderRows),
    ar ? "الطلبات" : "Orders"
  );

  writeFile(wb, filename);
}
