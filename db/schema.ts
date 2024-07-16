import { createId } from "@paralleldrive/cuid2";
import {  sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { createInsertSchema } from "drizzle-zod";

export const users = sqliteTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    fullname: text("fullname").notNull(),
    clerkId: text("clerk_id").notNull().unique(),
    type: text("type").notNull(),
    createdAt: text("created_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
    updateAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
        () => new Date()
    ),
    stripeId: text("stripe_id"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
    domains: many(domains),
    campaigns: many(campaign),
    subscription: one(billings, {
        fields: [users.id],
        references: [billings.userId],
    }),
}));

export const insertUserSchema = createInsertSchema(users);

export const domains = sqliteTable("domains", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    name: text("name").notNull(),
    icon: text("icon").notNull(),
    userId: text("user_id").references(() => users.id, {
        onDelete: "cascade",
    }),
    campaignId: text("campaign_id").references(() => users.id),
});

export const domainsRelations = relations(domains, ({ one, many }) => ({
    user: one(users, {
        fields: [domains.userId],
        references: [users.id],
    }),
    chatBot: one(chatBots),
    helpdesk: many(helpDesk),
    filterQuestions: many(filterQuestions),
    customer: many(customer),
    products: many(product),
    campaign: one(campaign, {
        fields: [domains.campaignId],
        references: [campaign.id],
    }),
}));

export const insertDomainSchema = createInsertSchema(domains);

export const chatBots = sqliteTable("chat_bots", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    welcomeMessage: text("welcome_message"),
    icon: text("icon"),
    background: text("background"),
    textColor: text("text_color"),
    helpdesk: integer("help_desk", { mode: "boolean" })
        .notNull()
        .default(false),
    domainId: text("domain_id").references(() => domains.id, {
        onDelete: "cascade",
    }),
});

export const chatBotsRelations = relations(chatBots, ({ one }) => ({
    domains: one(domains, {
        fields: [chatBots.domainId],
        references: [domains.id],
    }),
}));

export const insertChatBotSchema = createInsertSchema(chatBots);

export const billings = sqliteTable("billings", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    plan: text("plan", { enum: ["STANDARD", "PRO", "ULTIMATE"] }).default(
        "STANDARD"
    ),
    credits: integer("credits").default(10).notNull(),
    userId: text("user_id").references(() => users.id, {
        onDelete: "cascade",
    }),
});

export const billingsRelations = relations(billings, ({ one }) => ({
    users: one(users, {
        fields: [billings.userId],
        references: [users.id],
    }),
}));

export const insertBillingSchema = createInsertSchema(billings);

export const helpDesk = sqliteTable("help_desk", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    question: text("question").notNull(),
    answer: text("answer").notNull(),

    domainId: text("domain_id").references(() => domains.id, {
        onDelete: "cascade",
    }),
});

export const helpDeskRelations = relations(helpDesk, ({ one }) => ({
    domains: one(domains, {
        fields: [helpDesk.domainId],
        references: [domains.id],
    }),
}));

export const insertHelpDeskSchema = createInsertSchema(helpDesk);

export const filterQuestions = sqliteTable("filter_questions", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    question: text("question").notNull(),
    answer: text("answer"),

    domainId: text("domain_id").references(() => domains.id, {
        onDelete: "cascade",
    }),
});

export const filterQuestionsRelations = relations(
    filterQuestions,
    ({ one }) => ({
        domains: one(domains, {
            fields: [filterQuestions.domainId],
            references: [domains.id],
        }),
    })
);

export const insertFilterQuestionSchema = createInsertSchema(filterQuestions);

export const customerResponses = sqliteTable("customer_responses", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    question: text("question").notNull(),
    answer: text("answer"),

    customerId: text("customer_id").references(() => customer.id, {
        onDelete: "cascade",
    }),
});

export const customerResponsesRelations = relations(
    customerResponses,
    ({ one }) => ({
        customer: one(customer, {
            fields: [customerResponses.customerId],
            references: [customer.id],
        }),
    })
);

export const insertCustomerResponseSchema =
    createInsertSchema(customerResponses);

export const customer = sqliteTable("customer", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    email: text("email").notNull(),

    domainId: text("domain_id").references(() => domains.id),
});

export const customerRelations = relations(customer, ({ many, one }) => ({
    questions: many(customerResponses),
    chatRoom: many(chatRoom),
    booking: many(bookings),
    domain: one(domains, {
        fields: [customer.domainId],
        references: [domains.id],
    }),
}));

export const insertCustomerSchema = createInsertSchema(customer);

export const chatRoom = sqliteTable("chat_room", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    live: integer("live", { mode: "boolean" }).notNull().default(false),
    mailed: integer("mailed", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
    updateAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
        () => new Date()
    ),

    customerId: text("customer_id").references(() => customer.id, {
        onDelete: "cascade",
    }),
});

export const chatRoomRelations = relations(chatRoom, ({ one, many }) => ({
    customer: one(customer, {
        fields: [chatRoom.customerId],
        references: [customer.id],
    }),
    message: many(chatMessage),
}));

export const insertChatRoomSchema = createInsertSchema(chatRoom);

export const chatMessage = sqliteTable("chat_message", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    message: text("message").notNull(),
    role: text("role", { enum: ["user", "assistant"] }),
    createdAt: text("created_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
    updateAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
        () => new Date()
    ),
    chatRoomId: text("chat_room_id").references(() => chatRoom.id),
    seen: integer("seen", { mode: "boolean" }).notNull().default(false),
});

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
    chatRoom: one(chatRoom, {
        fields: [chatMessage.chatRoomId],
        references: [chatRoom.id],
    }),
}));

export const insertChatMessageSchema = createInsertSchema(chatMessage);

export const bookings = sqliteTable("bookings", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    date: integer("date", { mode: "timestamp" }).notNull(),
    slot: text("slot").notNull(),
    email: text("email").notNull(),
    customerId: text("customer_id").references(() => customer.id, {
        onDelete: "cascade",
    }),
    domainId: text("domain_id").references(() => domains.id),
    createdAt: text("created_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
});

export const chatBookingsRelations = relations(bookings, ({ one }) => ({
    customer: one(customer, {
        fields: [bookings.customerId],
        references: [customer.id],
    }),
    domain: one(domains, {
        fields: [bookings.domainId],
        references: [domains.id],
    }),
}));

export const insertBookingSchema = createInsertSchema(bookings);

export const campaign = sqliteTable("campaign", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    name: text("name").notNull(),
    customer: text("customer", { mode: "json" })
        .notNull()
        .$type<string[]>()
        .default(sql`(json_array())`),
    template: text("template"),
    userId: text("user_id").references(() => users.id, {
        onDelete: "cascade",
    }),
    createdAt: text("created_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
});

export const campaignRelations = relations(campaign, ({ one, many }) => ({
    domains: many(domains),
    users: one(users, {
        fields: [campaign.userId],
        references: [users.id],
    }),
}));

export const insertCampaignSchema = createInsertSchema(campaign);

export const product = sqliteTable("product", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),
    name: text("name").notNull(),
    price: integer("price").notNull(),
    image: text("image").notNull(),
    createdAt: text("created_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
    domainId: text("domain_id").references(() => domains.id),
});

export const productRelations = relations(product, ({ one }) => ({
    domains: one(domains, {
        fields: [product.domainId],
        references: [domains.id],
    }),
}));

export const insertProductSchema = createInsertSchema(product);
