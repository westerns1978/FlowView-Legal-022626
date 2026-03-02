
import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { 
    MagnifyingGlassIcon, 
    SparklesIcon, 
    DocumentTextIcon, 
    ChevronRightIcon, 
    ShieldCheckIcon,
    ScaleIcon,
    BookOpenIcon,
    ClockIcon
} from '../ui/Icons';
import { AppData } from '../../types';

interface ResearchResult {
    id: string;
    title: string;
    citation: string;
    summary: string;
    relevance: number;
    date: string;
    category: 'Case Law' | 'Statute' | 'Internal Memo' | 'Regulation';
}

const MOCK_RESULTS: ResearchResult[] = [
    { 
        id: 'RES-001', 
        title: 'Smith v. Department of Justice', 
        citation: '582 U.S. 123 (2017)', 
        summary: 'A landmark case regarding the application of the Fourth Amendment to digital records stored by third-party service providers.', 
        relevance: 98, 
        date: '2017-06-22',
        category: 'Case Law'
    },
    { 
        id: 'RES-002', 
        title: 'California Consumer Privacy Act (CCPA)', 
        citation: 'Cal. Civ. Code § 1798.100', 
        summary: 'Comprehensive data privacy law providing California residents with various rights regarding their personal information.', 
        relevance: 92, 
        date: '2018-06-28',
        category: 'Statute'
    },
    { 
        id: 'RES-003', 
        title: 'Internal Memo: Privilege in Multi-Jurisdictional Matters', 
        citation: 'MEMO-2023-042', 
        summary: 'Analysis of attorney-client privilege protections when dealing with cross-border discovery requests in the EU and US.', 
        relevance: 85, 
        date: '2023-11-15',
        category: 'Internal Memo'
    },
    { 
        id: 'RES-004', 
        title: 'SEC Regulation S-K Amendment', 
        citation: '17 CFR § 229.101', 
        summary: 'Updated requirements for human capital disclosures in periodic reports filed by public companies.', 
        relevance: 78, 
        date: '2020-08-26',
        category: 'Regulation'
    },
    { 
        id: 'RES-005', 
        title: 'Doe v. Jones Corp', 
        citation: '2022 NY Slip Op 04567', 
        summary: 'Recent appellate decision on the enforceability of arbitration clauses in consumer contracts with "click-wrap" agreements.', 
        relevance: 75, 
        date: '2022-07-14',
        category: 'Case Law'
    },
];

