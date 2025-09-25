import { Router } from "express";
import NodeRegistry from "../core/NodeRegistry.ts";

namespace NodeController {
  export const router = Router();
  
  router.get("/", (_req, res) => {
    const pages = NodeRegistry.getRegisteredTypes();
    res.json({
      success: true,
      data: pages
    });
  });

  // New endpoint for subpath-based node routing
  router.get("/resolve/*splat", async (req, res) => {
    try {
      const pathSegments: string[] = (req.params as Record<string, string[]>).splat || [];
      
      if (pathSegments.length < 1) {
        return res.status(404).json({ success: false, message: "Invalid path" });
      }

      // Try to find a node type that matches the path structure
      const registeredTypes = NodeRegistry.getAllTypeInfos();
      let foundNode = null;
      let matchedNodeType = null;

      // Check each registered node type
      for (const nodeTypeInfo of registeredTypes) {
        const subpath = nodeTypeInfo.settings?.subpath;
        
        if (subpath) {
          // For nodes with subpath, expect: /subpath/slug
          if (pathSegments.length >= 2 && pathSegments.slice(0, -1).join("/") === subpath) {
            const slug = pathSegments.slice(-1)[0]
            foundNode = await findNodeBySlug(nodeTypeInfo.type, slug);
            if (foundNode) {
              matchedNodeType = nodeTypeInfo.type;
              break;
            }
          }
        } else {
          // For nodes without subpath, try direct slug matching
          const slug = pathSegments.join('/'); // Use full path as slug
          foundNode = await findNodeBySlug(nodeTypeInfo.type, slug);
          if (foundNode) {
            matchedNodeType = nodeTypeInfo.type;
            break;
          }
        }
      }

      if (!foundNode) {
        return res.status(404).json({ success: false, message: "Node not found" });
      }

      res.json({
        success: true,
        data: {
          node: foundNode,
          nodeType: matchedNodeType
        }
      });
    } catch (error) {
      console.error('Error in node resolution:', error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  router.get("/:nodeType", async (req, res) => {
    const Node = NodeRegistry.getModelByType(req.params.nodeType);
    if (!Node) {
      return res.status(404).json({ success: false, message: "Node type not found" });
    }

    res.json({
      success: true,
      data: await Node.findAll()
    });
  });

  router.get("/:nodeType/:id", async (req, res) => {
    const Node = NodeRegistry.getModelByType(req.params.nodeType);
    if (!Node) {
      return res.status(404).json({ success: false, message: "Node type not found" });
    }

    let nodeInstance = await Node.findByPk(req.params.id);
    if (!nodeInstance) {
      // Check for slug field if it exists
      const slugField = NodeRegistry.getSlugField(req.params.nodeType);
      if (slugField) {
        const whereClause = { [slugField.name]: req.params.id };
        nodeInstance = await Node.findOne({ where: whereClause });
      }
      
      if (!nodeInstance) {
        return res.status(404).json({ success: false, message: "Node instance not found" });
      }
    }

    // await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay for demo purposes
    
    res.json({
      success: true,
      data: nodeInstance
    });
  });

  router.get("/:nodeType/:id/url", async (req, res) => {
    const Node = NodeRegistry.getModelByType(req.params.nodeType);
    if (!Node) {
      return res.status(404).json({ success: false, message: "Node type not found" });
    }

    let nodeInstance = await Node.findByPk(req.params.id);
    if (!nodeInstance) {
      // Check for slug field if it exists
      const slugField = NodeRegistry.getSlugField(req.params.nodeType);
      if (slugField) {
        const whereClause = { [slugField.name]: req.params.id };
        nodeInstance = await Node.findOne({ where: whereClause });
      }
      
      if (!nodeInstance) {
        return res.status(404).json({ success: false, message: "Node instance not found" });
      }
    }

    const nodeUrl = NodeRegistry.generateNodeUrl(req.params.nodeType, nodeInstance);
    if (!nodeUrl) {
      return res.status(500).json({ success: false, message: "Failed to generate node URL" });
    }

    res.json({
      success: true,
      data: { url: nodeUrl }
    });
  });
}

// Helper function to find node by slug
async function findNodeBySlug(nodeType: string, slug: string) {
  const Node = NodeRegistry.getModelByType(nodeType);
  if (!Node) return null;

  // Try by ID first
  if (/^\d+$/.test(slug)) {
    const nodeById = await Node.findByPk(parseInt(slug));
    if (nodeById) return nodeById;
  }

  // Then try by slug field
  const slugField = NodeRegistry.getSlugField(nodeType);
  if (slugField) {
    const whereClause = { [slugField.name]: slug };
    return await Node.findOne({ where: whereClause });
  }

  return null;
}

export default NodeController;