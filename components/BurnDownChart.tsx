
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FdTicket } from '../types';
import { useTheme } from '../App';

interface BurnDownChartProps {
    tickets: FdTicket[];
}

export const BurnDownChart: React.FC<BurnDownChartProps> = ({ tickets }) => {
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#9ca3af' : '#475569';
    const gridColor = theme === 'dark' ? '#374151' : '#e2e8f0';

    const chartData = useMemo(() => {
        // Find the most relevant ticket (e.g., the one with the most estimated hours)
        const mainTicket = tickets.sort((a, b) => b.estimated_hours - a.estimated_hours)[0];
        if (!mainTicket) {
            return [];
        }

        const { estimated_hours, actual_hours } = mainTicket;
        
        // Mocking a timeline of 5 weeks for demonstration
        const totalWeeks = 5;
        const idealBurnPerWeek = estimated_hours / totalWeeks;

        const data = [];
        for (let i = 0; i <= totalWeeks; i++) {
            const idealRemaining = Math.max(0, estimated_hours - (idealBurnPerWeek * i));
            
            // Simulate actual burn, showing it might deviate from the ideal path
            let actualRemaining;
            if (i === 0) {
                 actualRemaining = estimated_hours;
            } else {
                 const currentProgress = (actual_hours / estimated_hours) * totalWeeks;
                 if (i < currentProgress) {
                     actualRemaining = estimated_hours - (idealBurnPerWeek * i * 0.9); // burning slightly faster
                 } else if (i > currentProgress) {
                     actualRemaining = null; // not there yet
                 } else {
                     actualRemaining = estimated_hours - actual_hours;
                 }
            }

            data.push({
                week: `Week ${i}`,
                'Ideal Remaining': idealRemaining,
                'Actual Remaining': actualRemaining,
            });
        }
        return data;
    }, [tickets]);

    if (chartData.length === 0) {
        return <div className="text-sm text-text-secondary text-center p-4">No active project data to display.</div>;
    }

    return (
        <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: tickColor }} />
                    <YAxis tick={{ fontSize: 10, fill: tickColor }} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: tickColor, fontSize: 10 }} />
                    <Tooltip
                        contentStyle={{
                            background: 'var(--color-component)',
                            color: 'var(--color-text-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '0.5rem',
                            fontSize: '12px'
                        }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line type="monotone" dataKey="Ideal Remaining" stroke="#8884d8" strokeDasharray="5 5" strokeWidth={2} />
                    <Line type="monotone" dataKey="Actual Remaining" stroke="var(--color-primary)" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
