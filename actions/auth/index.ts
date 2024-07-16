"use server";

import { db } from "@/db/db";
import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { onGetAllAccountDomains } from "../settings";
import { users } from "@/db/schema";

export const onCompleteUserRegistration = async (
    fullname: string,
    clerkId: string,
    type: string
) => {
    try {
        const register = await client.user.create({
            data: {
                fullname,
                clerkId,
                type,
                subscription: {
                    create: {},
                },
            },
            select: {
                fullname: true,
                id: true,
                type: true,
            },
        });

        const registered = await db.insert(users)

        if (registered) {
            return { status: 200, user: registered };
        }
    } catch (error) {
        return { status: 400 };
    }
};

export const onLoginUser = async () => {
    const user = await currentUser();
    if (!user) redirectToSignIn();
    else {
        try {
            const authenticated = await client.user.findUnique({
                where: {
                    clerkId: user.id,
                },
                select: {
                    fullname: true,
                    id: true,
                    type: true,
                },
            });
            if (authenticated) {
                const domains = await onGetAllAccountDomains();
                return {
                    status: 200,
                    user: authenticated,
                    domain: domains?.domains,
                };
            }
        } catch (error) {
            return { status: 400 };
        }
    }
};
