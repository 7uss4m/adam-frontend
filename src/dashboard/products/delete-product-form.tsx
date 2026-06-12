import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog"
import { UseQueryResult, useMutation } from "@tanstack/react-query";
import { useToast } from "../../components/ui/use-toast";
import { AxiosError } from "axios";
import { Button } from "../../components/ui/button";
import deleteProduct from "../../api/deleteProduct";
import { Trash2 } from "lucide-react";

export default function DeleteProductForm({
  id,
  query,
  compact = false,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: {
  id: string;
  query: UseQueryResult;
  compact?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  // toast
  const { toast } = useToast()


  // mutation
  const deleteProductMutation = useMutation({
    mutationFn: async () => {
      const response = await deleteProduct(localStorage.getItem("token") as string, id);
      return response
    },
    onSuccess: (data) => {
      toast({
        title: "Done!",
        description: data.data.result
      })
      setOpen(false);
      query.refetch()
    },
    onError: (error: AxiosError) => {
      toast({
        title: "Error!",
        description: (error.response?.data as { error: string }).error
      })
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <AlertDialogTrigger asChild>
          {compact ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="destructive" size="sm">Delete</Button>
          )}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete product
            and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={deleteProductMutation.isPending} onClick={(e) => {
            e.preventDefault()
            deleteProductMutation.mutate()
          }}>{deleteProductMutation.isPending ? "Deleting..." : "Delete"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
