import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Department model
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Estratégicos', 'Operativos', 'Apoyo'
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  subprocesses: many(subprocesses),
}));

export const insertDepartmentSchema = createInsertSchema(departments).pick({
  name: true,
  category: true,
});

// Subprocess model
export const subprocesses = pgTable("subprocesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  departmentId: integer("department_id").notNull().references(() => departments.id, { onDelete: 'cascade' }),
});

export const subprocessesRelations = relations(subprocesses, ({ one, many }) => ({
  department: one(departments, {
    fields: [subprocesses.departmentId],
    references: [departments.id],
  }),
  documents: many(documents),
}));

export const insertSubprocessSchema = createInsertSchema(subprocesses).pick({
  name: true,
  departmentId: true,
});

// Document model
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'Manuales', 'SOPs', 'Formatos'
  url: text("url").notNull(),
  subprocessId: integer("subprocess_id").notNull().references(() => subprocesses.id, { onDelete: 'cascade' }),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  subprocess: one(subprocesses, {
    fields: [documents.subprocessId],
    references: [subprocesses.id],
  }),
}));

export const insertDocumentSchema = createInsertSchema(documents).pick({
  name: true,
  type: true,
  url: true,
  subprocessId: true,
});

// Config model for iframe settings
export const configs = pgTable("configs", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertConfigSchema = createInsertSchema(configs).pick({
  key: true,
  value: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Subprocess = typeof subprocesses.$inferSelect;
export type InsertSubprocess = z.infer<typeof insertSubprocessSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Config = typeof configs.$inferSelect;
export type InsertConfig = z.infer<typeof insertConfigSchema>;
