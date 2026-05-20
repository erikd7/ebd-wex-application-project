import {
  pgTable,
  bigserial,
  uuid,
  varchar,
  date,
  numeric,
} from "drizzle-orm/pg-core";

const transactionsTable = pgTable("transactions", {
  internal_id: bigserial({ mode: "number" }).primaryKey(),
  id: uuid("id").defaultRandom().notNull().unique(),
  description: varchar("description", { length: 50 }).notNull(),
  date: date("date").notNull(),
  amount: numeric("amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
});

export { transactionsTable };
