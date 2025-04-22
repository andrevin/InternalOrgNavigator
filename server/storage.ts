import { users, type User, type InsertUser } from "@shared/schema";
import { departments, type Department, type InsertDepartment } from "@shared/schema";
import { subprocesses, type Subprocess, type InsertSubprocess } from "@shared/schema";
import { documents, type Document, type InsertDocument } from "@shared/schema";
import { configs, type Config, type InsertConfig } from "@shared/schema";
import { db, pool } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Department operations
  getAllDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: InsertDepartment): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<boolean>;
  
  // Subprocess operations
  getAllSubprocesses(): Promise<Subprocess[]>;
  getSubprocessesByDepartment(departmentId: number): Promise<Subprocess[]>;
  getSubprocess(id: number): Promise<Subprocess | undefined>;
  createSubprocess(subprocess: InsertSubprocess): Promise<Subprocess>;
  updateSubprocess(id: number, subprocess: InsertSubprocess): Promise<Subprocess | undefined>;
  deleteSubprocess(id: number): Promise<boolean>;
  
  // Document operations
  getAllDocuments(): Promise<Document[]>;
  getDocumentsBySubprocess(subprocessId: number, type?: string): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: InsertDocument): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Config operations
  getConfig(key: string): Promise<string | undefined>;
  setConfig(key: string, value: string): Promise<void>;
  
  // Session store
  sessionStore: any; // Store from express-session
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Department operations
  async getAllDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db.insert(departments).values(department).returning();
    return newDepartment;
  }

  async updateDepartment(id: number, department: InsertDepartment): Promise<Department | undefined> {
    const [updatedDepartment] = await db
      .update(departments)
      .set(department)
      .where(eq(departments.id, id))
      .returning();
    return updatedDepartment;
  }

  async deleteDepartment(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(departments)
      .where(eq(departments.id, id))
      .returning();
    return !!deleted;
  }

  // Subprocess operations
  async getAllSubprocesses(): Promise<Subprocess[]> {
    return await db.select().from(subprocesses);
  }

  async getSubprocessesByDepartment(departmentId: number): Promise<Subprocess[]> {
    return await db
      .select()
      .from(subprocesses)
      .where(eq(subprocesses.departmentId, departmentId));
  }

  async getSubprocess(id: number): Promise<Subprocess | undefined> {
    const [subprocess] = await db.select().from(subprocesses).where(eq(subprocesses.id, id));
    return subprocess;
  }

  async createSubprocess(subprocess: InsertSubprocess): Promise<Subprocess> {
    const [newSubprocess] = await db.insert(subprocesses).values(subprocess).returning();
    return newSubprocess;
  }

  async updateSubprocess(id: number, subprocess: InsertSubprocess): Promise<Subprocess | undefined> {
    const [updatedSubprocess] = await db
      .update(subprocesses)
      .set(subprocess)
      .where(eq(subprocesses.id, id))
      .returning();
    return updatedSubprocess;
  }

  async deleteSubprocess(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(subprocesses)
      .where(eq(subprocesses.id, id))
      .returning();
    return !!deleted;
  }

  // Document operations
  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocumentsBySubprocess(subprocessId: number, type?: string): Promise<Document[]> {
    if (type) {
      return await db
        .select()
        .from(documents)
        .where(and(eq(documents.subprocessId, subprocessId), eq(documents.type, type)));
    }
    return await db
      .select()
      .from(documents)
      .where(eq(documents.subprocessId, subprocessId));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, document: InsertDocument): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set(document)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();
    return !!deleted;
  }

  // Config operations
  async getConfig(key: string): Promise<string | undefined> {
    const [config] = await db.select().from(configs).where(eq(configs.key, key));
    return config?.value;
  }

  async setConfig(key: string, value: string): Promise<void> {
    const existingConfig = await db.select().from(configs).where(eq(configs.key, key));
    
    if (existingConfig.length > 0) {
      await db.update(configs).set({ value }).where(eq(configs.key, key));
    } else {
      await db.insert(configs).values({ key, value });
    }
  }
}

export const storage = new DatabaseStorage();
