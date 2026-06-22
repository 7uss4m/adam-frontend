import { useRef, useState } from "react";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useMutation, UseQueryResult } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import postAdmin from "../../api/postAdmin";
import { useTranslation } from "react-i18next";
import {
  ALL_PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_LABEL_KEYS,
} from "./permissions-config";

export function AddAdminForm({ query }: { query: UseQueryResult }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const userRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

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

  const postAdminMutation = useMutation({
    mutationFn: async () => {
      const response = await postAdmin(
        localStorage.getItem("token") as string,
        {
          user_name: userRef.current?.value as string,
          email: emailRef.current?.value as string,
          password: passwordRef.current?.value as string,
          permissions: selectedPermissions,
        }
      );
      return response;
    },
    onSuccess: () => {
      toast({
        title: t("employee_added"),
      });
      setOpen(false);
      setStep(1);
      setSelectedPermissions([]);
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
    if (!value) {
      setStep(1);
      setSelectedPermissions([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">{t("add_employee")}</Button>
      </DialogTrigger>
      <DialogContent
        dir={i18n.language === "en" ? "ltr" : "rtl"}
        className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto border-[#1a2a44] bg-[#0a1628]"
      >
        <DialogHeader>
          <DialogTitle className="text-primary">
            {t("add_employee")} - {t("step")} {step}/2
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>{t("add_employee")}</DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        {step === 1 ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  {t("username")}
                </Label>
                <Input
                  id="username"
                  className="col-span-3 border-[#1a2a44] bg-[#050B14]"
                  ref={userRef}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  {t("email")}
                </Label>
                <Input
                  id="email"
                  type="text"
                  className="col-span-3 border-[#1a2a44] bg-[#050B14]"
                  ref={emailRef}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  {t("password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="col-span-3 border-[#1a2a44] bg-[#050B14]"
                  ref={passwordRef}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="default"
                onClick={() => {
                  if (
                    !userRef.current?.value ||
                    !emailRef.current?.value ||
                    !passwordRef.current?.value
                  ) {
                    toast({
                      title: "Error!",
                      description: t("fill_all_fields") || "Please fill all fields",
                    });
                    return;
                  }
                  setStep(2);
                }}
              >
                {t("next")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  className="border-cyan-500 data-[state=checked]:bg-cyan-500"
                />
                <Label
                  htmlFor="select-all"
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
                          id={`perm-${perm}`}
                          checked={selectedPermissions.includes(perm)}
                          onCheckedChange={() => togglePermission(perm)}
                        />
                        <Label
                          htmlFor={`perm-${perm}`}
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
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                {t("back")}
              </Button>
              <Button
                type="submit"
                disabled={postAdminMutation.isPending}
                variant={postAdminMutation.isPending ? "ghost" : "default"}
                onClick={(e) => {
                  e.preventDefault();
                  postAdminMutation.mutate();
                }}
              >
                {postAdminMutation.isPending ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
