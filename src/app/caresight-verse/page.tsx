"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation'; // Import useRouter

// Define your Supabase enums as TypeScript types for better type safety
type AlertStatus = 'Reached' | 'Sent';
type AlertSeen = 'Yes' | 'No';

const EMOTION_DETECTION_DURATION = 10000; // Camera active for 10 seconds
const ALERT_COOLDOWN_DURATION = 5000; // 5 seconds (5000 milliseconds) for alert cooldown
const MODEL_CDN_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
// Initialize Supabase client directly here.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EmotionDetectorPage: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [emotion, setEmotion] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(EMOTION_DETECTION_DURATION / 1000);
    const [error, setError] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // State for user and patient details
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [currentPatientHospitalId, setCurrentPatientHospitalId] = useState<string | null>(null);
    const [currentPatientNurseIds, setCurrentPatientNurseIds] = useState<string[]>([]);
    const [isPatientDetailsLoading, setIsPatientDetailsLoading] = useState(true);

    // Cooldown mechanism for alerts
    const lastAlertTimestampRef = useRef<number>(0);
    const currentNegativeEmotionRef = useRef<string | null>(null);

    const router = useRouter(); // Initialize useRouter

    // Effect to load user and patient details
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userId = localStorage.getItem('user_id');
            const role = localStorage.getItem('role');

            setCurrentUserId(userId);
            setCurrentUserRole(role);

            if (role === 'patients' && userId) {
                const fetchPatientDetails = async () => {
                    setIsPatientDetailsLoading(true);
                    const { data, error: patientError } = await supabase
                        .from('patients')
                        .select('hospital_id, assigned_nurse_ids')
                        .eq('id', userId)
                        .single();

                    if (patientError) {
                        console.error('Error fetching patient details:', patientError.message);
                        setError('Failed to load patient details. Please refresh or contact support.');
                        setCurrentPatientHospitalId(null);
                        setCurrentPatientNurseIds([]);
                    } else if (data) {
                        setCurrentPatientHospitalId(data.hospital_id);
                        setCurrentPatientNurseIds(data.assigned_nurse_ids || []);
                    }
                    setIsPatientDetailsLoading(false);
                };
                fetchPatientDetails();
            } else {
                setIsPatientDetailsLoading(false);
            }
        } else {
            setIsPatientDetailsLoading(false);
        }
    }, []);

    // Callback to load Face-API.js models
    const loadModels = useCallback(async () => {
        try {
            // await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_CDN_URL);
            // await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_CDN_URL);
            // await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_CDN_URL);
            await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceExpressionNet.loadFromUri('/models');
            setLoading(false);
        } catch (err) {
            console.error("Error loading AI models:", err);
            setError("Failed to load AI models from CDN. Please check your internet connection.");
        }
    }, []);

    // Callback to start camera stream
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Failed to access camera. Please grant camera permissions.");
        }
    }, []);

    // Callback to stop camera stream and clear intervals
    const stopCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    }, []);

    // Callback to insert an alert into Supabase
    const insertAlert = useCallback(async (detectedEmotion: string) => {
        if (isPatientDetailsLoading || !currentUserId || currentUserRole !== 'patients' || !currentPatientHospitalId) {
            console.warn('Cannot log alert: Patient details not fully loaded or not logged in as a patient.');
            return;
        }

        const now = Date.now();

        if (now - lastAlertTimestampRef.current < ALERT_COOLDOWN_DURATION) {
            console.log(`Alert system is on global cooldown (${ALERT_COOLDOWN_DURATION / 1000}s). Skipping alert for ${detectedEmotion}.`);
            return;
        }

        const patientIdToLog = currentUserId;
        const hospitalIdToLog = currentPatientHospitalId;
        const nurseIdToLog = currentPatientNurseIds.length > 0 ? currentPatientNurseIds[0] : null;

        setAlertMessage(`Logging ${detectedEmotion} emotion...`);
        try {
            const { data, error } = await supabase
                .from('alert')
                .insert({
                    name: detectedEmotion,
                    patient_id: patientIdToLog,
                    nurse_id: nurseIdToLog,
                    hospital_id: hospitalIdToLog,
                    status: 'Sent' as AlertStatus,
                    seen: 'No' as AlertSeen,
                });

            if (error) {
                throw error;
            }

            console.log('Alert inserted successfully:', data);
            setAlertMessage(`Alert for ${detectedEmotion} logged successfully!`);
            lastAlertTimestampRef.current = now;
            currentNegativeEmotionRef.current = detectedEmotion;
        } catch (err) {
            console.error('Error inserting alert into Supabase:', err);
            setAlertMessage(`Failed to log alert for ${detectedEmotion}: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setTimeout(() => setAlertMessage(null), 3000);
        }
    }, [currentUserId, currentUserRole, currentPatientHospitalId, currentPatientNurseIds, isPatientDetailsLoading]);

    // Callback to detect emotions from the video feed
    const detectEmotions = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) {
            return;
        }

        const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions();

        if (canvasRef.current && detections) {
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const context = canvasRef.current.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
                faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

                const expressions = resizedDetections.expressions;
                if (expressions) {
                    const dominantEmotion = Object.keys(expressions).reduce((a, b) =>
                        expressions[a as keyof faceapi.FaceExpressions] > expressions[b as keyof faceapi.FaceExpressions] ? a : b
                    );
                    setEmotion(dominantEmotion);

                    const triggerEmotions = ['sad', 'fear', 'angry', 'disgust'];

                    if (triggerEmotions.includes(dominantEmotion)) {
                        if (dominantEmotion !== currentNegativeEmotionRef.current) {
                            insertAlert(dominantEmotion);
                        } else {
                            insertAlert(dominantEmotion);
                        }
                        currentNegativeEmotionRef.current = dominantEmotion;
                    } else {
                        currentNegativeEmotionRef.current = null;
                    }
                }
            }
        } else {
            setEmotion(null);
            currentNegativeEmotionRef.current = null;
        }
    }, [insertAlert]);

    // Main useEffect for managing component lifecycle and camera/detection
    useEffect(() => {
        loadModels();
    }, [loadModels]);

    useEffect(() => {
        if (!loading && !error && !isPatientDetailsLoading && currentUserId && currentUserRole === 'patients') {
            startCamera();

            setCountdown(EMOTION_DETECTION_DURATION / 1000);
            countdownIntervalRef.current = setInterval(() => {
                setCountdown(prev => Math.max(0, prev - 1));
            }, 1000);

            const timer = setTimeout(() => {
                stopCamera();
                if (detectionIntervalRef.current) {
                    clearInterval(detectionIntervalRef.current);
                }
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                }
                lastAlertTimestampRef.current = 0;
                currentNegativeEmotionRef.current = null;

                // Redirect to a new link after countdown is 0
                router.push('/caresight-verse/dashboard'); // Replace '/dashboard' with your desired redirection path
            }, EMOTION_DETECTION_DURATION);

            if (videoRef.current) {
                videoRef.current.addEventListener('play', () => {
                    if (!detectionIntervalRef.current) {
                        detectionIntervalRef.current = setInterval(detectEmotions, 100);
                    }
                }, { once: true });
            }

            return () => {
                clearTimeout(timer);
                stopCamera();
            };
        } else if (!loading && !isPatientDetailsLoading && (!currentUserId || currentUserRole !== 'patients')) {
            setError("Please log in as a Patient to use the emotion detection feature.");
        }
    }, [loading, error, currentUserId, currentUserRole, currentPatientHospitalId, currentPatientNurseIds, isPatientDetailsLoading, startCamera, stopCamera, detectEmotions, router]); // Add router to dependencies

    // --- Render Logic (Tailwind CSS) ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-5 text-gray-700">
                Loading AI models from CDN... Please wait...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-5 text-red-700">
                Error: {error}
            </div>
        );
    }

    if (isPatientDetailsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-5 text-gray-700">
                Loading user session...
            </div>
        );
    }

    // Access Denied message if not logged in as a patient
    if (currentUserRole !== 'patients' || !currentUserId || !currentPatientHospitalId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-5 text-gray-700">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-base md:text-lg text-gray-600 mb-4">This feature is only available for registered patients.</p>
                <p className="text-base md:text-lg text-gray-600 mb-8">Please log in as a patient to proceed.</p>
                <button
                    onClick={() => window.location.href = '/auth/login'}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-5 text-gray-700">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Emotion Detector for Patient: {localStorage.getItem('user_name') || 'Unknown'}
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-4">
                Camera will be active for {countdown > 0 ? countdown : 0} seconds...
            </p>
            <div className="relative w-full max-w-2xl aspect-w-4 aspect-h-3 border-2 border-gray-300 rounded-lg overflow-hidden mb-5 shadow-lg">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]" />
            </div>
            {emotion && (
                <div className="text-xl md:text-2xl font-bold text-green-600 mt-5 p-3 px-6 bg-green-50 rounded-md border border-green-400">
                    Detected Emotion: <span className="text-red-700">{emotion.toUpperCase()}</span>
                </div>
            )}
            {!emotion && countdown <= 0 && (
                <div className="text-xl md:text-2xl font-bold text-gray-600 mt-5 p-3 px-6 bg-gray-100 rounded-md border border-gray-300">
                    No face detected or analysis complete.
                </div>
            )}
            {alertMessage && (
                <div className="mt-4 p-3 px-6 bg-red-50 border border-red-500 rounded-md text-red-700 font-bold">
                    {alertMessage}
                </div>
            )}
        </div>
    );
};

export default EmotionDetectorPage;
