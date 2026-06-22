import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useMutation, UseQueryResult } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import putAdmin from "../../api/putAdmin";
import { useTranslation } from "react-i18next";
import { User } from "../../types/types";
import {
  ALL_PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_LABEL_KEYS,
} from "./permissions-config";

export default function EditPermissionsForm({
  user,
  query,
}: {
  user: User;
  query: UseQueryResult;
}) {
  const [open, setOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    user.permissions || []
  );

  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();

  const allSelected = selectedPermissions.length === ALL_PERMISSIONS.length;

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions([...ALL_PERMISSIONS]);
    }
  };

  const putAdminMutation = useMutation({
    mutationFn: async () => {
      const response = await putAdmin(
        localStorage.getItem("token") as string,
        user.id.toString(),
        { permissions: selectedPermissions }
      );
      return response;
    },
    onSuccess: () => {
      toast({
        title: t("permissions_updated"),
      });
      setOpen(false);
      query.refetch();
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
      });
    },
  });

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (value) {
      setSelectedPermissions(user.permissions || []);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t("edit_permissions")}
        </Button>
      </DialogTrigger>
      <DialogContent
        dir={i18n.language === "en" ? "ltr" : "rtl"}
        className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto border-[#1a2a44] bg-[#0a1628]"
      >
        <DialogHeader>
          <DialogTitle className="text-primary">
            {t("edit_permissions")} - {user.user_name}
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>{t("edit_permissions")}</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
            <Checkbox
              id="edit-select-all"
              checked={allSelected}
              onCheckedChange={toggleAll}
              className="border-cyan-500 data-[state=checked]:bg-cyan-500"
            />
            <Label
              htmlFor="edit-select-all"
              className="cursor-pointer text-sm font-bold text-cyan-400"
            >
              {t("select_all")}
            </Label>
          </div>

          {PERMISSION_GROUPS.map((group) => (
            <div
              key={group.labelKey}
              className="rounded-lg border border-[#1a2a44] bg-[#050B14] p-4"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan-400/70">
                {t(group.labelKey)}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {group.permissions.map((perm) => (
                  <div key={perm} className="flex items-center gap-2">
                    <Checkbox
                      id={`edit-perm-${perm}`}
                      checked={selectedPermissions.includes(perm)}
                      onCheckedChange={() => togglePermission(perm)}
                    />
                    <Label
                      htmlFor={`edit-perm-${perm}`}
                      className="cursor-pointer text-sm text-muted-foreground"
                    >
                      {t(PERMISSION_LABEL_KEYS[perm])}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={putAdminMutation.isPending}
            variant={putAdminMutation.isPending ? "ghost" : "default"}
            onClick={(e) => {
              e.preventDefault();
              putAdminMutation.mutate();
            }}
          >
            {putAdminMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
