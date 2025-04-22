import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertDepartmentSchema, insertSubprocessSchema, insertDocumentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Check if user is admin middleware
  const isAdmin = (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "No autorizado" });
    }
    next();
  };

  // Department routes
  app.get("/api/departments", async (req, res, next) => {
    try {
      const departments = await storage.getAllDepartments();
      res.json(departments);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/departments/:id", async (req, res, next) => {
    try {
      const department = await storage.getDepartment(Number(req.params.id));
      if (!department) {
        return res.status(404).json({ message: "Departamento no encontrado" });
      }
      res.json(department);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/departments", isAdmin, async (req, res, next) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (err) {
      next(err);
    }
  });

  app.put("/api/departments/:id", isAdmin, async (req, res, next) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.updateDepartment(Number(req.params.id), validatedData);
      if (!department) {
        return res.status(404).json({ message: "Departamento no encontrado" });
      }
      res.json(department);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/departments/:id", isAdmin, async (req, res, next) => {
    try {
      const success = await storage.deleteDepartment(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Departamento no encontrado" });
      }
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // Subprocess routes
  app.get("/api/subprocesses", async (req, res, next) => {
    try {
      if (req.query.departmentId) {
        const subprocesses = await storage.getSubprocessesByDepartment(Number(req.query.departmentId));
        return res.json(subprocesses);
      }
      const subprocesses = await storage.getAllSubprocesses();
      res.json(subprocesses);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/subprocesses/:id", async (req, res, next) => {
    try {
      const subprocess = await storage.getSubprocess(Number(req.params.id));
      if (!subprocess) {
        return res.status(404).json({ message: "Subproceso no encontrado" });
      }
      res.json(subprocess);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/subprocesses", isAdmin, async (req, res, next) => {
    try {
      const validatedData = insertSubprocessSchema.parse(req.body);
      const subprocess = await storage.createSubprocess(validatedData);
      res.status(201).json(subprocess);
    } catch (err) {
      next(err);
    }
  });

  app.put("/api/subprocesses/:id", isAdmin, async (req, res, next) => {
    try {
      const validatedData = insertSubprocessSchema.parse(req.body);
      const subprocess = await storage.updateSubprocess(Number(req.params.id), validatedData);
      if (!subprocess) {
        return res.status(404).json({ message: "Subproceso no encontrado" });
      }
      res.json(subprocess);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/subprocesses/:id", isAdmin, async (req, res, next) => {
    try {
      const success = await storage.deleteSubprocess(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Subproceso no encontrado" });
      }
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res, next) => {
    try {
      if (req.query.subprocessId) {
        const documents = await storage.getDocumentsBySubprocess(
          Number(req.query.subprocessId),
          req.query.type as string | undefined
        );
        return res.json(documents);
      }
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/documents/:id", async (req, res, next) => {
    try {
      const document = await storage.getDocument(Number(req.params.id));
      if (!document) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      res.json(document);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/documents", isAdmin, async (req, res, next) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (err) {
      next(err);
    }
  });

  app.put("/api/documents/:id", isAdmin, async (req, res, next) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.updateDocument(Number(req.params.id), validatedData);
      if (!document) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      res.json(document);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/documents/:id", isAdmin, async (req, res, next) => {
    try {
      const success = await storage.deleteDocument(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Documento no encontrado" });
      }
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // Config routes
  app.get("/api/config/:key", async (req, res, next) => {
    try {
      const value = await storage.getConfig(req.params.key);
      if (!value) {
        return res.status(404).json({ message: "Configuración no encontrada" });
      }
      res.json({ key: req.params.key, value });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/config", isAdmin, async (req, res, next) => {
    try {
      const { key, value } = req.body;
      if (!key || !value) {
        return res.status(400).json({ message: "Se requieren clave y valor" });
      }
      await storage.setConfig(key, value);
      res.status(201).json({ key, value });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // User management routes
  app.get("/api/users", isAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });

  app.post("/api/users", isAdmin, async (req, res, next) => {
    try {
      const user = await storage.createUser({
        username: req.body.username,
        password: await hashPassword(req.body.password),
        departmentId: req.body.departmentId,
        iframeUrl: req.body.iframeUrl,
        iframeTitle: req.body.iframeTitle,
      });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Error al crear usuario" });
    }
  });


  const httpServer = createServer(app);
  return httpServer;
}