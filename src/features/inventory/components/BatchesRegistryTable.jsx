import React from 'react';
import { getExpiryStatus } from '../utils/getExpiryStatus';

const BatchesRegistryTable = ({ batches = [] }) => (
    <table className="inventory-table">
        <thead>
            <tr>
                <th>Batch Number</th>
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Manufactured</th>
                <th>Expiry Date</th>
            </tr>
        </thead>
        <tbody>
            {batches.length > 0 ? (
                batches.map((b, index) => {
                    const expiryStatus = getExpiryStatus(b.expiry_date);
                    const productLabel = b?.product ? `${b.product.substring(0, 13)}...` : '---';
                    return (
                        <tr key={b.id || b.batch_number || index}>
                            <td style={{ fontWeight: '700', color: 'var(--marble-blue)' }}>{b.batch_number}</td>
                            <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{productLabel}</td>
                            <td style={{ fontWeight: '600' }}>{parseFloat(b.quantity).toLocaleString()}</td>
                            <td>{new Date(b.manufacture_date).toLocaleDateString()}</td>
                            <td>
                                <span className={`badge ${expiryStatus === 'expired' ? 'out' : expiryStatus === 'near' ? 'low' : 'in'}`}>
                                    {new Date(b.expiry_date).toLocaleDateString()}
                                    {expiryStatus === 'expired' && ' (EXPIRED)'}
                                </span>
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No batch records found.</td></tr>
            )}
        </tbody>
    </table>
);

export default BatchesRegistryTable;
