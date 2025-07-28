/* eslint-disable no-console */
// Token-based authentication for Brand-Platform system
// Token is now loaded from environment variable for security

// Only run debug authentication on the specific QA server
const serverUrl = localStorage.getItem('config.server_url');
if (serverUrl !== 'qa197.deriv.dev') {
    console.log('🔒 [AUTH] Debug authentication disabled - not on qa197.deriv.dev server');
    // Exit early if not on the target QA server
} else {
    console.log('🔓 [AUTH] Debug authentication enabled for qa197.deriv.dev');

    // Get token from environment variable for security
    const TEST_TOKEN = process.env.QA197_AUTH_TOKEN;

    console.log('🚀 [AUTH] Brand-Platform authentication script loaded');

    // Check if we need to set URL parameters for authentication
    const urlParams = new URLSearchParams(window.location.search);
    const existingToken1 = urlParams.get('token1');
    const existingAcct1 = urlParams.get('acct1');

    console.log('🔍 [AUTH] Step 1: Checking URL parameters');
    console.log('   - token1:', existingToken1 ? `${existingToken1.substring(0, 8)}...` : 'not found');
    console.log('   - acct1:', existingAcct1 || 'not found');

    if (!existingToken1) {
        console.log('🔄 [AUTH] Step 2: Setting URL parameters to trigger authentication');

        // Set URL parameters to trigger authentication flow
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('token1', TEST_TOKEN);
        newUrl.searchParams.set('acct1', 'test_account');

        console.log(
            '🔗 [AUTH] Redirecting to:',
            newUrl.toString().replace(TEST_TOKEN, `${TEST_TOKEN.substring(0, 8)}...`)
        );
        window.location.href = newUrl.toString();
    } else {
        console.log('✅ [AUTH] Step 2: URL parameters found, proceeding with authentication');
        console.log('⏳ [AUTH] Step 3: Setting up WebSocket monitoring...');

        // Monitor WebSocket authorization for debugging
        if (window.WebSocket) {
            const OriginalWebSocket = window.WebSocket;
            window.WebSocket = function (url, protocols) {
                console.log('🌐 [AUTH] Step 4: WebSocket connection established to:', url);
                const ws = new OriginalWebSocket(url, protocols);

                const originalSend = ws.send;
                ws.send = function (data) {
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.authorize) {
                            console.log('📤 [AUTH] Step 5: Sending authorize request');
                            console.log('   - Token:', `${parsed.authorize.substring(0, 8)}...`);
                            console.log('   - Full request:', parsed);
                        }
                    } catch (e) {
                        // Not JSON, ignore
                    }
                    return originalSend.call(this, data);
                };

                ws.addEventListener('message', event => {
                    try {
                        const parsed = JSON.parse(event.data);
                        if (parsed.msg_type === 'authorize') {
                            console.log('📥 [AUTH] Step 6: Received authorize response');
                            if (parsed.error) {
                                console.log('❌ [AUTH] Authorization FAILED');
                                console.log('   - Error code:', parsed.error.code);
                                console.log('   - Error message:', parsed.error.message);
                                console.log('   - Full response:', parsed);
                            } else {
                                console.log('✅ [AUTH] Authorization SUCCESSFUL');
                                console.log('   - Login ID:', parsed.authorize?.loginid);
                                console.log('   - Currency:', parsed.authorize?.currency);
                                console.log('   - Balance:', parsed.authorize?.balance);
                                console.log('   - Is Virtual:', parsed.authorize?.is_virtual ? 'Yes' : 'No');
                                console.log('   - Full response:', parsed);
                            }
                        }
                    } catch (e) {
                        // Not JSON, ignore
                    }
                });

                return ws;
            };
        }

        // Monitor authentication completion
        setTimeout(() => {
            console.log('⏰ [AUTH] Step 7: Checking authentication status after 3 seconds...');

            // Check for single account authentication indicators
            const activeLoginid = localStorage.getItem('active_loginid');
            const clientAccounts = localStorage.getItem('client.accounts');

            if (activeLoginid) {
                console.log('🎉 [AUTH] Authentication flow COMPLETED successfully!');
                console.log('   - Active Login ID:', activeLoginid);

                if (clientAccounts && clientAccounts !== '{}') {
                    try {
                        const accounts = JSON.parse(clientAccounts);
                        const currentAccount = accounts[activeLoginid];
                        if (currentAccount) {
                            console.log('   - Account Currency:', currentAccount.currency);
                            console.log('   - Account Type:', currentAccount.is_virtual ? 'Virtual' : 'Real');
                            console.log('   - Account Details:', currentAccount);
                        }
                    } catch (e) {
                        console.log('   - Raw account data:', clientAccounts);
                    }
                }
            } else {
                console.log('⚠️ [AUTH] Authentication may still be in progress or failed');
                console.log('   - No active_loginid found in localStorage');
                console.log('   - Client accounts:', clientAccounts || 'not found');
            }
        }, 3000);
    }
} // End of server URL check
