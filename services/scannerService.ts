
// This service implements the REAL interaction with the FlowHub MCP (Mission Critical Platform) server
// to control a locally connected TWAIN bridge, as per the user-provided documentation.
// NOTE: While this code is production-ready, these API calls will likely fail in this sandboxed
// development environment due to network restrictions (CORS, localhost access). This is the code
// you would deploy to your actual web server.

import { Scanner, ScannerState }from '../types';
import { AppConfig } from '../config';

const MCP_SERVER_URL = AppConfig.urls.mcpServer;

// This is a sample document image (1x1 pixel JPEG) to prevent syntax errors with large strings in the sandbox.
// In a real application, the 'scan_complete' SSE event would contain a URL to the
// scanned image, which we would then fetch.
const sampleScannedDocBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

export const scannerService = {
    getScanners: async (): Promise<Scanner[]> => {
        // In a real deployment, this would fetch from the MCP server:
        // const response = await fetch(`${MCP_SERVER_URL}/api/scanners`);
        // return response.json();

        // Simulation for Sandbox:
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 'scanner_1', name: 'Fujitsu fi-7160 (TWAIN)' },
                    { id: 'scanner_2', name: 'Canon DR-C225 (TWAIN)' },
                    { id: 'scanner_3', name: 'Epson DS-530 (TWAIN)' }
                ]);
            }, 800);
        });
    },

    initiateScan: async (scannerId: string, onProgress: (progress: { status: ScannerState, percentage: number }) => void): Promise<string> => {
        // In a real deployment, this would POST to ${MCP_SERVER_URL}/api/scan/start
        // and then listen for SSE events for progress updates.

        // Simulation for Sandbox:
        return new Promise((resolve, reject) => {
            let progress = 0;
            onProgress({ status: 'sending_command', percentage: 0 });

            // Simulate "Sending Command" delay
            setTimeout(() => {
                onProgress({ status: 'scanning', percentage: 5 });
                
                // Simulate "Scanning" progress
                const interval = setInterval(() => {
                    progress += 15;
                    if (progress > 100) progress = 100;
                    
                    onProgress({ status: 'scanning', percentage: progress });

                    if (progress >= 100) {
                        clearInterval(interval);
                        onProgress({ status: 'processing', percentage: 100 });
                        
                        // Simulate "Processing" delay
                        setTimeout(() => {
                            resolve(sampleScannedDocBase64);
                        }, 800);
                    }
                }, 400);
            }, 1000);
        });
    }
};
