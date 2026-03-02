
import { C2PAManifest } from '../types';
import { AppConfig } from '../config';

// This service simulates the creation of a valid C2PA Manifest Structure.
// In a real environment, this would be handled by the c2pa-rs (Rust) library via Wasm.
// Here we structure the JSON to match the C2PA 1.3 Specification for educational/demo purposes.

export const c2paService = {
    
    generateManifest: (title: string, type: string, data: any): C2PAManifest => {
        const now = new Date().toISOString();
        const instanceId = `xmp:iid:${crypto.randomUUID()}`;
        
        return {
            label: "active-manifest",
            claim_generator: `FlowView Engine ${AppConfig.version}`,
            title: title,
            format: "application/json",
            instance_id: instanceId,
            ingredients: [], // In a real workflow, this would list the source files (e.g., the raw scan)
            assertions: [
                {
                    label: "c2pa.actions",
                    data: {
                        actions: [
                            {
                                action: "c2pa.created",
                                softwareAgent: `FlowView ${AppConfig.version}`,
                                when: now
                            }
                        ]
                    }
                },
                {
                    label: "com.flowview.data", // Custom assertion for our business data
                    data: data
                }
            ],
            signature_info: {
                issuer: "FlowHub Trust Anchor (Simulated CA)",
                time: now
            }
        };
    },

    verifyManifest: (manifest: C2PAManifest): boolean => {
        // Simulation: Verify if the issuer is trusted and the manifest has data
        if (!manifest) return false;
        const isTrusted = manifest.signature_info.issuer.includes("FlowHub") || manifest.signature_info.issuer.includes("Barlea");
        return isTrusted;
    },

    // Hash simulation for "binding" the data to the manifest
    generateContentHash: async (content: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return 'sha256-' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
};
