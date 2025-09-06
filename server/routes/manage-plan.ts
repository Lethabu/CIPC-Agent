import express from 'express';
import { db } from '../src/db/index.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import SubscriptionService from '../services/subscriptionService.js';

const router = express.Router();
const subscriptionService = new SubscriptionService();

// Serve plan management page
router.get('/manage-plan', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).send('Invalid access link');
  }

  try {
    const decoded = JSON.parse(Buffer.from(token as string, 'base64').toString());
    
    if (decoded.expires < Date.now()) {
      return res.status(400).send('Link expired');
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      return res.status(404).send('User not found');
    }

    const subscriptionStatus = await subscriptionService.getSubscriptionStatus(decoded.userId);
    const upgradeEligibility = await subscriptionService.checkUpgradeEligibility(decoded.userId);
    const tiers = subscriptionService.getTiers();

    const html = generatePlanManagementHTML(user, subscriptionStatus, upgradeEligibility, tiers);
    res.send(html);
  } catch (error) {
    res.status(400).send('Invalid token');
  }
});

// Handle plan upgrade
router.post('/upgrade', async (req, res) => {
  try {
    const { userId, tierId } = req.body;
    
    const result = await subscriptionService.createSubscription(userId, tierId);
    
    if (result.success) {
      res.json({
        success: true,
        paymentUrl: result.paymentUrl
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Upgrade failed'
    });
  }
});

function generatePlanManagementHTML(user: any, status: any, eligibility: any, tiers: any[]): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Your CIPC Agent Plan</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto py-8 px-4">
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">Manage Your Plan</h1>
            
            <!-- Current Plan -->
            <div class="mb-8">
                <h2 class="text-lg font-semibold mb-4">Current Plan</h2>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="font-medium text-blue-900">${status.tier.toUpperCase()}</h3>
                            <p class="text-blue-700">Status: ${status.status}</p>
                            <p class="text-sm text-blue-600">Monthly filings used: ${status.usage.monthlyFilings}</p>
                        </div>
                        ${status.nextBilling ? `<div class="text-right">
                            <p class="text-sm text-blue-600">Next billing:</p>
                            <p class="font-medium">${new Date(status.nextBilling).toLocaleDateString()}</p>
                        </div>` : ''}
                    </div>
                </div>
            </div>

            <!-- Upgrade Recommendation -->
            ${eligibility.eligible ? `
            <div class="mb-8">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 class="font-medium text-green-900 mb-2">💡 Upgrade Recommended</h3>
                    <p class="text-green-700 mb-3">${eligibility.reason}</p>
                    ${eligibility.savings ? `<p class="text-sm text-green-600">Potential monthly savings: R${eligibility.savings}</p>` : ''}
                </div>
            </div>
            ` : ''}

            <!-- Available Plans -->
            <div class="mb-8">
                <h2 class="text-lg font-semibold mb-4">Available Plans</h2>
                <div class="grid md:grid-cols-2 gap-6">
                    ${tiers.map(tier => `
                    <div class="border rounded-lg p-6 ${status.tier === tier.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
                        <h3 class="text-xl font-bold mb-2">${tier.name}</h3>
                        <p class="text-3xl font-bold text-blue-600 mb-4">R${(tier.price / 100).toFixed(0)}<span class="text-sm text-gray-500">/month</span></p>
                        
                        <ul class="space-y-2 mb-6">
                            ${tier.features.map(feature => `<li class="flex items-center text-sm">
                                <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                </svg>
                                ${feature}
                            </li>`).join('')}
                        </ul>
                        
                        ${status.tier !== tier.id ? `
                        <button onclick="upgradeToPlan('${user.id}', '${tier.id}')" 
                                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Upgrade to ${tier.name}
                        </button>
                        ` : `
                        <div class="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg text-center">
                            Current Plan
                        </div>
                        `}
                    </div>
                    `).join('')}
                </div>
            </div>

            <!-- Usage Stats -->
            <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="font-medium mb-2">This Month's Usage</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-600">Filings Completed</p>
                        <p class="font-bold text-lg">${status.usage.monthlyFilings}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Total Spent</p>
                        <p class="font-bold text-lg">R${parseFloat(user.totalSpent || '0').toFixed(0)}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        async function upgradeToPlan(userId, tierId) {
            try {
                const response = await fetch('/api/manage-plan/upgrade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId, tierId })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    window.location.href = result.paymentUrl;
                } else {
                    alert('Upgrade failed: ' + result.error);
                }
            } catch (error) {
                alert('Upgrade failed. Please try again.');
            }
        }
    </script>
</body>
</html>
  `;
}

export default router;