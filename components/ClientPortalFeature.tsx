import React from 'react';
import { SparklesIcon, TargetIcon, UserGroupIcon } from './ui/Icons';

const FeatureCard: React.FC<{ title: string; description: string; children: React.ReactNode; icon: React.ReactNode; }> = ({ title, description, children, icon }) => (
    <div className="bg-component p-6 rounded-lg border border-border-color">
        <div className="flex items-start gap-4 mb-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary">{description}</p>
            </div>
        </div>
        <div className="prose prose-sm max-w-none prose-p:text-text-secondary prose-li:text-text-secondary prose-strong:text-text-primary">
            {children}
        </div>
    </div>
);

export const ClientPortalFeature: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                 <h2 className="text-2xl font-bold text-text-primary">Client Portal Vision</h2>
                 <p className="text-text-secondary mt-1">Transforming the portal from a utility to an indispensable strategic asset.</p>
            </div>

            <FeatureCard
                title="The 'Strategic Value Compass'"
                description="Empowers clients to move from reactive problem-solving to proactive strategic planning."
                icon={<TargetIcon className="w-6 h-6" />}
            >
                <p><strong>Primary Client Benefit:</strong> This feature provides personalized, data-driven recommendations to optimize their technology landscape, identify growth opportunities, and ensure tech investments align with their evolving business goals. It solidifies our role as a trusted strategic advisor.</p>
                
                <h4 className="font-semibold text-text-primary mt-4">How it Works:</h4>
                <ul>
                    <li><strong>Data Aggregation:</strong> Securely aggregates data from service consumption patterns, their current technology stack, and relevant industry benchmarks.</li>
                    <li><strong>Predictive Analytics & Recommendations:</strong> Identifies optimization opportunities (e.g., "Upgrading X module could boost performance by Y%"), growth accelerators (e.g., "Consider AI-driven automation for customer service, projected ROI of Z%"), and risk mitigation warnings.</li>
                    <li><strong>Interactive Dashboard:</strong> Presents recommendations with supporting data, projected ROI, and direct links to relevant services or a consultation scheduling tool.</li>
                    <li><strong>Feedback Loop:</strong> Clients can provide feedback on recommendations, further refining the AI's understanding of their unique needs over time.</li>
                </ul>
            </FeatureCard>

            <FeatureCard
                title="The 'Innovation Co-Pilot'"
                description="A collaborative ideation and development sandbox to co-create solutions with our experts."
                icon={<UserGroupIcon className="w-6 h-6" />}
            >
                <p><strong>Primary Client Benefit:</strong> This deepens the relationship by moving beyond service delivery to shared innovation, positioning us as an extension of their R&D efforts.</p>
                 <h4 className="font-semibold text-text-primary mt-4">How it Works:</h4>
                 <ul>
                    <li><strong>Project Workspaces:</strong> Clients can initiate "Innovation Briefs" or "Challenge Statements" (e.g., "How can we leverage IoT to optimize our supply chain?"), inviting our experts to collaborate.</li>
                    <li><strong>Shared Whiteboarding & Design Tools:</strong> Virtual canvases for sketching architectures, mapping processes, or brainstorming concepts collaboratively.</li>
                    <li><strong>Version-Controlled Document Collaboration:</strong> Securely share and co-edit complex documents like RFPs, technical specifications, or strategic roadmaps.</li>
                    <li><strong>Concept Gallery & Resource Library:</strong> A curated section for our R&D concepts and a library of relevant research to support innovation efforts.</li>
                </ul>
            </FeatureCard>
            
            <FeatureCard
                title="The 'Business Impact Barometer'"
                description="Provides undeniable proof of the tangible value and return on investment (ROI) derived from our services."
                icon={<SparklesIcon className="w-6 h-6" />}
            >
                <p><strong>Primary Client Benefit:</strong> Translates technical performance into clear business outcomes, helping clients justify their technology expenditures and demonstrate success to internal stakeholders. This elevates our services from a cost to a strategic investment.</p>
                <h4 className="font-semibold text-text-primary mt-4">How it Works:</h4>
                 <ul>
                    <li><strong>Configurable KPI Mapping:</strong> Clients can securely integrate or input their own business metrics (e.g., sales conversion rates, customer satisfaction scores) and map them against the tech services they consume from us.</li>
                    <li><strong>Performance & Impact Visualization:</strong> Shows before-and-after comparisons (e.g., "customer onboarding time decreased by 30%") and quantifies financial benefits (e.g., "managed IT services saved an estimated $X annually").</li>
                    <li><strong>Customizable Reporting:</strong> Clients can generate on-demand reports tailored for specific internal stakeholders (finance reviews, board meetings, etc.).</li>
                </ul>
            </FeatureCard>

        </div>
    );
};
