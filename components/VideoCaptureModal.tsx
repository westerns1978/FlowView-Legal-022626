
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CloseIcon, CameraIcon } from './ui/Icons';

interface VideoCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCaptureComplete: (videoBlob: Blob) => void;
}

type CaptureState = 'idle' | 'requesting' | 'previewing' | 'recording' | 'recorded' | 'error';

export const VideoCaptureModal: React.FC<VideoCaptureModalProps> = ({ isOpen, onClose, onCaptureComplete }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [captureState, setCaptureState] = useState<CaptureState>('idle');
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [stream, setStream] = useState<MediaStream | null>(null);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const closeModal = useCallback(() => {
        setIsAnimatingOut(true);
        stopStream();
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    }, [onClose, stopStream]);

    useEffect(() => {
        if (isOpen) {
            setCaptureState('requesting');
            setErrorMessage('');
            setRecordedChunks([]);
            setVideoUrl(null);
            
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(mediaStream => {
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                    setCaptureState('previewing');
                })
                .catch(err => {
                    console.error("Error accessing media devices.", err);
                    setErrorMessage("Camera and microphone access denied. Please check browser permissions.");
                    setCaptureState('error');
                });
        } else {
            stopStream();
        }
        return () => stopStream();
    }, [isOpen, stopStream]);

    const startRecording = () => {
        if (stream) {
            setRecordedChunks([]);
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = event => {
                if (event.data.size > 0) {
                    setRecordedChunks(prev => [...prev, event.data]);
                }
            };
            mediaRecorderRef.current.onstop = () => {
                const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(videoBlob);
                setVideoUrl(url);
                setCaptureState('recorded');
            };
            mediaRecorderRef.current.start();
            setCaptureState('recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && captureState === 'recording') {
            mediaRecorderRef.current.stop();
            stopStream();
        }
    };

    const handleAttach = () => {
        if (recordedChunks.length > 0) {
            const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
            onCaptureComplete(videoBlob);
            closeModal();
        }
    };
    
    const handleRetake = () => {
        setCaptureState('idle');
        // Re-trigger useEffect to request permissions again
        setTimeout(() => setCaptureState('requesting'), 50);
    };

    const renderContent = () => {
        switch(captureState) {
            case 'requesting':
                return <div className="p-8 text-center text-text-secondary">Requesting camera access...</div>;
            case 'error':
                return <div className="p-8 text-center text-danger">{errorMessage}</div>;
            case 'previewing':
            case 'recording':
            case 'recorded':
                return <video ref={videoRef} src={videoUrl || undefined} autoPlay={captureState !== 'recorded'} playsInline muted={captureState !== 'recorded'} controls={captureState === 'recorded'} className="w-full h-auto bg-black rounded-b-xl" />;
        }
    };
    
    const renderFooter = () => {
        switch(captureState) {
            case 'previewing':
                return <button onClick={startRecording} className="bg-danger text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2">Record</button>;
            case 'recording':
                return <button onClick={stopRecording} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg animate-pulse flex items-center gap-2">Stop Recording</button>;
            case 'recorded':
                return (
                    <>
                        <button onClick={handleRetake} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border-color border border-border-color">Retake</button>
                        <button onClick={handleAttach} className="bg-success text-white font-semibold py-2 px-4 rounded-lg">Attach Video</button>
                    </>
                );
            default:
                return <button onClick={closeModal} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border-color border border-border-color">Cancel</button>;
        }
    };

    if (!isOpen) return null;

    return (
         <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60] backdrop-blur-sm" onClick={e => e.target === modalRef.current && closeModal()}>
            <div className={`bg-component rounded-xl shadow-2xl w-full max-w-lg transform flex flex-col border border-border-color ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}>
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="text-lg font-bold text-text-primary flex items-center gap-2"><CameraIcon className="w-6 h-6 text-primary"/> Record Video Note</h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <div className="flex-grow flex items-center justify-center">
                    {renderContent()}
                </div>
                <div className="flex items-center justify-end gap-3 p-4 border-t border-border-color bg-component-lighter rounded-b-xl">
                    {renderFooter()}
                </div>
            </div>
        </div>
    );
};
