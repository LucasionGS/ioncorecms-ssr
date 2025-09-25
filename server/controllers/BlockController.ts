import { Router, Request, Response } from "express";
import AuthController from "./AuthController.ts";
import BlockRegistry from "../core/BlockRegistry.ts";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
  };
}

namespace BlockController {
  export const router = Router();

  // Get all available block types and their configurations
  router.get('/types', AuthController.authenticateToken, (_req: AuthenticatedRequest, res: Response) => {
    try {
      const blockDefinitions = BlockRegistry.getAllBlockDefinitions();
      
      // Remove the component property from the definitions since it's not serializable
      const serializedDefinitions = blockDefinitions.map(({ ...definition }) => definition);
      
      res.json({
        success: true,
        data: serializedDefinitions
      });
    } catch (error) {
      console.error('Error fetching block types:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch block types'
      });
    }
  });

  // Get a specific block type configuration
  router.get('/types/:type', AuthController.authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type } = req.params;
      
      if (!BlockRegistry.isBlockRegistered(type)) {
        return res.status(404).json({
          success: false,
          message: `Block type '${type}' not found`
        });
      }

      const blockDefinition = BlockRegistry.getBlockDefinition(type);
      if (!blockDefinition) {
        return res.status(404).json({
          success: false,
          message: `Block type '${type}' not found`
        });
      }

      // Remove the component property since it's not serializable
      const { ...serializedDefinition } = blockDefinition;
      
      res.json({
        success: true,
        data: serializedDefinition
      });
    } catch (error) {
      console.error('Error fetching block type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch block type'
      });
    }
  });

  // Get fields for a specific block type
  router.get('/types/:type/fields', AuthController.authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { type } = req.params;
      
      if (!BlockRegistry.isBlockRegistered(type)) {
        return res.status(404).json({
          success: false,
          message: `Block type '${type}' not found`
        });
      }

      const fields = BlockRegistry.getBlockFields(type);
      
      res.json({
        success: true,
        data: fields
      });
    } catch (error) {
      console.error('Error fetching block fields:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch block fields'
      });
    }
  });
}

export default BlockController;