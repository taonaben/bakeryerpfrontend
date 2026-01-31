export const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'fresh';
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 7) return 'near';
    return 'fresh';
};
