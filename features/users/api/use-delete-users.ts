import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
    (typeof client.api.users)[":id"]["$delete"]
>;

export const useDeleteAccount = (id?: string) => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error>({
        mutationFn: async (json) => {
            const response = await client.api.users[":id"]["$delete"]({
                param: { id },
            });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("User Deleted");
            queryClient.invalidateQueries({ queryKey: ["user", { id }] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
           
        },
        onError: (err) => {
            console.log(err);
            toast.error("Failed to delete user");
        },
    });

    return mutation;
};
