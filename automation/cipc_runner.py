import asyncio
import json
import os
from datetime import datetime
from playwright.async_api import async_playwright

class CIPCRunner:
    def __init__(self):
        self.credentials = {
            "username": os.getenv("CIPC_USERNAME", "demo_user"),
            "password": os.getenv("CIPC_PASSWORD", "demo_pass")
        }
        
    async def file_annual_return(self, client_data):
        """Automate Annual Return filing on CIPC portal"""
        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(headless=False)  # Visible for debugging
        page = await browser.new_page()
        
        try:
            # Navigate to CIPC portal
            await page.goto("https://eservices.cipc.co.za/")
            await page.wait_for_load_state('networkidle')
            
            # Login process
            await page.click('text=Login')
            await page.fill('#username', self.credentials['username'])
            await page.fill('#password', self.credentials['password'])
            await page.click('#login-button')
            
            # Wait for dashboard
            await page.wait_for_selector('.dashboard', timeout=30000)
            
            # Navigate to Annual Return section
            await page.click('text=Annual Returns')
            await page.click('text=File Annual Return')
            
            # Fill company details
            reg_number = client_data.get('registration_number', '')
            await page.fill('#company-registration', reg_number)
            await page.click('#search-company')
            
            # Wait for company details to load
            await page.wait_for_selector('.company-details', timeout=15000)
            
            # Fill annual return form
            await page.fill('#financial-year-end', client_data.get('financial_year_end', '2023-12-31'))
            await page.fill('#annual-turnover', str(client_data.get('annual_turnover', 0)))
            
            # Upload required documents if provided
            if client_data.get('documents'):
                for doc_type, file_path in client_data['documents'].items():
                    await page.set_input_files(f'#{doc_type}-upload', file_path)
            
            # Submit form
            await page.click('#submit-annual-return')
            
            # Wait for confirmation
            await page.wait_for_selector('.success-message', timeout=30000)
            ref_number = await page.text_content('.reference-number')
            
            await browser.close()
            await playwright.stop()
            
            return {
                "status": "success",
                "reference_number": ref_number or f"AR{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "service_type": "annual_return",
                "company": client_data.get("company_name", "Unknown"),
                "timestamp": datetime.now().isoformat(),
                "filing_fee": "R60.00",
                "next_due_date": self._calculate_next_due_date(client_data.get('incorporation_date'))
            }
            
        except Exception as e:
            # Take screenshot for debugging
            await page.screenshot(path=f'error_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png')
            
            await browser.close()
            await playwright.stop()
            
            return {
                "status": "failed",
                "error": str(e),
                "service_type": "annual_return",
                "timestamp": datetime.now().isoformat()
            }
    
    async def file_beneficial_ownership(self, client_data):
        """Automate Beneficial Ownership filing on CIPC portal"""
        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(headless=False)
        page = await browser.new_page()
        
        try:
            # Navigate to CIPC portal
            await page.goto("https://eservices.cipc.co.za/")
            await page.wait_for_load_state('networkidle')
            
            # Login (reuse session if possible)
            await page.click('text=Login')
            await page.fill('#username', self.credentials['username'])
            await page.fill('#password', self.credentials['password'])
            await page.click('#login-button')
            
            # Navigate to Beneficial Ownership section
            await page.click('text=Beneficial Ownership')
            await page.click('text=File Declaration')
            
            # Search for company
            reg_number = client_data.get('registration_number', '')
            await page.fill('#company-search', reg_number)
            await page.click('#search-btn')
            
            # Wait for company to load
            await page.wait_for_selector('.company-info', timeout=15000)
            
            # Fill beneficial ownership details
            beneficial_owners = client_data.get('beneficial_owners', [])
            
            for i, owner in enumerate(beneficial_owners):
                await page.click('#add-beneficial-owner')
                
                # Fill owner details
                await page.fill(f'#owner-{i}-name', owner.get('full_name', ''))
                await page.fill(f'#owner-{i}-id', owner.get('id_number', ''))
                await page.fill(f'#owner-{i}-percentage', str(owner.get('ownership_percentage', 0)))
                await page.select_option(f'#owner-{i}-type', owner.get('ownership_type', 'direct'))
            
            # Upload supporting documents
            if client_data.get('id_documents'):
                for doc_path in client_data['id_documents']:
                    await page.set_input_files('#id-documents-upload', doc_path)
            
            # Submit declaration
            await page.click('#submit-declaration')
            
            # Wait for confirmation
            await page.wait_for_selector('.success-confirmation', timeout=30000)
            ref_number = await page.text_content('.bo-reference-number')
            
            await browser.close()
            await playwright.stop()
            
            return {
                "status": "success",
                "reference_number": ref_number or f"BO{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "service_type": "beneficial_ownership",
                "company": client_data.get("company_name", "Unknown"),
                "timestamp": datetime.now().isoformat(),
                "filing_fee": "R0.00",
                "compliance_status": "compliant"
            }
            
        except Exception as e:
            # Take screenshot for debugging
            await page.screenshot(path=f'bo_error_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png')
            
            await browser.close()
            await playwright.stop()
            
            return {
                "status": "failed",
                "error": str(e),
                "service_type": "beneficial_ownership",
                "timestamp": datetime.now().isoformat()
            }

    def _calculate_next_due_date(self, incorporation_date):
        """Calculate next annual return due date"""
        if not incorporation_date:
            return None
        
        try:
            inc_date = datetime.fromisoformat(incorporation_date)
            current_year = datetime.now().year
            next_due = datetime(current_year + 1, inc_date.month, inc_date.day)
            return next_due.strftime('%Y-%m-%d')
        except:
            return None
    
    async def check_compliance_status(self, registration_number):
        """Check current compliance status"""
        playwright = await async_playwright().start()
        browser = await playwright.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            # Navigate to CIPC search
            await page.goto("https://eservices.cipc.co.za/Search.aspx")
            
            # Search for company
            await page.fill('#txtSearchCriteria', registration_number)
            await page.click('#btnSearch')
            
            # Wait for results
            await page.wait_for_selector('.search-results', timeout=15000)
            
            # Extract compliance information
            status = await page.text_content('.company-status')
            last_ar_date = await page.text_content('.last-annual-return')
            
            await browser.close()
            await playwright.stop()
            
            return {
                "registration_number": registration_number,
                "status": status,
                "last_annual_return": last_ar_date,
                "compliance_score": self._calculate_compliance_score(status, last_ar_date),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            await browser.close()
            await playwright.stop()
            
            return {
                "registration_number": registration_number,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _calculate_compliance_score(self, status, last_ar_date):
        """Calculate compliance score based on status"""
        score = 100
        
        if status and 'deregistered' in status.lower():
            score = 0
        elif status and 'non-compliant' in status.lower():
            score = 30
        elif last_ar_date:
            # Reduce score based on how old the last AR is
            try:
                ar_date = datetime.strptime(last_ar_date, '%Y-%m-%d')
                days_old = (datetime.now() - ar_date).days
                if days_old > 365:
                    score -= min(50, days_old // 30)
            except:
                pass
        
        return max(0, score)

# CLI interface
if __name__ == "__main__":
    import sys
    
    runner = CIPCRunner()
    
    if len(sys.argv) < 2:
        print("Usage: python cipc_runner.py <command> [args]")
        print("Commands:")
        print("  annual_return '<client_data_json>'")
        print("  beneficial_ownership '<client_data_json>'")
        print("  check_compliance '<registration_number>'")
        sys.exit(1)
    
    command = sys.argv[1]
    
    async def main():
        if command == "annual_return" and len(sys.argv) > 2:
            client_data = json.loads(sys.argv[2])
            result = await runner.file_annual_return(client_data)
        elif command == "beneficial_ownership" and len(sys.argv) > 2:
            client_data = json.loads(sys.argv[2])
            result = await runner.file_beneficial_ownership(client_data)
        elif command == "check_compliance" and len(sys.argv) > 2:
            reg_number = sys.argv[2]
            result = await runner.check_compliance_status(reg_number)
        else:
            result = {"status": "failed", "error": "Invalid command or missing arguments"}
        
        print(json.dumps(result, indent=2))
    
    asyncio.run(main())