export const ResearchView: React.FC<{ onOpenAiCommandCenter: (p: string) => void }> = ({ onOpenAiCommandCenter }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedResult, setSelectedResult] = useState<ResearchResult | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        setIsSearching(true);
        setTimeout(() => setIsSearching(false), 1500);
    };

    const filteredResults = useMemo(() => {
        if (!searchQuery) return [];
        return MOCK_RESULTS.filter(r => 
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.citation.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in px-4 lg:px-8 w-full pb-10 pt-2 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-semibold text-text-primary tracking-tight font-serif-display">Legal Research</h1>
                <p className="text-text-dim text-sm font-serif-body italic">Access firm-wide intelligence and global legal precedents.</p>
            </div>

            {/* Search Section */}
            <div className="relative">
                <form onSubmit={handleSearch} className="relative group">
                    <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-dim group-focus-within:text-accent-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search legal precedents, case law, or internal memos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-32 py-5 bg-bg-card border border-divider rounded-[32px] outline-none focus:border-accent-primary/50 transition-all font-serif-body italic text-xl text-text-primary shadow-xl shadow-accent-primary/5"
                    />
                    <button 
                        type="submit"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-accent-primary text-bg-primary px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent-primary/20"
                    >
                        Search
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Results List */}
                <div className="lg:col-span-8 space-y-4">
                    {isSearching ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <Card key={i} className="animate-pulse h-32 bg-bg-secondary/30 border-divider" />
                            ))}
                        </div>
                    ) : searchQuery && filteredResults.length > 0 ? (
                        filteredResults.map((result) => (
                            <Card 
                                key={result.id} 
                                onClick={() => setSelectedResult(result)}
                                className={`p-6 cursor-pointer transition-all border-l-4 hover:shadow-lg group ${
                                    selectedResult?.id === result.id ? 'border-accent-primary bg-accent-primary/5' : 'border-transparent hover:border-divider'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black text-accent-primary uppercase tracking-widest font-sans-ui">{result.category}</span>
                                            <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-2 py-0.5 bg-bg-secondary rounded border border-divider">{result.citation}</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-text-primary group-hover:text-accent-primary transition-colors font-serif-display">{result.title}</h3>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Relevance</div>
                                        <div className="text-lg font-black text-emerald-500 leading-none">{result.relevance}%</div>
                                    </div>
                                </div>
                                <p className="text-text-dim text-sm font-serif-body italic leading-relaxed line-clamp-2">
                                    {result.summary}
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-text-dim uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><ClockIcon className="w-3.5 h-3.5" /> {result.date}</span>
                                        <span className="flex items-center gap-1.5"><ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" /> Verified</span>
                                    </div>
                                    <ChevronRightIcon className="w-5 h-5 text-text-dim group-hover:text-accent-primary transition-all group-hover:translate-x-1" />
                                </div>
                            </Card>
                        ))
                    ) : searchQuery ? (
                        <div className="text-center py-20 opacity-30">
                            <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4" />
                            <p className="font-serif-body italic text-xl">No matching precedents found in Legal Fabric.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-8 bg-bg-secondary/20 border-divider flex flex-col items-center text-center group hover:bg-bg-secondary/40 transition-all cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <ScaleIcon className="w-6 h-6 text-accent-primary" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest mb-2 font-sans-ui text-text-primary">Case Law</h3>
                                <p className="text-xs text-text-dim font-serif-body italic">Search over 2.5M federal and state appellate decisions.</p>
                            </Card>
                            <Card className="p-8 bg-bg-secondary/20 border-divider flex flex-col items-center text-center group hover:bg-bg-secondary/40 transition-all cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <BookOpenIcon className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest mb-2 font-sans-ui text-text-primary">Firm Intelligence</h3>
                                <p className="text-xs text-text-dim font-serif-body italic">Access internal memos, previous filings, and expert opinions.</p>
                            </Card>
                        </div>
                    )}
                </div>

                {/* AI Research Assistant Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 bg-gradient-to-br from-accent-subtle to-bg-card border border-accent-border shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <SparklesIcon className="w-32 h-32" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                                <SparklesIcon className="w-5 h-5 text-accent-primary" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-accent-primary uppercase tracking-widest font-sans-ui">AI Research Assistant</h3>
                                <p className="text-[10px] text-text-dim font-bold uppercase tracking-wider">Legal Fabric v3.1</p>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <p className="text-text-primary font-serif-body italic text-lg leading-relaxed">
                                {searchQuery ? (
                                    `"I've analyzed your query regarding '${searchQuery}'. Based on current trends in the 9th Circuit, there is a growing emphasis on digital privacy rights that may impact your strategy."`
                                ) : (
                                    `"Ready to assist with your research. I can summarize complex case law, identify conflicting precedents, and draft research memos in seconds."`
                                )}
                            </p>
                            
                            <div className="pt-4 border-t border-divider space-y-3">
                                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Suggested Queries</p>
                                <div className="flex flex-wrap gap-2">
                                    {['CCPA Compliance', '4th Amendment Digital', 'Arbitration Clauses'].map(q => (
                                        <button 
                                            key={q}
                                            onClick={() => setSearchQuery(q)}
                                            className="text-[10px] font-bold text-text-primary bg-bg-secondary px-3 py-1.5 rounded-lg border border-divider hover:border-accent-primary transition-all"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => onOpenAiCommandCenter(`Draft research memo for ${searchQuery || 'current topic'}`)}
                                className="w-full mt-4 bg-accent-primary text-bg-primary py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent-primary/20"
                            >
                                Draft Research Memo
                            </button>
                        </div>
                    </Card>

                    {/* Recent Research */}
                    <Card className="p-6 bg-bg-card border border-divider">
                        <h3 className="text-xs font-black text-text-dim uppercase tracking-widest mb-4 font-sans-ui">Recent Research</h3>
                        <div className="space-y-4">
                            {[
                                { title: 'Zoning Laws 2024', date: '2 hours ago' },
                                { title: 'IP Infringement Penalties', date: 'Yesterday' },
                                { title: 'Employment Contract Review', date: '3 days ago' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center text-text-dim group-hover:text-accent-primary transition-colors">
                                        <ClockIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-text-primary group-hover:text-accent-primary transition-colors">{item.title}</p>
                                        <p className="text-[10px] text-text-dim uppercase tracking-wider">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
