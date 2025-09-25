import { Router, Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs/promises";
import process from "node:process";
import File from "../database/models/system/File.ts";
import AuthController from "./AuthController.ts";
import User from "../database/models/system/User.ts";

interface AuthenticatedRequest extends Request {
  user?: User;
}

namespace FileController {
  export const router = Router();

  // Get upload path from environment
  const uploadPath = process.env.FILE_STORAGE_PATH || '/tmp/uploads';

  // Ensure upload directory exists
  async function ensureUploadDir() {
    try {
      await fs.mkdir(uploadPath, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
      await ensureUploadDir();
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, `${name}_${uniqueSuffix}${ext}`);
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 128 * 1024 * 1024, // 128MB limit
    },
    fileFilter: (_req, file, cb) => {
      // Allow images, documents, and other common file types
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`));
      }
    }
  });

  // Upload single file
  router.post('/upload', AuthController.authenticateToken, upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Get file stats
      const stats = await fs.stat(req.file.path);
      
      // Save file record to database
      const fileRecord = await File.create({
        filename: req.file.originalname,
        path: req.file.path,
        size: stats.size,
        mimeType: req.file.mimetype
      });

      res.json({
        success: true,
        data: {
          id: fileRecord.id,
          filename: fileRecord.filename,
          size: fileRecord.size,
          mimeType: fileRecord.mimeType,
          url: `/api/files/${fileRecord.id}`,
          createdAt: fileRecord.createdAt
        },
        message: 'File uploaded successfully'
      });

    } catch (error) {
      console.error('File upload error:', error);
      
      // Clean up file if database save failed
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get file by ID (serves the actual file)
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file ID'
        });
      }

      const fileRecord = await File.findByPk(fileId);
      if (!fileRecord) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Check if file exists on disk
      try {
        await fs.access(fileRecord.path);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'File not found on disk'
        });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', fileRecord.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${fileRecord.filename}"`);
      
      // Stream file to response
      res.sendFile(path.resolve(fileRecord.path));

    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({
        success: false,
        message: 'Error serving file'
      });
    }
  });

  // Get file metadata by ID
  router.get('/:id/info', async (req: Request, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file ID'
        });
      }

      const fileRecord = await File.findByPk(fileId);
      if (!fileRecord) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: fileRecord.id,
          filename: fileRecord.filename,
          size: fileRecord.size,
          mimeType: fileRecord.mimeType,
          url: `/api/files/${fileRecord.id}`,
          createdAt: fileRecord.createdAt,
          updatedAt: fileRecord.updatedAt
        }
      });

    } catch (error) {
      console.error('Error getting file info:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting file info'
      });
    }
  });

  // List all files (with pagination)
  router.get('/', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = (page - 1) * limit;

      const { count, rows } = await File.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'filename', 'size', 'mimeType', 'createdAt', 'updatedAt']
      });

      const files = rows.map(file => ({
        ...file.toJSON(),
        url: `/api/files/${file.id}`
      }));

      res.json({
        success: true,
        data: {
          files,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error listing files:', error);
      res.status(500).json({
        success: false,
        message: 'Error listing files'
      });
    }
  });

  // Delete file
  router.delete('/:id', AuthController.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      if (isNaN(fileId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file ID'
        });
      }

      const fileRecord = await File.findByPk(fileId);
      if (!fileRecord) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Delete file from disk
      try {
        await fs.unlink(fileRecord.path);
      } catch (error) {
        console.warn('File not found on disk, continuing with database deletion:', error);
      }

      // Delete from database
      await fileRecord.destroy();

      res.json({
        success: true,
        message: 'File deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting file'
      });
    }
  });
}

export default FileController;