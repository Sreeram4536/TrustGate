import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, RefreshCw, AlertCircle, ShieldCheck, PlayCircle, Loader2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

type Mode = 'image' | 'video';
type PermissionStatus = 'prompt' | 'granted' | 'denied';

const KYC: React.FC = () => {
    const [mode, setMode] = useState<Mode>('image');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Permission State
    const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('prompt');
    const [error, setError] = useState<string>('');
    const [stream, setStream] = useState<MediaStream | null>(null);

    // Image State
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // Video State
    const [isRecording, setIsRecording] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected' | 'not_submitted' | 'loading'>('loading');

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            await api.post('/auth/logout', { refreshToken });
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userRole');
            navigate('/login');
        }
    };

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await api.get('/kyc/status');
                setKycStatus(response.data.status || 'pending');
            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    setKycStatus('not_submitted');
                } else {
                    console.error('Error fetching KYC status', err);
                    setKycStatus('not_submitted'); // Default to form if error? Or keep loading?
                }
            }
        };
        fetchStatus();

        // Cleanup on unmount
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const setVideoRef = React.useCallback((node: HTMLVideoElement | null) => {
        videoRef.current = node;
        if (node && stream) {
            node.srcObject = stream;
        }
    }, [stream]);

    const startCamera = async () => {
        try {
            setError('');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
            });
            setStream(mediaStream);
            streamRef.current = mediaStream;
            setPermissionStatus('granted');
        } catch (err: any) {
            console.error(err);
            setPermissionStatus('denied');
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError('Camera/Microphone permission was denied. Please allow access in your browser settings.');
            } else {
                setError('Could not access camera. Please ensure a camera is connected.');
            }
        }
    };

    const switchMode = (newMode: Mode) => {
        if (isRecording) return;
        setMode(newMode);
        // Do NOT clear state unless necessary
    };

    // --- Image Logic ---
    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current || !stream) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageUrl = canvas.toDataURL('image/png', 1.0);
            setCapturedImage(imageUrl);
        }
    };

    const retakeImage = () => {
        setCapturedImage(null);
    };

    // --- Video Logic ---
    const startRecording = () => {
        if (!stream) return;

        chunksRef.current = [];
        try {
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (e) {
            setError('Failed to start recording. Video format might not be supported.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const retakeVideo = () => {
        setVideoUrl(null);
    }

    // --- Upload Logic ---
    const dataURLtoFile = (dataurl: string, filename: string) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const submitKYC = async () => {
        if (!capturedImage || !videoUrl) {
            setError("Please complete both image and video steps.");
            return;
        }

        setUploading(true);
        setError('');

        try {
            const imageFile = dataURLtoFile(capturedImage, 'kyc_image.png');
            const videoBlob = await fetch(videoUrl).then(r => r.blob());
            const videoFile = new File([videoBlob], 'kyc_video.webm', { type: 'video/webm' });

            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('video', videoFile);

            await api.post('/kyc/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setKycStatus('pending');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to upload KYC data.');
        } finally {
            setUploading(false);
        }
    };

    if (kycStatus === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (kycStatus !== 'not_submitted') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <ShieldCheck className={`w-16 h-16 mx-auto mb-4 ${kycStatus === 'approved' ? 'text-green-500' :
                        kycStatus === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                        }`} />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {kycStatus === 'approved' ? 'Verification Approved' :
                            kycStatus === 'rejected' ? 'Verification Rejected' : 'Verification Pending'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {kycStatus === 'approved' ? 'Your identity has been successfully verified.' :
                            kycStatus === 'rejected' ? 'Your submission was not approved. Please contact support.' :
                                'Your documents have been received and are being reviewed.'}
                    </p>

                    {kycStatus === 'rejected' && (
                        <button
                            onClick={() => setKycStatus('not_submitted')}
                            className="w-full mb-3 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition"
                        >
                            Try Again
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition"
                    >
                        Log Out
                    </button>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <ShieldCheck className="w-8 h-8 text-indigo-600 mr-2" />
                        KYC Verification
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition flex items-center"
                    >
                        <LogOut className="w-5 h-5 mr-2" /> Logout
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col md:flex-row">

                    {/* Sidebar */}
                    <div className="md:w-72 bg-gray-50 border-r border-gray-100 p-6 flex flex-col gap-4">
                        <div className='mb-4'>
                            <h3 className="text-lg font-bold text-gray-800">Checklist</h3>
                            <div className="mt-2 space-y-2">
                                <div className={`flex items-center text-sm ${capturedImage ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${capturedImage ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    Image Captured
                                </div>
                                <div className={`flex items-center text-sm ${videoUrl ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                                    <div className={`w-2 h-2 rounded-full mr-2 ${videoUrl ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    Video Recorded
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => switchMode('image')}
                            className={`flex items-center p-4 rounded-xl transition-all duration-200 border text-left ${mode === 'image'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-600'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'}`}
                        >
                            <Camera className="w-6 h-6 mr-3 flex-shrink-0" />
                            <div>
                                <span className="font-semibold block">Step 1: Photo</span>
                            </div>
                        </button>

                        <button
                            onClick={() => switchMode('video')}
                            className={`flex items-center p-4 rounded-xl transition-all duration-200 border text-left ${mode === 'video'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-600'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'}`}
                        >
                            <Video className="w-6 h-6 mr-3 flex-shrink-0" />
                            <div>
                                <span className="font-semibold block">Step 2: Video</span>
                            </div>
                        </button>

                        {capturedImage && videoUrl && (
                            <button
                                onClick={submitKYC}
                                disabled={uploading}
                                className="mt-6 w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transform transition active:scale-95 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</>
                                ) : (
                                    <>Submit KYC <ShieldCheck className="w-5 h-5 ml-2" /></>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 flex flex-col bg-gray-50/30">
                        {error && (
                            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 flex items-center shadow-sm">
                                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 rounded-2xl overflow-hidden relative shadow-inner aspect-video max-h-[500px] border-4 border-gray-900 group">

                            {permissionStatus === 'prompt' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white p-6 text-center z-10">
                                    <Camera className="w-16 h-16 mb-4 text-gray-400" />
                                    <h3 className="text-xl font-bold mb-2">Camera Access Required</h3>
                                    <p className="text-gray-400 mb-6 max-w-sm">We need access to your camera and microphone to verify your identity.</p>
                                    <button onClick={startCamera} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full font-bold transition">Allow Access</button>
                                </div>
                            )}

                            {permissionStatus === 'denied' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white p-6 text-center z-10">
                                    <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
                                    <h3 className="text-xl font-bold mb-2">Access Denied</h3>
                                    <p className="text-gray-400 mb-6 max-w-sm">We cannot proceed without camera access. Please check your browser permission settings.</p>
                                    <button onClick={startCamera} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-full font-bold transition">Try Again</button>
                                </div>
                            )}

                            {permissionStatus === 'granted' && !((mode === 'image' && capturedImage) || (mode === 'video' && videoUrl)) && (
                                <>
                                    <video ref={setVideoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                                    {isRecording && (
                                        <div className="absolute top-4 right-4 flex items-center px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                                            <div className="w-2 h-2 bg-white rounded-full mr-2"></div> REC
                                        </div>
                                    )}
                                </>
                            )}

                            {mode === 'image' && capturedImage && (
                                <img src={capturedImage} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
                            )}

                            {mode === 'video' && videoUrl && (
                                <video src={videoUrl} controls className="absolute inset-0 w-full h-full object-contain bg-black" />
                            )}

                            <canvas ref={canvasRef} className="hidden" />
                        </div>

                        {/* Control Buttons */}
                        <div className="mt-8 flex justify-center gap-6">
                            {permissionStatus === 'granted' && (
                                <>
                                    {mode === 'image' && !capturedImage && (
                                        <button onClick={captureImage} className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg transition active:scale-95">
                                            <Camera className="w-5 h-5 mr-2" /> Capture Photo
                                        </button>
                                    )}
                                    {mode === 'image' && capturedImage && (
                                        <button onClick={retakeImage} className="flex items-center px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-full font-semibold transition shadow-sm">
                                            <RefreshCw className="w-5 h-5 mr-2" /> Retake
                                        </button>
                                    )}

                                    {mode === 'video' && !videoUrl && !isRecording && (
                                        <button onClick={startRecording} className="flex items-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg transition active:scale-95">
                                            <PlayCircle className="w-5 h-5 mr-2" /> Start Recording
                                        </button>
                                    )}
                                    {mode === 'video' && isRecording && (
                                        <button onClick={stopRecording} className="flex items-center px-8 py-3 bg-red-800 text-white rounded-full font-bold shadow-lg animate-pulse">
                                            <div className="w-3 h-3 bg-white rounded-full mr-2"></div> Stop Recording
                                        </button>
                                    )}
                                    {mode === 'video' && videoUrl && (
                                        <button onClick={retakeVideo} className="flex items-center px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-full font-semibold transition shadow-sm">
                                            <RefreshCw className="w-5 h-5 mr-2" /> Record Again
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default KYC;
