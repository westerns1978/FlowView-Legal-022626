import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MailIcon } from './ui/Icons';
import { useTheme } from '../App';
import { AppData } from '../types';

const COLORS = ['#2563eb', '#16a34a', '#f97316', '#ec4899', '#8b5cf6', '#f59e0b'];

interface ExpenseSummaryChartProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    appData: AppData;
}

export const ExpenseSummaryChart: React.FC<ExpenseSummaryChartProps> = ({ onOpenAiCommandCenter, appData }) => {
    const { theme } = useTheme();
    const legendColor = theme === 'dark' ? '#d1d5db' : '#374151';

    const expenseData = useMemo(() => {
        const expensesByCategory = appData.scenarios.reduce((acc, scenario) => {
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

    const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);

    const prompt = `Generate an email to exp@4pnx.com summarizing the latest expense report. Total expenses are $${totalExpenses.toFixed(2)}. Break down the expenses by category: ${expenseData.map(e => `${e.name}: $${e.value.toFixed(2)}`).join(', ')}. Ask for a review of any pending items.`;

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-bold mb-1 text-text-primary">Expense Summary</h3>
            <p className="text-sm text-text-secondary mb-4">Total: <span className="font-bold text-text-primary">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
            <div className="flex-grow h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={expenseData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label
                        >
                            {expenseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
             <button onClick={() => onOpenAiCommandCenter(prompt)} className="flex items-center justify-center gap-2 mt-4 w-full bg-component-lighter text-text-secondary text-sm font-bold py-2 px-3 rounded-lg transition hover:bg-border-color border border-border-color">
                <MailIcon className="w-4 h-4" /> Email Expense Report
            </button>
        </div>
    );
};
