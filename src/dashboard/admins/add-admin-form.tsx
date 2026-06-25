import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
          user_name: userName,
          email: email,
          password: password,
          permissions: selectedPermissions,
        }
      );
      return response;
    },
    onSuccess: () => {
      toast({ title: t("employee_added") });
      setOpen(false);
      resetForm();
      query.refetch();
    },
    onError: (error: AxiosError) => {
      toast({
        title: t("error"),
        description: (error.response?.data as { error: string }).error,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setStep(1);
    setSelectedPermissions([]);
    setUserName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) resetForm();
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
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  {t("password")}
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="border-[#1a2a44] bg-[#050B14] pe-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 end-0 flex items-center pe-3 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="default"
                onClick={() => {
                  if (!userName || !email || !password) {
                    toast({
                      title: t("error"),
                      description: t("fill_all_fields"),
                      variant: "destructive",
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
