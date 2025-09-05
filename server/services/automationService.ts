import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '../src/db/index.js';
import { paygTransactions } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const execAsync = promisify(exec);

export class AutomationService {
  private canaryRolloutPercentage = 10; // Start with 10% automation

  async shouldUseAutomation(transactionId: string): Promise<boolean> {
    // Canary rollout logic
    const hash = this.hashString(transactionId);
    return (hash % 100) < this.canaryRolloutPercentage;
  }

  async executeAutomatedFiling(transactionId: string, serviceType: string, clientData: any) {
    console.log(`🤖 Starting automated filing: ${serviceType} for transaction ${transactionId}`);
    
    try {
      // Prepare client data
      const filingData = JSON.stringify(clientData);
      
      // Execute Python CIPC Runner
      const command = `cd automation && python3 cipc_runner.py ${serviceType} '${filingData}'`;
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.error('CIPC Runner stderr:', stderr);
      }
      
      // Parse result
      const result = JSON.parse(stdout);
      
      if (result.status === 'success') {
        // Update transaction with reference number
        await db.update(paygTransactions)
          .set({ 
            status: 'completed',
            paymentReference: result.reference_number,
            completedAt: new Date()
          })
          .where(eq(paygTransactions.id, transactionId));
        
        console.log(`✅ Automated filing successful: ${result.reference_number}`);
        return result;
      } else {
        console.error(`❌ Automated filing failed: ${result.error}`);
        // Fall back to manual processing
        await this.alertOperationsTeam(transactionId, result.error);
        return result;
      }
      
    } catch (error) {
      console.error('Automation execution error:', error);
      await this.alertOperationsTeam(transactionId, error.message);
      return {
        status: 'failed',
        error: error.message
      };
    }
  }

  async processFilingTransaction(transactionId: string) {
    // Get transaction details
    const transaction = await db.select()
      .from(paygTransactions)
      .where(eq(paygTransactions.id, transactionId))
      .limit(1);
    
    if (transaction.length === 0) {
      throw new Error('Transaction not found');
    }
    
    const tx = transaction[0];
    
    // Check if should use automation
    const useAutomation = await this.shouldUseAutomation(transactionId);
    
    if (useAutomation) {
      console.log(`🤖 Using automation for transaction ${transactionId}`);
      
      // Prepare client data from transaction
      const clientData = {
        company_name: tx.filingData?.company_name || 'Unknown Company',
        reg_number: tx.filingData?.reg_number || '',
        service_type: tx.serviceType,
        ...tx.filingData
      };
      
      return await this.executeAutomatedFiling(transactionId, tx.serviceType, clientData);
    } else {
      console.log(`👤 Using manual processing for transaction ${transactionId}`);
      return await this.queueForManualProcessing(transactionId);
    }
  }

  private async queueForManualProcessing(transactionId: string) {
    // Add to manual processing queue
    console.log(`📋 Queued for manual processing: ${transactionId}`);
    
    return {
      status: 'queued_manual',
      message: 'Queued for manual processing by operations team'
    };
  }

  private async alertOperationsTeam(transactionId: string, error: string) {
    // Send alert to operations team
    console.log(`🚨 ALERT: Automation failed for ${transactionId}: ${error}`);
    
    // In production, send to Slack/email/dashboard
    // For now, just log
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Gradually increase automation percentage
  async updateCanaryRollout(percentage: number) {
    if (percentage >= 0 && percentage <= 100) {
      this.canaryRolloutPercentage = percentage;
      console.log(`🎯 Updated canary rollout to ${percentage}%`);
    }
  }

  // Get automation statistics
  async getAutomationStats() {
    // In production, query actual database for stats
    return {
      canaryPercentage: this.canaryRolloutPercentage,
      totalAutomated: 0,
      successRate: 0,
      avgProcessingTime: '0s'
    };
  }
}