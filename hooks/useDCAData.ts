
import { useState, useEffect } from 'react';
import { dcaApi, CaseloadResponse, BillingProjection, ActivityEvent, Opportunity } from '../services/dcaApi';
import { AppConfig } from '../config';

// Hook for fleet data with auto-refresh
export function useFleet(autoRefresh = true) {
    const [data, setData] = useState<CaseloadResponse | null>(null);
    const [loading, setLoading] = useState(true);
    
    const fetchData = async () => {
        try {
            const result = await dcaApi.getFleet();
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (autoRefresh) {
            const interval = setInterval(fetchData, AppConfig.api.polling.fleet);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    return { data, loading, refresh: fetchData };
}

// Hook for revenue with auto-refresh
export function useRevenue(autoRefresh = true) {
    const [data, setData] = useState<BillingProjection | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const result = await dcaApi.getRevenueProjection();
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (autoRefresh) {
            const interval = setInterval(fetchData, AppConfig.api.polling.revenue);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    return { data, loading, refresh: fetchData };
}

// Hook for activity feed with faster polling
export function useActivityFeed(autoRefresh = true) {
    const [data, setData] = useState<ActivityEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const result = await dcaApi.getActivityFeed();
            // Enhance with ALN Status simulation if missing
            const enhanced = result.map(e => ({
                ...e,
                alnStatus: e.alnStatus || (Math.random() > 0.3 ? 'Synced to LegalServer' : 'Queued for ALN')
            }));
            setData(enhanced);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (autoRefresh) {
            const interval = setInterval(fetchData, AppConfig.api.polling.activity);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    return { data, loading, refresh: fetchData };
}

export function useOpportunities(autoRefresh = true) {
    const [data, setData] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const result = await dcaApi.getOpportunities();
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (autoRefresh) {
            const interval = setInterval(fetchData, AppConfig.api.polling.opportunities);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    return { data, loading, refresh: fetchData };
}
