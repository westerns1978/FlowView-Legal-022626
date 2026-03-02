
import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AiChartData } from '../types';
import { useTheme } from '../App';


const COLORS = ['#2563eb', '#16a34a', '#f97316', '#ec4899', '#8b5cf6'];

export const AiChartRenderer: React.FC<{ chartData: AiChartData }> = ({ chartData }) => {
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#9ca3af' : '#475569';
    
    if (!chartData || !chartData.data || chartData.data.length === 0) {
        return <div className="text-sm text-center text-text-secondary p-4">No data available for chart.</div>;
    }

    const renderChart = () => {
        switch (chartData.type) {
            case 'bar':
                return (
                    <BarChart data={chartData.data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <XAxis dataKey={chartData.nameKey || 'name'} tick={{ fontSize: 10, fill: tickColor }} interval={0}/>
                        <YAxis tick={{ fontSize: 10, fill: tickColor }} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'var(--color-component-lighter)', 
                            color: 'var(--color-text-primary)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: '0.5rem', fontSize: '12px' 
                          }} 
                        />
                        <Bar dataKey={chartData.dataKey} fill="var(--color-primary)" />
                    </BarChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={chartData.data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey={chartData.dataKey}
                            nameKey={chartData.nameKey || 'name'}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                return (
                                <text
                                    x={x}
                                    y={y}
                                    fill={tickColor}
                                    textAnchor={x > cx ? 'start' : 'end'}
                                    dominantBaseline="central"
                                    style={{ fontSize: '10px', fontWeight: 'bold' }}
                                >
                                    {`${name} (${(percent * 100).toFixed(0)}%)`}
                                </text>
                                );
                            }}
                        >
                            {chartData.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                background: 'var(--color-component-lighter)', 
                                color: 'var(--color-text-primary)', 
                                border: '1px solid var(--color-border)', 
                                borderRadius: '0.5rem', fontSize: '12px' 
                            }}
                        />
                    </PieChart>
                );
            default:
                return <div className="text-sm text-danger">Unsupported chart type.</div>;
        }
    };

    return (
        <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};
