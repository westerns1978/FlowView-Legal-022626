import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, SparklesIcon, WarningIcon } from './ui/Icons';
import { scannerService } from '../services/scannerService';
import { ScannerState, Scanner } from '../types';

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanComplete: (imageData: string) => void;
}

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-border-color rounded-full h-2 my-2 overflow-hidden relative">
        <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

const statusMessages: { [key in ScannerState]?: string } = {
    fetching_scanners: 'Searching for connected scanners...',
    sending_command: 'Sending command to scanner...',
    scanning: 'Scanner is acquiring the image...',
    processing: 'Processing and retrieving image...',
};

export const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScanComplete }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [scanners, setScanners] = useState<Scanner[]>([]);
    const [selectedScannerId, setSelectedScannerId] = useState<string>('');
    const [scannerState, setScannerState] = useState<ScannerState>('idle');
    const [progress, setProgress] = useState(0);
    const [scannedImage, setScannedImage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchScanners = async () => {
        setScannerState('fetching_scanners');
        setErrorMessage('');
        try {
            const availableScanners = await scannerService.getScanners();
            if (availableScanners.length > 0) {
                setScanners(availableScanners);
                setSelectedScannerId(availableScanners[0].id);
                setScannerState('ready');
            } else {
                setScannerState('no_scanners_found');
            }
        } catch (error) {
            setScannerState('error');
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred while finding scanners.');
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Reset state on open and fetch scanners
            setScanners([]);
            setSelectedScannerId('');
            setScannedImage(null);
            setProgress(0);
            fetchScanners();
        }
    }, [isOpen]);

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };

    const handleStartScan = async () => {
        if (!selectedScannerId) {
            setErrorMessage('Please select a scanner.');
            return;
        }
        setErrorMessage('');
        
        try {
            const image = await scannerService.initiateScan(selectedScannerId, (p) => {
                setScannerState(p.status);
                setProgress(p.percentage);
            });
            setScannedImage(image);
            setScannerState('complete');
        } catch (error) {
            setScannerState('error');
            setErrorMessage(error instanceof Error ? error.message : 'An unknown scanning error occurred.');
        }
    };

    const handleAttach = () => {
        if (scannedImage) {
            onScanComplete(scannedImage);
            closeModal();
        }
    };
    
    const renderContent = () => {
        const progressMessage = statusMessages[scannerState];
        if (progressMessage) {
            return (
                <div className="text-center p-8">
                    <h4 className="font-semibold text-lg text-text-primary mb-2">{progressMessage}</h4>
                    <ProgressBar progress={progress} />
                </div>
            );
        }

        switch (scannerState) {
            case 'no_scanners_found':
                return (
                     <div className="p-6 text-center">
                        <WarningIcon className="w-12 h-12 text-warning mx-auto mb-3" />
                        <h4 className="font-semibold text-lg text-text-primary mb-2">No Scanners Found</h4>
                        <p className="text-sm text-text-secondary mb-4">Please ensure your FlowHub TWAIN Bridge is running and your scanner is connected and powered on.</p>
                        <button onClick={fetchScanners} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border-color transition border border-border-color">
                            Retry
                        </button>
                    </div>
                )
            case 'complete':
                return (
                    <div className="p-6 space-y-4">
                        <h4 className="font-semibold text-text-primary">Scan Preview</h4>
                        <div className="rounded-lg border-2 border-border-color overflow-hidden bg-background">
                             {scannedImage && <img src={scannedImage} alt="Scanned document" className="w-full h-auto" />}
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center p-8">
                        <h4 className="font-semibold text-lg text-danger mb-2">An Error Occurred</h4>
                        <p className="text-sm text-text-secondary mb-4">{errorMessage}</p>
                        <button onClick={fetchScanners} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border-color transition border border-border-color">
                            Try Again
                        </button>
                    </div>
                );
            case 'ready':
                return (
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="scannerSelect" className="text-sm font-semibold text-text-primary">Select Scanner</label>
                            <select
                                id="scannerSelect"
                                value={selectedScannerId}
                                onChange={e => setSelectedScannerId(e.target.value)}
                                className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none bg-background border-border-color text-text-primary"
                            >
                                {scanners.map(scanner => (
                                    <option key={scanner.id} value={scanner.id}>{scanner.name}</option>
                                ))}
                            </select>
                            {errorMessage && <p className="text-sm text-danger mt-1">{errorMessage}</p>}
                        </div>
                        <p className="text-xs text-text-secondary">Place your document in the scanner and click "Start Scan" to begin.</p>
                    </div>
                );
            case 'idle':
            default:
                 return <div className="p-8"></div>; // Initial blank state before fetch begins
        }
    }

    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60] backdrop-blur-sm" onClick={e => e.target === modalRef.current && closeModal()}>
            <div className={`bg-component rounded-xl shadow-2xl w-full max-w-md transform flex flex-col border border-border-color ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}>
                <div className="flex justify-between items-center p-5 border-b border-border-color">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">FlowHub TWAIN Bridge</h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </div>
                
                {renderContent()}

                <div className="flex items-center justify-end gap-3 p-4 border-t border-border-color bg-component-lighter rounded-b-xl">
                    <button onClick={closeModal} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border-color transition border border-border-color">
                        Cancel
                    </button>
                    {scannerState === 'complete' ? (
                        <button onClick={handleAttach} className="bg-success text-white font-semibold py-2 px-4 rounded-lg hover:bg-success/90 transition">
                            Attach Scan
                        </button>
                    ) : (
                        <button onClick={handleStartScan} disabled={scannerState !== 'ready'} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent transition disabled:opacity-50">
                            Start Scan
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
