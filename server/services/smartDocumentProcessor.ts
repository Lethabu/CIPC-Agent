import { OpenAI } from 'openai';
import { DocumentProcessor, ProcessedDocument } from './documentProcessor.js';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SmartProcessedDocument extends ProcessedDocument {
  confidence: number;
  validationErrors: string[];
  cipcCompliance: {
    isCompliant: boolean;
    missingFields: string[];
    recommendations: string[];
  };
  aiExtractedData: any;
}

export class SmartDocumentProcessor extends DocumentProcessor {
  
  static async processDocumentWithAI(file: Express.Multer.File, documentType: string): Promise<SmartProcessedDocument> {
    try {
      // First process with base processor
      const baseResult = await super.processDocument(file, documentType);
      
      // Enhanced AI processing
      const aiExtraction = await this.extractWithAI(file, documentType);
      const validation = await this.validateDocument(aiExtraction, documentType);
      const compliance = await this.checkCipcCompliance(aiExtraction, documentType);
      
      return {
        ...baseResult,
        confidence: aiExtraction.confidence,
        validationErrors: validation.errors,
        cipcCompliance: compliance,
        aiExtractedData: aiExtraction.data
      };
    } catch (error) {
      throw new Error(`Smart processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async extractWithAI(file: Express.Multer.File, documentType: string): Promise<{ data: any; confidence: number }> {
    const fileBuffer = fs.readFileSync(file.path);
    const base64 = fileBuffer.toString('base64');
    
    const prompt = this.getExtractionPrompt(documentType);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${file.mimetype};base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        data: result.data || {},
        confidence: result.confidence || 0.8
      };
    } catch (error) {
      return {
        data: {},
        confidence: 0.5
      };
    }
  }

  private static getExtractionPrompt(documentType: string): string {
    const prompts = {
      id_document: `Extract from this ID document and return JSON: {"data": {"firstName": "", "lastName": "", "idNumber": "", "dateOfBirth": ""}, "confidence": 0.95}`,
      financials: `Extract financial data and return JSON: {"data": {"revenue": 0, "expenses": 0, "profit": 0, "year": 2024}, "confidence": 0.90}`,
      utility_bill: `Extract address info and return JSON: {"data": {"address": "", "accountHolder": "", "date": ""}, "confidence": 0.85}`,
      bank_statement: `Extract banking details and return JSON: {"data": {"accountNumber": "", "balance": 0, "transactions": []}, "confidence": 0.90}`,
      default: `Extract key information and return JSON: {"data": {}, "confidence": 0.70}`
    };
    
    return prompts[documentType as keyof typeof prompts] || prompts.default;
  }

  private static async validateDocument(data: any, documentType: string): Promise<{ errors: string[] }> {
    const errors: string[] = [];
    
    switch (documentType) {
      case 'id_document':
        if (!data.idNumber || !/^\d{13}$/.test(data.idNumber)) {
          errors.push('Invalid ID number format');
        }
        if (!data.firstName || !data.lastName) {
          errors.push('Missing name information');
        }
        break;
        
      case 'financials':
        if (!data.revenue || data.revenue < 0) {
          errors.push('Invalid revenue amount');
        }
        if (!data.year || data.year < 2020) {
          errors.push('Invalid financial year');
        }
        break;
    }
    
    return { errors };
  }

  private static async checkCipcCompliance(data: any, documentType: string): Promise<{
    isCompliant: boolean;
    missingFields: string[];
    recommendations: string[];
  }> {
    const compliance = {
      isCompliant: true,
      missingFields: [] as string[],
      recommendations: [] as string[]
    };

    const requiredFields = {
      id_document: ['firstName', 'lastName', 'idNumber'],
      financials: ['revenue', 'expenses', 'year'],
      utility_bill: ['address', 'accountHolder'],
      bank_statement: ['accountNumber', 'balance']
    };

    const required = requiredFields[documentType as keyof typeof requiredFields] || [];
    
    for (const field of required) {
      if (!data[field]) {
        compliance.missingFields.push(field);
        compliance.isCompliant = false;
      }
    }

    if (!compliance.isCompliant) {
      compliance.recommendations.push('Ensure all required fields are clearly visible in the document');
      compliance.recommendations.push('Consider providing a higher quality scan or photo');
    }

    return compliance;
  }
}