import React, { useEffect, useState } from 'react';

interface HealthGaugeProps {
    score: number;
}

export const HealthGauge: React.FC<HealthGaugeProps> = ({ score }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const animation = requestAnimationFrame(() => setAnimatedScore(score));
        return () => cancelAnimationFrame(animation);
    }, [score]);

    const size = 180;
    const strokeWidth = 18;
    const center = size / 2;
    const radius = center - strokeWidth;
    const circumference = 2 * Math.PI * radius;

    const progress = animatedScore / 100;
    const offset = circumference * (1 - progress);

    const getStrokeColor = (s: number) => {
        if (s < 40) return '#ef4444'; // red-500
        if (s < 60) return '#f97316'; // orange-500
        if (s < 80) return '#facc15'; // yellow-400
        return '#22c55e'; // green-500
    };

    const color = getStrokeColor(animatedScore);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#facc15" />
                        <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                </defs>
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="var(--color-border)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${center} ${center})`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.8s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-text-primary">{Math.round(animatedScore)}</span>
                <span className="text-lg text-text-secondary font-semibold">%</span>
            </div>
        </div>
    );
};