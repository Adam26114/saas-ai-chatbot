import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
    (typeof client.api.users)["bulk-delete"]["$post"]
>;
type RequestType = InferRequestType<
    (typeof client.api.users)["bulk-delete"]["$post"]
>["json"];

export const useBulkDeleteAccounts = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.users["bulk-delete"]["$post"]({
                json,
            });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Users Deleted ");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (err) => {
            console.log(err);
            toast.error("Failed to delete users");
        },
    });

    return mutation;
};
