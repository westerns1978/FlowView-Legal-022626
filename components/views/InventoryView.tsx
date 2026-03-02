
import React, { useState, useMemo } from 'react';
import { AppData, InventoryItem } from '../../types';
import { Card } from '../ui/Card';
import { AlertTriangleIcon, CheckCircleIcon } from '../ui/Icons';

type SortConfig = { key: keyof InventoryItem, direction: 'ascending' | 'descending' };

const SortableHeader: React.FC<{
    label: string;
    sortKey: keyof InventoryItem;
    sortConfig: SortConfig;
    requestSort: (key: keyof InventoryItem) => void;
}> = ({ label, sortKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig.key === sortKey;
    const directionIcon = isSorted ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '';
    return (
        <th className="p-3 text-left font-semibold text-text-secondary">
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1 hover:text-text-primary">
                {label} <span className="text-xs">{directionIcon}</span>
            </button>
        </th>
    );
};

export const InventoryView: React.FC<{ appData: AppData }> = ({ appData }) => {
    const { inventoryData } = appData;
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });

    const sortedData = useMemo(() => {
        let sorted = [...inventoryData];
        sorted.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [inventoryData, sortConfig]);

    const lowStockItems = useMemo(() => {
        return inventoryData.filter(item => item.quantity < 10);
    }, [inventoryData]);

    const requestSort = (key: keyof InventoryItem) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-6">
            {/* Critical Alerts Card */}
            {lowStockItems.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-4 animate-pulse">
                    <div className="p-2 bg-red-500/20 rounded-full text-red-500">
                        <AlertTriangleIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-500 text-sm uppercase tracking-wide">Critical Supply Alerts</h4>
                        <p className="text-xs text-text-secondary mb-2">The following items are below minimum thresholds. Immediate restock recommended.</p>
                        <div className="flex flex-wrap gap-2">
                            {lowStockItems.map(item => (
                                <span key={item.id} className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                    {item.name} ({item.quantity} units)
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Supply Stock</h3>
                    <div className="flex gap-2">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-component-light border border-border text-text-secondary">
                            Total SKUs: {inventoryData.length}
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-component-light">
                                <SortableHeader label="Item Name" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Quantity" sortKey="quantity" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Date Added" sortKey="createdAt" sortConfig={sortConfig} requestSort={requestSort} />
                                <th className="p-3 text-center text-text-secondary font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sortedData.map(item => (
                                <tr key={item.id} className="hover:bg-component-light transition-colors">
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className={`p-3 font-bold ${item.quantity < 10 ? 'text-red-500' : 'text-text-primary'}`}>{item.quantity}</td>
                                    <td className="p-3 text-text-secondary">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3 text-center">
                                        {item.quantity < 10 ? (
                                            <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded-full border border-red-500/20 font-bold">LOW STOCK</span>
                                        ) : (
                                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full border border-green-500/20 font-bold">OK</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {sortedData.length === 0 && (
                        <p className="text-center p-6 text-text-secondary">No inventory data found. Try uploading a `warehouse.json` file in the Data Fabric view.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};
