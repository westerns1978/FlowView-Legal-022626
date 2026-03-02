import React from 'react';

interface ToggleSwitchProps {
    label: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => {
    return (
        <label htmlFor="toggle-switch" className="flex items-center cursor-pointer select-none">
            <span className="text-sm font-medium text-text-secondary mr-3">{label}</span>
            <div className="relative">
                <input
                    type="checkbox"
                    id="toggle-switch"
                    className="sr-only"
                    checked={enabled}
                    onChange={e => onChange(e.target.checked)}
                />
                <div className={`block w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-border'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'transform translate-x-6' : ''}`}></div>
            </div>
        </label>
    );
};
