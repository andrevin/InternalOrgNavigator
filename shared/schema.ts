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
  departmentId: integer("department_id").references(() => departments.id, { onDelete: 'set null' }),
  macroprocessId: integer("macroprocess_id").references(() => macroprocesses.id, { onDelete: 'set null' }),
  iframeUrl: text("iframe_url"),
  iframeTitle: text("iframe_title").default("Panel de Usuario"),
});

export const usersRelations = relations(users, ({ one }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  macroprocess: one(macroprocesses, {
    fields: [users.macroprocessId],
    references: [macroprocesses.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Macroprocess model
export const macroprocesses = pgTable("macroprocesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'Estratégicos', 'Operativos', 'Apoyo'
});



export const macroprocessesRelations = relations(macroprocesses, ({ many }) => ({
  subprocesses: many(subprocesses),
}));

export const insertMacroprocessSchema = createInsertSchema(macroprocesses).pick({
  name: true,
  category: true,
});

// Department model (organizational units)
export const departments = pgTable("org_departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  users: many(users),
}));

export const insertDepartmentSchema = createInsertSchema(departments).pick({
  name: true,
  description: true,
});

// Subprocess model
export const subprocesses = pgTable("subprocesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  macroprocessId: integer("macroprocess_id").notNull().references(() => macroprocesses.id, { onDelete: 'cascade' }),
});

export const subprocessesRelations = relations(subprocesses, ({ one, many }) => ({
  macroprocess: one(macroprocesses, {
    fields: [subprocesses.macroprocessId],
    references: [macroprocesses.id],
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

export type Macroprocess = typeof macroprocesses.$inferSelect;

