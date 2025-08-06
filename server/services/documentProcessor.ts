import multer, { type Request } from 'multer';
import path from 'path';
import fs from 'fs';
import type { Request as ExpressRequest } from 'express';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: ExpressRequest, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: ExpressRequest, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: ExpressRequest, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, JPG, PNG, DOC, DOCX'));
    }
  }
});

export interface ProcessedDocument {
  fileName: string;
  filePath: string;
  fileType: string;
  extractedData?: any;
  popiaCompliant: boolean;
}

export class DocumentProcessor {
  
  static async processDocument(file: Express.Multer.File, documentType: string): Promise<ProcessedDocument> {
    try {
      // Simulate OCR processing and data extraction
      const extractedData = await this.extractDataFromDocument(file, documentType);
      
      // Apply POPIA redaction
      const redactedData = this.applyPopiaRedaction(extractedData);
      
      return {
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        extractedData: redactedData,
        popiaCompliant: true
      };
    } catch (error) {
      throw new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async extractDataFromDocument(file: Express.Multer.File, documentType: string): Promise<any> {
    // Simulate OCR and data extraction based on document type
    switch (documentType.toLowerCase()) {
      case 'id_document':
        return {
          firstName: "John",
          lastName: "Doe",
          idNumber: "8501010001085",
          dateOfBirth: "1985-01-01"
        };
      
      case 'financials':
        return {
          revenue: 1500000,
          expenses: 1200000,
          profit: 300000,
          year: 2023
        };
      
      case 'utility_bill':
        return {
          address: "123 Business Street, Johannesburg",
          accountHolder: "ABC Company (Pty) Ltd",
          date: "2024-01-15"
        };
      
      default:
        return {
          documentType,
          processed: true,
          timestamp: new Date().toISOString()
        };
    }
  }

  private static applyPopiaRedaction(data: any): any {
    const redactedData = { ...data };
    
    // Redact ID numbers (keep last 2 digits only)
    if (redactedData.idNumber) {
      const idNum = redactedData.idNumber.toString();
      redactedData.idNumber = `****-****-**${idNum.slice(-2)}`;
    }
    
    // Redact full addresses (keep city only)
    if (redactedData.address) {
      const parts = redactedData.address.split(', ');
      redactedData.address = `[REDACTED], ${parts[parts.length - 1]}`;
    }
    
    // Mark as POPIA processed
    redactedData.popiaProcessed = true;
    redactedData.processedAt = new Date().toISOString();
    
    return redactedData;
  }

  static async deleteDocument(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }
}
