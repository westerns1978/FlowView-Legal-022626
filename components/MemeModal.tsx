import React, { useState, useRef, useEffect } from 'react';
import { DownloadIcon, CopyIcon, PhotoIcon, CloseIcon } from './ui/Icons';
import { generateMemeConcept, generateImage } from '../services/geminiService';

interface MemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTopic?: string;
}

interface MemeResult {
    imageUrl: string;
    caption: string;
}

const MemeLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center text-text-secondary">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mb-4"></div>
        <p className="text-lg font-semibold">Generating Meme...</p>
        <p className="text-sm">Our AI is feeling creative. This might take a moment.</p>
    </div>
);

export const MemeModal: React.FC<MemeModalProps> = ({ isOpen, onClose, initialTopic }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [memeResult, setMemeResult] = useState<MemeResult | null>(null);
    const [error, setError] = useState('');
    const [captionCopied, setCaptionCopied] = useState(false);

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
             // Reset state after animation
            setTopic('');
            setMemeResult(null);
            setError('');
        }, 300);
    };

    useEffect(() => {
        if (isOpen) {
            setTopic(initialTopic || '');
            setCaptionCopied(false);
        }
    }, [isOpen, initialTopic]);

    const handleGenerate = async () => {
        if (!topic) {
            setError('Please provide a topic for the meme.');
            return;
        }
        setIsLoading(true);
        setError('');
        setMemeResult(null);

        try {
            const concept = await generateMemeConcept(topic);
            const imageUrl = await generateImage(concept.imagePrompt);
            setMemeResult({ imageUrl, caption: concept.caption });
        } catch (err) {
            console.error(err);
            setError('Sorry, we couldn\'t generate the meme. Please try another topic.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!memeResult) return;
        const link = document.createElement('a');
        link.href = memeResult.imageUrl;
        link.download = `meme-${topic.replace(/\s+/g, '-')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyCaption = () => {
        if (!memeResult) return;
        navigator.clipboard.writeText(memeResult.caption).then(() => {
            setCaptionCopied(true);
            setTimeout(() => setCaptionCopied(false), 2000);
        });
    };

    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={e => e.target === modalRef.current && closeModal()}>
            <div className={`bg-component rounded-xl shadow-2xl w-full max-w-lg transform flex flex-col border border-border-color ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}>
                <div className="flex justify-between items-center p-5 border-b border-border-color">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <PhotoIcon className="w-6 h-6 text-text-secondary"/> Meme Factory
                    </h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="p-5 space-y-4">
                    {!memeResult && !isLoading && (
                        <>
                            <p className="text-sm text-text-secondary">
                                {initialTopic 
                                ? "Let's create a meme to recognize this achievement! You can edit the topic below."
                                : "Enter a topic and let the AI generate a custom meme to share with your team!"
                                }
                            </p>
                            <input
                                value={topic}
                                onChange={e => { setTopic(e.target.value); setError(''); }}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none bg-background border-border-color text-text-primary"
                                placeholder="e.g., When the project finally deploys"
                            />
                            {error && <p className="text-sm text-danger">{error}</p>}
                        </>
                    )}
                    
                    {isLoading && <MemeLoader />}

                    {memeResult && (
                        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                            <img src={memeResult.imageUrl} alt="AI generated meme background" className="w-full h-full object-cover"/>
                            <div
                                className="absolute bottom-0 w-full text-center p-4 text-white font-bold text-2xl"
                                style={{ textShadow: '2px 2px 4px #000000' }}
                            >
                                {memeResult.caption}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4 p-4 border-t border-border-color bg-component-lighter rounded-b-xl">
                    <p className="text-xs text-text-secondary">Let's keep it positive and fun! 🎉</p>
                    {memeResult ? (
                        <div className="flex items-center gap-2">
                            <button onClick={handleCopyCaption} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border-color transition flex items-center gap-2 border border-border-color">
                                <CopyIcon className="w-5 h-5" /> {captionCopied ? 'Copied!' : 'Copy Caption'}
                            </button>
                            <button onClick={handleDownload} className="bg-success text-white font-semibold py-2 px-4 rounded-lg hover:bg-success/90 transition flex items-center gap-2">
                                <DownloadIcon className="w-5 h-5" /> Download
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleGenerate} disabled={isLoading} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent transition disabled:bg-primary/70 disabled:cursor-not-allowed">
                           {isLoading ? 'Generating...' : 'Generate Meme'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};