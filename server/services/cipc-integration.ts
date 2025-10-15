import { spawn } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';

export class CIPCIntegrationService {
  private pythonPath: string;
  private scriptPath: string;

  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python';
    this.scriptPath = './automation/cipc_runner.py';
  }

  async fileAnnualReturn(clientData: any): Promise<any> {
    try {
      const result = await this.executePythonScript('annual_return', JSON.stringify(clientData));
      logger.info({ result }, 'Annual return filed successfully');
      return result;
    } catch (error) {
      logger.error({ error, clientData }, 'Failed to file annual return');
      throw error;
    }
  }

  async fileBeneficialOwnership(clientData: any): Promise<any> {
    try {
      const result = await this.executePythonScript('beneficial_ownership', JSON.stringify(clientData));
      logger.info({ result }, 'Beneficial ownership filed successfully');
      return result;
    } catch (error) {
      logger.error({ error, clientData }, 'Failed to file beneficial ownership');
      throw error;
    }
  }

  async checkComplianceStatus(registrationNumber: string): Promise<any> {
    try {
      const result = await this.executePythonScript('check_compliance', registrationNumber);
      logger.info({ result }, 'Compliance status checked');
      return result;
    } catch (error) {
      logger.error({ error, registrationNumber }, 'Failed to check compliance status');
      throw error;
    }
  }

  private async executePythonScript(command: string, ...args: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [this.scriptPath, command, ...args]);
      
      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse Python output: ${stdout}`));
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }

  async validateCompanyData(clientData: any): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!clientData.registration_number) {
      errors.push('Company registration number is required');
    } else if (!/^\d{4}\/\d{6}\/\d{2}$/.test(clientData.registration_number)) {
      errors.push('Invalid registration number format (should be YYYY/NNNNNN/NN)');
    }

    if (!clientData.company_name) {
      errors.push('Company name is required');
    }

    if (clientData.service_type === 'annual_return') {
      if (!clientData.financial_year_end) {
        errors.push('Financial year end is required for annual returns');
      }
      if (clientData.annual_turnover === undefined) {
        errors.push('Annual turnover is required for annual returns');
      }
    }

    if (clientData.service_type === 'beneficial_ownership') {
      if (!clientData.beneficial_owners || clientData.beneficial_owners.length === 0) {
        errors.push('At least one beneficial owner is required');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const cipcIntegration = new CIPCIntegrationService();