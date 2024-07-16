import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { insertUserSchema } from "@/db/schema";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { UserRegistrationSchema } from "@/schemas/auth.schema";
import { toast } from "sonner";
import { useSignUp } from "@clerk/nextjs";

// const formShema = insertUserSchema.pick({
//     fullname: true,
//     type: true,
// });

type FormValues = z.input<typeof UserRegistrationSchema>;

type Props = {
    id?: string;
    defaultValues?: FormValues;
    onSubmit: (values: FormValues) => void;
    onDelete?: () => void;
    disabled?: boolean;
};

export const AccountForm = ({
    id,
    defaultValues,
    onSubmit,
    onDelete,
    disabled,
}: Props) => {

    const { signUp, isLoaded, setActive } = useSignUp();

    const form = useForm<FormValues>({
        resolver: zodResolver(UserRegistrationSchema),
        defaultValues: defaultValues || {
            type: "owner",
        },
        mode: "onChange",
    });

    const onGenerateOTP = async (
        email: string,
        password: string,
        onNext: React.Dispatch<React.SetStateAction<number>>
    ) => {
        if (!isLoaded) return;

        try {
            await signUp.create({
                emailAddress: email,
                password: password,
            });

            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            onNext((prev) => prev + 1);
        } catch (error: any) {
            toast("Error", {
                description: error.errors[0].longMessage,
            });
        }
    };

    const handleSubmit = (values: FormValues) => {
        onSubmit(values);
    };

    const handleDelete = () => {
        onDelete?.();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className=" space-y-4 pt-4"
            >
                <FormField
                    name="fullname"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    disabled={disabled}
                                    placeholder="e.g Cash, Bank, Credit Card"
                                    className="text-sm"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-full" disabled={disabled}>
                    {id ? "Save changes" : "Create account "}
                </Button>

                {!!id && (
                    <Button
                        type="button"
                        disabled={disabled}
                        onClick={handleDelete}
                        className="w-full"
                        variant="outline"
                    >
                        <Trash className=" size-4 mr-2 " />
                        Delete account
                    </Button>
                )}
            </form>
        </Form>
    );
};
