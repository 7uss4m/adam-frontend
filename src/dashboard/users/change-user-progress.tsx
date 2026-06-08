import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import putUserProgress from "../../api/putUserProgress";
import getLevels from "../../api/getLevels";
import { Level, User } from "../../types/types";
import Spinner from "../../components/Spinner";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { useTranslation } from "react-i18next";

export default function ChangeUserProgress({
  userId,
  query,
  user,
}: {
  userId: number;
  query: UseQueryResult;
  user: User;
}) {
  // toast
  const { toast } = useToast();

  // query
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["change user level"],
    queryFn: async () => {
      const response = await getLevels();
      return response.data.result as Level[];
    },
    refetchOnWindowFocus: false,
  });

  // state
  const [open, setOpen] = useState(false);
  const [levelId, setLevelId] = useState<string>(user.level.id.toString());

  // Update levelId when user data changes
  useEffect(() => {
    setLevelId(user.level.id.toString());
  }, [user.level.id]);

  // mutation
  const changeUserProgressMutation = useMutation({
    mutationFn: async () => {
      const selectedLevel = data?.find(
        (lvl) => Number(lvl.id) === Number(levelId)
      ) as Level;
      const progressToSend =
        Number(selectedLevel?.id) == 1
          ? 1
          : (data?.find((lvl) => Number(lvl.id) === Number(levelId) - 1)
              ?.max as number) + 1;
      const response = putUserProgress(
        localStorage.getItem("token") as string,
        userId.toString(),
        progressToSend
      );
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result,
      });
      query.refetch();
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error,
      });
    },
  });

  // translation
  const [t, i18n] = useTranslation("global");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"sm"} className="w-1/2">
          {t("change_progress")}
        </Button>
      </DialogTrigger>
      <DialogContent
        dir={i18n.language == "en" ? "ltr" : "rtl"}
        className="sm:max-w-[425px]"
      >
        <DialogHeader>
          <DialogTitle className="text-start">
            {t("change_progress")}
          </DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            {isLoading ? (
              <Spinner />
            ) : isSuccess && data.length > 0 ? (
              <RadioGroup
                value={levelId}
                onValueChange={(val) => {
                  setLevelId(val);
                }}
              >
                {data.map((level) => (
                  <div className="flex items-center space-x-2" key={level.id}>
                    <RadioGroupItem value={level.id} id={level.id} />
                    <Label htmlFor={level.id}>
                      {t(level.name.toLowerCase())}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-accent col-span-4">
                {t("something_went_wrong")}
              </p>
            )}
            {/* <Label htmlFor="progress" className="text-right">
              Progress
            </Label>
            <Input
              ref={progressRef}
              id="progress"
              type="number"
              defaultValue={progress}
              min={0}
              className="col-span-3"
            /> */}
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={changeUserProgressMutation.isPending}
            type="submit"
            onClick={() => {
              changeUserProgressMutation.mutate();
            }}
          >
            {changeUserProgressMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
