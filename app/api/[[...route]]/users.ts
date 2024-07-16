import { ClerkProvider } from "@clerk/nextjs";
import { z } from "zod";
import { Hono } from "hono";
import { db } from "@/db/db";
import { createId } from "@paralleldrive/cuid2";
import { users, insertUserSchema } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { and, eq, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

const app = new Hono()
    .get("/", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);

        if (!auth?.userId) return c.json({ error: "Unautherized" }, 401);
        const data = await db
            .select({
                id: users.id,
                fullname: users.fullname,
                clerkId: users.clerkId,
                type: users.type,
                updateAt: users.createdAt,
                stripeId: users.stripeId,
            })
            .from(users)
            .where(eq(users.clerkId, auth.userId));

        return c.json({ data });
    })
    .get(
        "/:id",
        zValidator(
            "param",
            z.object({
                id: z.string().optional(),
            })
        ),
        clerkMiddleware(),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!auth?.userId) return c.json({ error: "Unautherized!" }, 401);

            if (!id) return c.json({ error: "Missing Id!" }, 400);

            const [data] = await db
                .select({
                    id: users.id,
                    fullname: users.fullname,
                    clerkId: users.clerkId,
                    type: users.type,
                    updateAt: users.createdAt,
                    stripeId: users.stripeId,
                })
                .from(users)
                .where(eq(users.clerkId, auth.userId));

            if (!data) return c.json({ error: "Not found!" }, 404);

            return c.json({ data });
        }
    )
    .post(
        "/",
        clerkMiddleware(),
        zValidator(
            "json",
            insertUserSchema.pick({
                fullname: true,
                type: true,
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) return c.json({ error: "Unautherized" }, 401);
            const values = c.req.valid("json");


            const [data] = await db
                .insert(users)
                .values({
                    clerkId: auth.userId,
                    ...values,
                })
                .returning();

            return c.json({ data });
        }
    )
    .post(
        "/bulk-delete",
        clerkMiddleware(),
        zValidator(
            "json",
            z.object({
                ids: z.array(z.string()),
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const values = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unautherized" }, 401);

            const data = await db
                .delete(users)
                .where(
                    and(
                        eq(users.clerkId, auth.userId),
                        inArray(users.id, values.ids)
                    )
                )
                .returning({
                    id: users.id,
                });

            return c.json({ data });
        }
    )
    .patch(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({ id: z.string().optional() })),
        zValidator(
            "json",
            insertUserSchema.pick({
                fullname: true,
                type: true,
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");
            const values = c.req.valid("json");

            if (!auth?.userId) return c.json({ error: "Unautherized!" }, 401);

            if (!id) return c.json({ error: "Missing Id!" }, 400);

            const [data] = await db
                .update(users)
                .set(values)
                .where(
                    and(eq(users.clerkId, auth.userId), eq(users.id, id))
                )
                .returning();

            if (!data) return c.json({ error: "Not found!" }, 404);
            return c.json({ data });
        }
    )
    .delete(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({ id: z.string().optional() })),
        async (c) => {
            const auth = getAuth(c);
            const { id } = c.req.valid("param");

            if (!auth?.userId) return c.json({ error: "Unautherized!" }, 401);

            if (!id) return c.json({ error: "Missing Id!" }, 400);

            const [data] = await db
                .delete(users)
                .where(
                    and(eq(users.clerkId, auth.userId), eq(users.id, id))
                )
                .returning({
                    id: users.id,
                });

            if (!data) return c.json({ error: "Not found!" }, 404);
            return c.json({ data });
        }
    );

export default app;
