import { Router } from "express";
import UpgradeController from "./UpgradeController.ts";
import AuthController from "./AuthController.ts";
import AdminController from "./AdminController.ts";
import MonitoringController from "./MonitoringController.ts";
import ErrorLoggingController from "./ErrorLoggingController.ts";
import NodeController from "./NodeController.ts";
import NodeBuilderController from "./NodeBuilderController.ts";
import BlockController from "./BlockController.ts";
import FileController from "./FileController.ts";

namespace ApiController {
  export const router = Router();
  
  router.get("/", (_req, res) => {
    res.json({ message: "Hello from the API!" });
  });

  router.use("/upgrade", UpgradeController.router);
  router.use("/auth", AuthController.router);
  router.use("/admin", AdminController.router);
  router.use("/monitoring", MonitoringController.router);
  router.use("/errors", ErrorLoggingController.router);
  router.use("/nodes", NodeController.router);
  router.use("/node-builder", NodeBuilderController.router);
  router.use("/blocks", BlockController.router);
  router.use("/files", FileController.router);
}

export default ApiController;