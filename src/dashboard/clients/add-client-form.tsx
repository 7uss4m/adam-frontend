import { useEffect, useRef, useState } from "react";
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
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import postClient from "../../api/postClient";
import getUsers from "../../api/getUsers";

// shadcn combobox pieces
import { Check, Loader2, X } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command";
import { cn } from "../../lib/utils";
import { User } from "../../types/types";

function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function AddClientForm({ query }: { query: UseQueryResult }) {
  // dialog state
  const [open, setOpen] = useState(false);

  // refs
  const nameRef = useRef<HTMLInputElement>(null);
  const balanceRef = useRef<HTMLInputElement>(null);

  // user selector state
  const [userSearch, setUserSearch] = useState("");
  const debouncedQuery = useDebounced(userSearch, 350);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // i18n + toast
  const [t, i18n] = useTranslation("global");
  const { toast } = useToast();

  const postClientMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser?.id) {
        throw new Error(t("selectUserFirst") || "Please select a user first.");
      }
      const response = await postClient(
        localStorage.getItem("token") as string,
        {
          name: nameRef.current?.value as string,
          balance: Number(
            (balanceRef.current?.value || "").toString().replace(",", ".")
          ),
          userId: selectedUser.id.toString(),
        }
      );
      return response;
    },
    onSuccess: (data) => {
      toast({ title: t("done") || "Done!", description: data.data.result });
      setOpen(false);
      setSelectedUser(null);
      setUserSearch("");
      query.refetch();
    },
    onError: (error: AxiosError | Error) => {
      toast({
        title: t("error") || "Error!",
        description: error.message || "Unknown error",
      });
    },
  });

  const getUsersQuery = useQuery({
    queryKey: ["users", debouncedQuery],
    queryFn: async () => {
      const response = await getUsers({
        token: localStorage.getItem("token") as string,
        search: debouncedQuery,
      });

      return response.data.result.users as User[];
    },
  });

  const users: User[] = getUsersQuery.data as User[];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          // reset on close
          setSelectedUser(null);
          setUserSearch("");
          if (nameRef.current) nameRef.current.value = "";
          if (balanceRef.current) balanceRef.current.value = "";
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default">{t("add")}</Button>
      </DialogTrigger>

      <DialogContent
        dir={i18n.language === "en" ? "ltr" : "rtl"}
        className="sm:max-w-[520px]"
      >
        <DialogHeader>
          <DialogTitle className="text-primary">
            {t("add")} {t("client") ?? "Client"}
          </DialogTitle>
          <VisuallyHidden.Root>
            <DialogDescription>
              {t("add")} {t("client")}
            </DialogDescription>
          </VisuallyHidden.Root>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("name")}
            </Label>
            <Input id="name" className="col-span-3" ref={nameRef} />
          </div>

          {/* Balance */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="balance" className="text-right">
              {t("balance")}
            </Label>
            <Input
              id="balance"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              className="col-span-3"
              ref={balanceRef}
              onChange={(e) => {
                // normalize commas to dots (visual; server still gets Number())
                e.currentTarget.value = e.currentTarget.value.replace(",", ".");
              }}
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right">{t("user") ?? "User"}</Label>

            <div className="col-span-3 flex flex-col gap-2">
              <Command shouldFilter={false}>
                <CommandInput
                  className="z-50"
                  placeholder={(t("search") ?? "Search") + "…"}
                  onValueChange={setUserSearch}
                  autoFocus
                />
                <CommandList>
                  {!debouncedQuery ? (
                    <div className="p-3 text-sm opacity-70">
                      {t("typeToSearch")}
                    </div>
                  ) : getUsersQuery.isFetching ? (
                    <div className="flex items-center gap-2 p-3 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("loading") ?? "Loading…"}
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>
                        {t("no_results") ?? "No users found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {users.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={u.id.toString()}
                            onSelect={() => {
                              setSelectedUser(u);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUser?.id === u.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{u.user_name}</span>
                              {u.email ? (
                                <span className="text-xs opacity-70">
                                  {u.email}
                                </span>
                              ) : null}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>

              {selectedUser && (
                <div className="flex items-center gap-2 text-xs rounded-md border px-2 py-1">
                  <span className="font-medium">
                    {t("selected") ?? "Selected"}:
                  </span>
                  <span className="truncate">{selectedUser.user_name}</span>
                  <span className="opacity-60">({selectedUser.id})</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={postClientMutation.isPending || !selectedUser?.id}
            variant={postClientMutation.isPending ? "ghost" : "default"}
            onClick={(e) => {
              e.preventDefault();
              postClientMutation.mutate();
            }}
          >
            {postClientMutation.isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddClientForm;
