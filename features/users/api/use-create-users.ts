import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.users.$post>;
type RequestType = InferRequestType<typeof client.api.users.$post>["json"];

export const useCreateAccount = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (json) => {
            const response = await client.api.users.$post({ json });
            return await response.json();
        },
        onSuccess: () => {
            toast.success("User Created");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (err) => {
            console.log(err);
            toast.error("Failed to create account");
        },
    });

    return mutation;
};
