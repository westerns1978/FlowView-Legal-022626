interface EnterpriseUser {
    id: string;
    name: string;
    totalPoints: number;
    is_active: boolean;
}

const slugify = (name: string, usedIds: Set<string>): string => {
    let baseSlug = name
        .toLowerCase()
        .replace(/\(.*\)/g, match => match.replace(/\s+/g, '-')) 
        .replace(/[().]/g, '') 
        .replace(/[^a-z0-9\s-]/g, '') 
        .replace(/\s+/g, '-') 
        .replace(/-+/g, '-'); 

    let slug = baseSlug;
    let counter = 1;
    while (usedIds.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    usedIds.add(slug);
    return slug;
};

// Authoritative user seed data for FlowView
const rawUsers = [
    { "name": "John Martinez", "total_point": 1250 },
    { "name": "Sarah Chen", "total_point": 980 },
    { "name": "Sam Western", "total_point": 870 },
    { "name": "Ian Western", "total_point": 740 },
    { "name": "Mike Johnson", "total_point": 680 },
    { "name": "Ben Philpot", "total_point": 520 },
    { "name": "Elena Rodriguez", "total_point": 480 },
    { "name": "David Kim", "total_point": 420 },
    { "name": "Anita Patel", "total_point": 350 },
    { "name": "Robert Fox", "total_point": 310 },
    { "name": "Maria Garcia", "total_point": 280 },
    { "name": "Earl Philpot", "total_point": 0 },
    { "name": "Reena Philpot", "total_point": 0 }
];

const usedIds = new Set<string>();

export const enterpriseUsers: EnterpriseUser[] = rawUsers
    .map(user => ({
        id: slugify(user.name, usedIds),
        name: user.name,
        totalPoints: user.total_point,
        is_active: true,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);