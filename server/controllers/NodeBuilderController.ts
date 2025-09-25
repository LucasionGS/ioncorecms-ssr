import { Router, Request, Response } from "express";
import { Op } from "sequelize";
import AuthController from "./AuthController.ts";
import NodeRegistry, { FieldDefinition } from "../core/NodeRegistry.ts";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    isAdmin: boolean;
    username: string;
  };
}

namespace NodeBuilderController {
  export const router = Router();

  // Get all registered node types and their field definitions
  router.get('/types', AuthController.authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const types = NodeRegistry.getAllTypeInfos().map(typeInfo => ({
        type: typeInfo.type,
        settings: typeInfo.settings,
        fields: typeInfo.fields
      }));

      res.json({
        success: true,
        data: types
      });

    } catch (error) {
      console.error('Error fetching node types:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get field definitions for a specific node type
  router.get('/types/:type/fields', AuthController.authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { type } = req.params;
      
      if (!NodeRegistry.isTypeRegistered(type)) {
        return res.status(404).json({
          success: false,
          message: `Node type '${type}' not found`
        });
      }

      const typeInfo = NodeRegistry.getTypeInfo(type);
      
      res.json({
        success: true,
        data: {
          type: typeInfo!.type,
          settings: typeInfo!.settings,
          fields: typeInfo!.fields
        }
      });

    } catch (error) {
      console.error(`Error fetching fields for type ${req.params.type}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get all nodes of a specific type
  router.get('/types/:type/nodes', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { type } = req.params;
      const { page = 1, limit = 20, search = '' } = req.query;
      
      if (!NodeRegistry.isTypeRegistered(type)) {
        return res.status(404).json({
          success: false,
          message: `Node type '${type}' not found`
        });
      }

      const Model = NodeRegistry.getModelByType(type);
      if (!Model) {
        return res.status(404).json({
          success: false,
          message: `Model for type '${type}' not found`
        });
      }

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause = search ? {
        // Simple search - you might want to make this more sophisticated
        title: {
          [Op.like]: `%${search}%`
        }
      } : {};

      const { count, rows } = await Model.findAndCountAll({
        where: whereClause,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          nodes: rows,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit))
          }
        }
      });

    } catch (error) {
      console.error(`Error fetching nodes for type ${req.params.type}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get a specific node by ID and type
  router.get('/types/:type/nodes/:id', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { type, id } = req.params;
      
      if (!NodeRegistry.isTypeRegistered(type)) {
        return res.status(404).json({
          success: false,
          message: `Node type '${type}' not found`
        });
      }

      const Model = NodeRegistry.getModelByType(type);
      if (!Model) {
        return res.status(404).json({
          success: false,
          message: `Model for type '${type}' not found`
        });
      }

      const node = await Model.findByPk(id);
      if (!node) {
        return res.status(404).json({
          success: false,
          message: 'Node not found'
        });
      }

      // Process the node data through field loaders
      const typeInfo = NodeRegistry.getTypeInfo(type);
      const processedData = await processNodeForDisplay(node, typeInfo!.fields || []);

      res.json({
        success: true,
        data: processedData
      });

    } catch (error) {
      console.error(`Error fetching node ${req.params.id} of type ${req.params.type}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Create a new node
  router.post('/types/:type/nodes', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { type } = req.params;
      const nodeData = req.body;
      
      if (!NodeRegistry.isTypeRegistered(type)) {
        return res.status(404).json({
          success: false,
          message: `Node type '${type}' not found`
        });
      }

      const Model = NodeRegistry.getModelByType(type);
      if (!Model) {
        return res.status(404).json({
          success: false,
          message: `Model for type '${type}' not found`
        });
      }

      const typeInfo = NodeRegistry.getTypeInfo(type);
      
      // Validate the data against field definitions
      const validationResult = await validateNodeData(nodeData, typeInfo!.fields || []);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.errors
        });
      }

      // Process the data through field savers
      const processedData = await processNodeForSave(nodeData, typeInfo!.fields || []);
      
      // Add author if the model supports it
      if ('authorId' in Model.rawAttributes) {
        processedData.authorId = req.user!.id;
      }

      const node = await Model.create(processedData);

      res.status(201).json({
        success: true,
        data: node,
        message: 'Node created successfully'
      });

    } catch (error) {
      console.error(`Error creating node of type ${req.params.type}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Update an existing node
  router.put('/types/:type/nodes/:id', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { type, id } = req.params;
      const nodeData = req.body;
      
      if (!NodeRegistry.isTypeRegistered(type)) {
        return res.status(404).json({
          success: false,
          message: `Node type '${type}' not found`
        });
      }

      const Model = NodeRegistry.getModelByType(type);
      if (!Model) {
        return res.status(404).json({
          success: false,
          message: `Model for type '${type}' not found`
        });
      }

      const node = await Model.findByPk(id);
      if (!node) {
        return res.status(404).json({
          success: false,
          message: 'Node not found'
        });
      }

      const typeInfo = NodeRegistry.getTypeInfo(type);
      
      // Validate the data against field definitions
      const validationResult = await validateNodeData(nodeData, typeInfo!.fields || []);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.errors
        });
      }

      // Process the data through field savers
      const processedData = await processNodeForSave(nodeData, typeInfo!.fields || [], node);

      await node.update(processedData);

      res.json({
        success: true,
        data: node,
        message: 'Node updated successfully'
      });

    } catch (error) {
      console.error(`Error updating node ${req.params.id} of type ${req.params.type}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Delete a node
  router.delete('/types/:type/nodes/:id', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { type, id } = req.params;
      
      if (!NodeRegistry.isTypeRegistered(type)) {
        return res.status(404).json({
          success: false,
          message: `Node type '${type}' not found`
        });
      }

      const Model = NodeRegistry.getModelByType(type);
      if (!Model) {
        return res.status(404).json({
          success: false,
          message: `Model for type '${type}' not found`
        });
      }

      const node = await Model.findByPk(id);
      if (!node) {
        return res.status(404).json({
          success: false,
          message: 'Node not found'
        });
      }

      await node.destroy();

      res.json({
        success: true,
        message: 'Node deleted successfully'
      });

    } catch (error) {
      console.error(`Error deleting node ${req.params.id} of type ${req.params.type}:`, error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });
}

// Helper function to validate node data against field definitions
async function validateNodeData(data: Record<string, unknown>, 
  // deno-lint-ignore no-explicit-any
  fields: Array<any>): Promise<{isValid: boolean, errors: string[]}> {
  const errors: string[] = [];

  for (const field of fields) {
    const fieldName = field.name as string;
    const fieldType = field.type as string;
    const validation = field.validation as Record<string, unknown> | undefined;
    const value = data[fieldName];

    // Check required fields
    if (validation?.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${fieldName}' is required`);
      continue;
    }

    // Skip validation if field is not required and empty
    if (!validation?.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type-specific validations
    switch (fieldType) {
      case 'text':
      case 'textarea':
      case 'email':
      case 'url':
      case 'slug':
        if (typeof value !== 'string') {
          errors.push(`Field '${fieldName}' must be a string`);
          break;
        }
        if (validation?.minLength && value.length < Number(validation.minLength)) {
          errors.push(`Field '${fieldName}' must be at least ${validation.minLength} characters long`);
        }
        if (validation?.maxLength && value.length > Number(validation.maxLength)) {
          errors.push(`Field '${fieldName}' must be no more than ${validation.maxLength} characters long`);
        }
        if (validation?.pattern && !new RegExp(validation.pattern as string).test(value)) {
          errors.push(`Field '${fieldName}' does not match the required pattern`);
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          errors.push(`Field '${fieldName}' must be a number`);
          break;
        }
        if (validation?.min && value < Number(validation.min)) {
          errors.push(`Field '${fieldName}' must be at least ${validation.min}`);
        }
        if (validation?.max && value > Number(validation.max)) {
          errors.push(`Field '${fieldName}' must be no more than ${validation.max}`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Field '${fieldName}' must be a boolean`);
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`Field '${fieldName}' must be an array`);
          break;
        }
        if (field.minItems && value.length < Number(field.minItems)) {
          errors.push(`Field '${fieldName}' must have at least ${field.minItems} items`);
        }
        if (field.maxItems && value.length > Number(field.maxItems)) {
          errors.push(`Field '${fieldName}' must have no more than ${field.maxItems} items`);
        }
        break;

      case 'node':
        if (field.multiple) {
          // Multiple node selection - should be an array of objects with id
          if (!Array.isArray(value)) {
            errors.push(`Field '${fieldName}' must be an array of nodes`);
            break;
          }
          for (let i = 0; i < value.length; i++) {
            const node = value[i];
            if (!node || typeof node !== 'object' || !('id' in node) || !('nodeType' in node)) {
              errors.push(`Field '${fieldName}' contains invalid node reference at position ${i + 1} (must have id and nodeType)`);
            }
          }
        } else {
          // Single node selection - should be an object with id and nodeType
          if (value !== null && value !== undefined) {
            if (typeof value !== 'object' || !('id' in value) || !('nodeType' in value)) {
              errors.push(`Field '${fieldName}' must be a valid node reference (must have id and nodeType)`);
            }
          }
        }
        break;
    }

    // Custom validation
    if (validation?.custom && typeof validation.custom === 'function') {
      try {
        const customResult = await validation.custom(value);
        if (customResult !== true) {
          errors.push(typeof customResult === 'string' ? customResult : `Field '${fieldName}' failed custom validation`);
        }
      } catch (error) {
        errors.push(`Field '${fieldName}' custom validation error: ${error}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to process node data for saving (run field save functions)
async function processNodeForSave(
  data: Record<string, unknown>, 
  // deno-lint-ignore no-explicit-any
  fields: Array<FieldDefinition<any>>,
  instance?: unknown
): Promise<Record<string, unknown>> {
  const processedData = { ...data };

  for (const field of fields) {
    const fieldName = field.name;
    const saveFunction = field.save;
    const value = data[fieldName];

    if (saveFunction && typeof saveFunction === 'function' && value !== undefined) {
      try {
        const savedValue = await saveFunction(instance || {}, value);
        if (savedValue !== undefined) {
          // If save function returns a value, it's meant to replace the field value
          processedData[fieldName] = savedValue;
        }
      } catch (error) {
        console.error(`Error in save function for field ${fieldName}:`, error);
        throw error;
      }
    }
  }

  return processedData;
}

// Helper function to process node data for display (run field load functions)
async function processNodeForDisplay(
  // deno-lint-ignore no-explicit-any
  instance: any, 
  // deno-lint-ignore no-explicit-any
  fields: Array<FieldDefinition<any>>
): Promise<Record<string, unknown>> {
  // Start with the raw instance data (converted to plain object if it's a Sequelize model)
  const processedData = instance.toJSON ? instance.toJSON() : { ...instance };

  // Process each field definition
  for (const field of fields) {
    const fieldName = field.name;
    const loadFunction = field.load;

    if (loadFunction && typeof loadFunction === 'function') {
      try {
        const loadedValue = await loadFunction(instance);
        if (loadedValue !== undefined) {
          processedData[fieldName] = loadedValue;
        }
      } catch (error) {
        console.error(`Error in load function for field ${fieldName}:`, error);
        // Don't throw here, just log the error and use the original value
      }
    } else {
      // For fields without custom load functions, ensure the field value is included
      if (instance[fieldName] !== undefined) {
        processedData[fieldName] = instance[fieldName];
      }
    }
  }

  return processedData;
}

export default NodeBuilderController;