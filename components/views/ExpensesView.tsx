import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../App';
import { AppData } from '../../types';

interface ExpensesViewProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    appData: AppData;
}

const COLORS = ['#2563eb', '#16a34a', '#f97316', '#ec4899', '#8b5cf6', '#f59e0b'];

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenAiCommandCenter, appData }) => {
    const { theme } = useTheme();

    const expenseData = useMemo(() => {
        // Therapeutic win: Adding a guard clause prevents crashes from race conditions, making the app more stable and reducing user frustration.
        if (!appData) return [];
        const { scenarios } = appData;
        const expensesByCategory = scenarios.reduce((acc, scenario) => {
            scenario.quickBooksData.expenses.forEach((expense: { category: string; amount: number; }) => {
                if (!acc[expense.category]) {
                    acc[expense.category] = 0;
                }
                acc[expense.category] += expense.amount;
            });
            return acc;
        }, {} as { [key: string]: number });

        return Object.entries(expensesByCategory)
            .map(([name, value]) => ({ name, value: value as number }))
            .sort((a, b) => b.value - a.value);
    }, [appData]);

    const allExpenses = useMemo(() => {
        if (!appData) return [];
        const { scenarios } = appData;
        return scenarios.flatMap(s => s.quickBooksData.expenses.map((e: {amount: number; technicianName: string; category: string}) => ({ ...e, client: s.customerName }))).sort((a, b) => b.amount - a.amount);
    }, [appData]);

    if (!appData) {
        return <Card><div className="text-center p-4 text-text-secondary">Loading billing data...</div></Card>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <Card className="lg:col-span-1">
                <h3 className="font-bold text-text-primary mb-2">Billing by Category</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" paddingAngle={5}>
                                {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                            <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <Card className="lg:col-span-2">
                <h3 className="font-bold text-text-primary mb-2">Billing Log</h3>
                <div className="max-h-72 overflow-y-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-component-light sticky top-0">
                            <tr>
                                <th className="p-2 text-left font-semibold text-text-secondary">Provider</th>
                                <th className="p-2 text-left font-semibold text-text-secondary">Category</th>
                                <th className="p-2 text-left font-semibold text-text-secondary">Client</th>
                                <th className="p-2 text-right font-semibold text-text-secondary">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {allExpenses.map((expense, index) => (
                                <tr key={index} className="hover:bg-component-light">
                                    <td className="p-2 font-medium text-text-primary">{expense.technicianName}</td>
                                    <td className="p-2 text-text-secondary">{expense.category}</td>
                                    <td className="p-2 text-text-secondary">{expense.client}</td>
                                    <td className="p-2 text-right font-semibold text-text-primary">${expense.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
