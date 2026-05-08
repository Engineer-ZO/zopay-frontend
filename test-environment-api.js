const axios = require('axios');

// Get API base URL from environment or use default
// Backend is running on port 7000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:7000';

// Test credentials
const credentials = {
  email: 'fabricemokfembam@gmail.com',
  password: 'Thiago+123.' // Note: password includes period at the end
};

let accessToken = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function login() {
  logSection('STEP 1: LOGIN');
  try {
    log(`Attempting to login with email: ${credentials.email}`, 'blue');
    const response = await axios.post(
      `${API_BASE_URL}/public/v1/auth/login`,
      credentials,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.accessToken) {
      accessToken = response.data.accessToken;
      log('✓ Login successful!', 'green');
      log(`Token: ${accessToken.substring(0, 20)}...`, 'blue');
      return true;
    } else {
      log('✗ Login failed: No access token in response', 'red');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }
  } catch (error) {
    log('✗ Login failed!', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testWalletSummary(environment = null) {
  logSection(`WALLET SUMMARY TEST ${environment ? `(environment=${environment})` : '(no environment)'}`);
  
  try {
    const url = `${API_BASE_URL}/wallet/summary${environment ? `?environment=${environment}` : ''}`;
    log(`Request URL: ${url}`, 'blue');
    log(`Headers: Authorization: Bearer ${accessToken.substring(0, 20)}...`, 'blue');

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    log('✓ Request successful!', 'green');
    log(`Status: ${response.status}`, 'green');
    log('\nResponse Data:', 'yellow');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if data exists
    if (response.data && (response.data.available !== undefined || response.data.balance !== undefined)) {
      log('\n✓ Wallet data found!', 'green');
      if (response.data.available !== undefined) {
        log(`Available Balance: ${response.data.available}`, 'green');
      }
      if (response.data.balance !== undefined) {
        log(`Balance: ${response.data.balance}`, 'green');
      }
    } else {
      log('\n⚠ No wallet data in response', 'yellow');
    }

    return response.data;
  } catch (error) {
    log('✗ Request failed!', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    return null;
  }
}

async function testWalletActivity(environment = null) {
  logSection(`WALLET ACTIVITY TEST ${environment ? `(environment=${environment})` : '(no environment)'}`);
  
  try {
    const url = `${API_BASE_URL}/wallet/activity?limit=10${environment ? `&environment=${environment}` : ''}`;
    log(`Request URL: ${url}`, 'blue');

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    log('✓ Request successful!', 'green');
    log(`Status: ${response.status}`, 'green');
    log(`\nResponse Data (first 3 items):`, 'yellow');
    
    const data = Array.isArray(response.data) ? response.data : (response.data?.activities || response.data?.data || []);
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
    
    log(`\nTotal items: ${data.length}`, 'blue');
    
    if (data.length > 0) {
      log('✓ Wallet activity data found!', 'green');
    } else {
      log('⚠ No wallet activity data', 'yellow');
    }

    return data;
  } catch (error) {
    log('✗ Request failed!', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    return null;
  }
}

async function testDashboardStats(merchantId, environment = null) {
  logSection(`DASHBOARD STATS TEST ${environment ? `(environment=${environment})` : '(no environment)'}`);
  
  try {
    const url = `${API_BASE_URL}/merchant/v1/merchants/${merchantId}/dashboard/stats?period=30d${environment ? `&environment=${environment}` : ''}`;
    log(`Request URL: ${url}`, 'blue');

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    log('✓ Request successful!', 'green');
    log(`Status: ${response.status}`, 'green');
    log('\nResponse Data:', 'yellow');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if data exists
    if (response.data && (response.data.totalRevenue !== undefined || response.data.totalTransactions !== undefined)) {
      log('\n✓ Dashboard stats found!', 'green');
    } else {
      log('\n⚠ No dashboard stats data', 'yellow');
    }

    return response.data;
  } catch (error) {
    log('✗ Request failed!', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    return null;
  }
}

async function testRecentTransactions(merchantId, environment = null) {
  logSection(`RECENT TRANSACTIONS TEST ${environment ? `(environment=${environment})` : '(no environment)'}`);
  
  try {
    const url = `${API_BASE_URL}/merchant/v1/merchants/${merchantId}/dashboard/transactions/recent?limit=10${environment ? `&environment=${environment}` : ''}`;
    log(`Request URL: ${url}`, 'blue');

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    log('✓ Request successful!', 'green');
    log(`Status: ${response.status}`, 'green');
    
    const transactions = response.data?.transactions || response.data || [];
    log(`\nResponse Data (first 3 transactions):`, 'yellow');
    console.log(JSON.stringify(transactions.slice(0, 3), null, 2));
    
    log(`\nTotal transactions: ${transactions.length}`, 'blue');
    
    if (transactions.length > 0) {
      log('✓ Transactions found!', 'green');
    } else {
      log('⚠ No transactions found', 'yellow');
    }

    return transactions;
  } catch (error) {
    log('✗ Request failed!', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    return null;
  }
}

async function getMerchantId() {
  logSection('GETTING MERCHANT ID');
  
  try {
    // Try to get merchant from user endpoint or first merchant endpoint
    const response = await axios.get(
      `${API_BASE_URL}/merchant/v1/merchants/first`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.merchant && response.data.merchant.id) {
      const merchantId = response.data.merchant.id;
      log(`✓ Merchant ID: ${merchantId}`, 'green');
      return merchantId;
    } else {
      log('⚠ Could not get merchant ID from response', 'yellow');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log('✗ Failed to get merchant ID!', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    return null;
  }
}

async function runTests() {
  logSection('ENVIRONMENT PARAMETER API TEST');
  log(`API Base URL: ${API_BASE_URL}`, 'blue');
  log(`Testing with credentials: ${credentials.email}`, 'blue');

  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n✗ Cannot proceed without authentication', 'red');
    process.exit(1);
  }

  // Step 2: Get Merchant ID
  const merchantId = await getMerchantId();
  if (!merchantId) {
    log('\n⚠ Proceeding without merchant ID (some tests may fail)', 'yellow');
  }

  // Step 3: Test Wallet Endpoints
  log('\n\n');
  log('='.repeat(60), 'cyan');
  log('TESTING WALLET ENDPOINTS', 'cyan');
  log('='.repeat(60), 'cyan');

  const walletSummaryNoEnv = await testWalletSummary();
  const walletSummarySandbox = await testWalletSummary('sandbox');
  const walletSummaryProduction = await testWalletSummary('production');

  const walletActivityNoEnv = await testWalletActivity();
  const walletActivitySandbox = await testWalletActivity('sandbox');
  const walletActivityProduction = await testWalletActivity('production');

  // Step 4: Test Dashboard/Transactions Endpoints
  if (merchantId) {
    log('\n\n');
    log('='.repeat(60), 'cyan');
    log('TESTING DASHBOARD/TRANSACTIONS ENDPOINTS', 'cyan');
    log('='.repeat(60), 'cyan');

    const dashboardStatsNoEnv = await testDashboardStats(merchantId);
    const dashboardStatsSandbox = await testDashboardStats(merchantId, 'sandbox');
    const dashboardStatsProduction = await testDashboardStats(merchantId, 'production');

    const transactionsNoEnv = await testRecentTransactions(merchantId);
    const transactionsSandbox = await testRecentTransactions(merchantId, 'sandbox');
    const transactionsProduction = await testRecentTransactions(merchantId, 'production');
  }

  // Step 5: Summary
  logSection('TEST SUMMARY');
  log('Wallet Summary:', 'cyan');
  log(`  No env: ${walletSummaryNoEnv ? '✓' : '✗'}`, walletSummaryNoEnv ? 'green' : 'red');
  log(`  Sandbox: ${walletSummarySandbox ? '✓' : '✗'}`, walletSummarySandbox ? 'green' : 'red');
  log(`  Production: ${walletSummaryProduction ? '✓' : '✗'}`, walletSummaryProduction ? 'green' : 'red');

  log('\nWallet Activity:', 'cyan');
  log(`  No env: ${walletActivityNoEnv ? `✓ (${walletActivityNoEnv.length} items)` : '✗'}`, walletActivityNoEnv ? 'green' : 'red');
  log(`  Sandbox: ${walletActivitySandbox ? `✓ (${walletActivitySandbox.length} items)` : '✗'}`, walletActivitySandbox ? 'green' : 'red');
  log(`  Production: ${walletActivityProduction ? `✓ (${walletActivityProduction.length} items)` : '✗'}`, walletActivityProduction ? 'green' : 'red');

  if (merchantId) {
    log('\nDashboard Stats:', 'cyan');
    log(`  No env: ${dashboardStatsNoEnv ? '✓' : '✗'}`, dashboardStatsNoEnv ? 'green' : 'red');
    log(`  Sandbox: ${dashboardStatsSandbox ? '✓' : '✗'}`, dashboardStatsSandbox ? 'green' : 'red');
    log(`  Production: ${dashboardStatsProduction ? '✓' : '✗'}`, dashboardStatsProduction ? 'green' : 'red');

    log('\nRecent Transactions:', 'cyan');
    log(`  No env: ${transactionsNoEnv ? `✓ (${transactionsNoEnv.length} items)` : '✗'}`, transactionsNoEnv ? 'green' : 'red');
    log(`  Sandbox: ${transactionsSandbox ? `✓ (${transactionsSandbox.length} items)` : '✗'}`, transactionsSandbox ? 'green' : 'red');
    log(`  Production: ${transactionsProduction ? `✓ (${transactionsProduction.length} items)` : '✗'}`, transactionsProduction ? 'green' : 'red');
  }

  log('\n✓ Test completed!', 'green');
}

// Run the tests
runTests().catch(error => {
  log(`\n✗ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
