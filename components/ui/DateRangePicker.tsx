
import React from 'react';
import { useDateRange } from '../../contexts/DateRangeContext';

// Helper to format date object to YYYY-MM-DD string for input value
const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const DateRangePicker: React.FC = () => {
    const context = useDateRange();

    if (!context) {
        return null; // Or some fallback UI
    }

    const { dateRange, setDateRange } = context;

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = new Date(e.target.value);
        // Ensure start date is not after end date
        if (newStartDate <= dateRange.endDate) {
            setDateRange({ ...dateRange, startDate: newStartDate });
        }
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = new Date(e.target.value);
        // Ensure end date is not before start date
        if (newEndDate >= dateRange.startDate) {
            setDateRange({ ...dateRange, endDate: newEndDate });
        }
    };

    return (
        <div className="flex items-center gap-2 bg-component-light p-1 rounded-full border border-border-color">
            <input
                type="date"
                value={formatDateForInput(dateRange.startDate)}
                onChange={handleStartDateChange}
                className="bg-transparent text-sm text-text-secondary font-medium focus:outline-none p-1"
                aria-label="Start Date"
            />
            <span className="text-text-secondary">-</span>
            <input
                type="date"
                value={formatDateForInput(dateRange.endDate)}
                onChange={handleEndDateChange}
                className="bg-transparent text-sm text-text-secondary font-medium focus:outline-none p-1"
                aria-label="End Date"
            />
        </div>
    );
};