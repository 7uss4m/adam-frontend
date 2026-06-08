import { useMutation } from "@tanstack/react-query";
import postRegenerate from "../../api/postRegenerateKey";
import { Client } from "../../types/types";
import { toast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { Button } from "../../components/ui/button";
import { useTranslation } from "react-i18next";
import { Clipboard } from "lucide-react";

export default function RegenerateApiKey({ client }: { client: Client }) {
  // mutation
  const postRegenerateMutation = useMutation({
    mutationFn: async () => {
      const response = await postRegenerate(
        {
          name: client.name,
          balance: client.balance,
          active: client.active,
        },
        client.id.toString(),
        localStorage.getItem("token") as string
      );

      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        action: (
          <div className="flex flex-col items-start justify-start">
            <Button
              onClick={() => {
                navigator.clipboard.writeText(data.data.client.api_key);
                toast({
                  title: t("copied"),
                });
              }}
            >
              <Clipboard />
            </Button>
            {data.data.client.api_key}
          </div>
        ),
      });
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
      });
    },
  });
  const [t] = useTranslation("global");
  return (
    <Button
      disabled={postRegenerateMutation.isPending}
      onClick={() => {
        postRegenerateMutation.mutate();
      }}
    >
      {t("generate_key")}
    </Button>
  );
}
