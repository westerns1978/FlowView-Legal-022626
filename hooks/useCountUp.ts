import { useState, useEffect } from 'react';

export const useCountUp = (end: number, duration: number = 1000): number => {
    const [count, setCount] = useState(0);
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);

    useEffect(() => {
        // Don't animate from a previous value, always start from 0 on change
        setCount(0);
        
        let frame = 0;
        const counter = setInterval(() => {
            frame++;
            // Using a non-linear progression (ease-out) for a smoother effect
            const progress = 1 - Math.pow(1 - (frame / totalFrames), 3);
            const currentCount = end * progress;
            
            setCount(currentCount);

            if (frame === totalFrames) {
                clearInterval(counter);
                // Ensure final value is exact
                setCount(end);
            }
        }, frameRate);

        return () => {
            clearInterval(counter);
        };
    }, [end, duration, frameRate]); // Rerun effect if end value changes

    return count;
};
