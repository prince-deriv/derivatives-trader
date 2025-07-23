export const getSortedAccountList = (account_list, accounts) => {
    // sort accounts as follows:
    // highest balance first, then demo accounts last
    return [...account_list].sort((a, b) => {
        // Always put virtual (demo) accounts last
        if (a.is_virtual || b.is_virtual) {
            return a.is_virtual ? 1 : -1;
        }

        // For non-virtual accounts, sort by balance (highest first)
        const a_balance = parseFloat(accounts[a.loginid].balance);
        const b_balance = parseFloat(accounts[b.loginid].balance);

        // Sort in descending order (higher balance first)
        return b_balance - a_balance;
    });
};

export const isDemo = account => account.account_type === 'demo';
