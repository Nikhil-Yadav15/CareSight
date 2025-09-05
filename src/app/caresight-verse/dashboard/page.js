'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { createClient } from '@/lib/supabaseClient';
import { animateScroll as scroll } from 'react-scroll';

export default function EyeGazeControlPage() {
  // YouTube gaze states
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isYouTubePlaying, setIsYouTubePlaying] = useState(false);
//   const [youtubeIframe, setYoutubeIframe] = useState(null);
  const youTubeVideos = [
    { 
      id: "tgbNymZ7vqY",
      title: "Movie 1" 
    },
    { 
      id: "dQw4w9WgXcQ",
      title: "Movie 2" 
    },
    { 
      id: "9bZkp7q19f0",
      title: "Movie 3" 
    },
    { 
      id: "kJQP7kiw5Fk",
      title: "Movie 4" 
    }
  ];
  
  //   !
  const generateYouTubeURL = (videoId, isPlaying) => {
      if (isPlaying) {
          return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&controls=1&rel=0&mute=1`;
        } else {
            return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=1&rel=0&mute=0`;
        }
    };
    
    const [currentYouTubeVideo, setCurrentYouTubeVideo] = useState(
        generateYouTubeURL(youTubeVideos[0]?.id, false)
      );
//   useEffect(() => {
//     const iframe = document.getElementById('youtube-player');
//     setYoutubeIframe(iframe);
//   }, [currentYouTubeVideo]);

  const supabase = createClient();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const gazeStartTimeRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const lastGazedButtonRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gazeDirection, setGazeDirection] = useState({ x: 0.5, y: 0.5 });
  const [patientData, setPatientData] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);
  const [gazeProgress, setGazeProgress] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState([]);
  const [currentCalibrationPoint, setCurrentCalibrationPoint] = useState(0);
  const [activatedButton, setActivatedButton] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [mappingParams, setMappingParams] = useState({ a_x: 1, b_x: 0, a_y: 1, b_y: 0 });

  // Emotion detection states
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [emotionConfidence, setEmotionConfidence] = useState(0);
  const [emotionStats, setEmotionStats] = useState({});
  const [showEmotionDetails, setShowEmotionDetails] = useState(false);
  const [emotionAlerts, setEmotionAlerts] = useState([]);

  // Add delay in emotion detection
  const [emotionBuffer, setEmotionBuffer] = useState([]);
  const [lastEmotionUpdate, setLastEmotionUpdate] = useState(0);
  const [isEmotionProcessing, setIsEmotionProcessing] = useState(false);

  // Entertainment
  const [showEntertainmentOptions, setShowEntertainmentOptions] = useState(false);
  const [spotifyLink, setSpotifyLink] = useState("https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M");

  const EMOTION_DETECTION_DELAY = 2500;
  const EMOTION_BUFFER_SIZE = 15;
  const EMOTION_STABILITY_THRESHOLD = 0.6;
  const GAZE_THRESHOLD = 2000;
  const EMOTION_HISTORY_LIMIT = 10;
  const EMOTION_CONFIDENCE_THRESHOLD = 0.3;

  const CALIBRATION_POINTS = [
    { x: 0.1, y: 0.1, label: 'Top Left' },
    { x: 0.9, y: 0.1, label: 'Top Right' },
    { x: 0.5, y: 0.5, label: 'Center' },
    { x: 0.1, y: 0.9, label: 'Bottom Left' },
    { x: 0.9, y: 0.9, label: 'Bottom Right' },
  ];

  const EMOTION_COLORS = {
    happy: '#22c55e',
    sad: '#3b82f6',
    angry: '#ef4444',
    fearful: '#a855f7',
    disgusted: '#eab308',
    surprised: '#f97316',
    neutral: '#6b7280',
  };

  const EMOTION_ICONS = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fearful: '😨',
    disgusted: '🤢',
    surprised: '😲',
    neutral: '😐',
  };

  const buttons = [
    { id: 'call-nurse', label: 'Call Nurse', icon: '👩‍⚕️', color: 'bg-red-500' },
    { id: 'water', label: 'Water', icon: '💧', color: 'bg-blue-500' },
    { id: 'food', label: 'Food', icon: '🍽️', color: 'bg-green-500' },
    { id: 'pain', label: 'Pain', icon: '😣', color: 'bg-orange-500' },
    { id: 'bathroom', label: 'Bathroom', icon: '🚽', color: 'bg-purple-500' },
    { id: 'tv', label: 'TV Control', icon: '📺', color: 'bg-gray-500' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎭', color: 'bg-yellow-500' },
    { id: 'scroll-up', label: 'Scroll Up', icon: '⬆️', color: 'bg-indigo-500' },
    { id: 'scroll-down', label: 'Scroll Down', icon: '⬇️', color: 'bg-indigo-500' },
    { id: 'arijit', name: 'Arijit Singh', link: 'https://open.spotify.com/embed/artist/4YRxDV8wJFPHPTeXepOstw', icon: '🎤', color: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { id: 'lata', name: 'Lata Mangeshkar', link: 'https://open.spotify.com/embed/artist/2Yy3eGqvHguKx2cV1xUHi3', icon: '🎵', color: 'bg-gradient-to-r from-pink-500 to-rose-600' },
    { id: 'rahman', name: 'A.R. Rahman', link: 'https://open.spotify.com/embed/artist/1mYsTxnqsietFxj1OgoGbG', icon: '🎹', color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },
    { id: 'shreya', name: 'Shreya Ghoshal', link: 'https://open.spotify.com/embed/artist/0oOet2f43PA68X5RxKobEy', icon: '🌟', color: 'bg-gradient-to-r from-purple-500 to-violet-600' },
    { id: 'kishore', name: 'Kishore Kumar', link: 'https://open.spotify.com/embed/artist/3ZztOxur7Gw8pPjZnoNJ8a', icon: '🎭', color: 'bg-gradient-to-r from-orange-500 to-red-600' },
    { id: 'rahat', name: 'Rahat Fateh Ali Khan', link: 'https://open.spotify.com/embed/artist/2FKWNmZWDBZR4dE5KX4plR', icon: '🕌', color: 'bg-gradient-to-r from-teal-500 to-cyan-600' },
    { id: 'sonu', name: 'Sonu Nigam', link: 'https://open.spotify.com/embed/artist/25uiPmTg16RbhZWAqwLBy5', icon: '🎶', color: 'bg-gradient-to-r from-yellow-500 to-amber-600' },
    { id: 'udit', name: 'Udit Narayan', link: 'https://open.spotify.com/embed/artist/70B80Lwx2sxti0M1Ng9e8K', icon: '🌅', color: 'bg-gradient-to-r from-emerald-500 to-green-600' },
    { id: 'krishna', name: 'Krishna Bhajan', link: 'https://open.spotify.com/embed/playlist/1MZEK0q8uxzfrWJuK1NB1Y', icon: '🙏', color: 'bg-gradient-to-r from-indigo-500 to-purple-600' },
    { id: 'bollywood', name: 'Bollywood Hits', link: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd', icon: '🎬', color: 'bg-gradient-to-r from-red-500 to-pink-600' },
    { id: 'back-to-menu', label: 'Back to Menu', icon: '⬅️', color: 'bg-gradient-to-r from-red-500 to-pink-600' },
    { id: 'youtube-prev', label: 'Previous Video', icon: '⏮️', color: 'bg-red-600' },
    { id: 'youtube-play-pause', label: 'Play/Pause', icon: '⏯️', color: 'bg-green-600' },
    { id: 'youtube-next', label: 'Next Video', icon: '⏭️', color: 'bg-red-600' },
    { id: 'youtube-stop', label: 'Stop', icon: '⏹️', color: 'bg-gray-600' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          setError('User ID not found in localStorage');
          setLoading(false);
          return;
        }

        const { data: patient, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', userId)
          .single();

        if (patientError || !patient) {
          throw new Error(`Patient data not found: ${patientError?.message || 'Unknown error'}`);
        }

        setPatientData(patient);
        console.log('✅ Patient data loaded:', patient);

      } catch (err) {
        console.error('❌ Fetch patient error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
        faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
      ]);
      setIsLoaded(true);
      startVideo();
    } catch (error) {
      console.error('Error loading models:', error);
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        setIsLoaded(true);
        startVideo();
      } catch (localError) {
        console.error('Error loading local models:', localError);
        showNotification('❌ Failed to load face detection models', 'error');
      }
    }
  };

  const patientDataRef = useRef(null);
  useEffect(() => {
    patientDataRef.current = patientData;
  }, [patientData]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      showNotification('❌ Failed to access camera', 'error');
    }
  };

  const processEmotions = (expressions) => {
    if (!expressions) return;
  
    const now = Date.now();
    const emotionEntries = Object.entries(expressions);
    const dominantEmotion = emotionEntries.reduce((prev, current) =>
      prev[1] > current[1] ? prev : current
    );
  
    const [emotion, confidence] = dominantEmotion;
  
    if (confidence > EMOTION_CONFIDENCE_THRESHOLD) {
      setEmotionBuffer(prev => {
        const newBuffer = [...prev, { emotion, confidence, timestamp: now }];
        return newBuffer.slice(-EMOTION_BUFFER_SIZE);
      });
  
      if (now - lastEmotionUpdate >= EMOTION_DETECTION_DELAY) {
        setIsEmotionProcessing(true);
        
        setTimeout(() => {
          setEmotionBuffer(currentBuffer => {
            if (currentBuffer.length >= EMOTION_BUFFER_SIZE) {
              const stableEmotion = analyzeEmotionStability(currentBuffer);
              
              if (stableEmotion) {
                setCurrentEmotion(stableEmotion.emotion);
                setEmotionConfidence(stableEmotion.confidence);
                
                setEmotionHistory(prev => {
                  const newHistory = [...prev, { 
                    emotion: stableEmotion.emotion, 
                    confidence: stableEmotion.confidence, 
                    timestamp: now 
                  }];
                  return newHistory.slice(-EMOTION_HISTORY_LIMIT);
                });

                setEmotionStats(prev => ({
                  ...prev,
                  [stableEmotion.emotion]: (prev[stableEmotion.emotion] || 0) + 1,
                }));

                checkEmotionAlerts(stableEmotion.emotion, stableEmotion.confidence);
                
                setLastEmotionUpdate(now);
              }
            }
            
            setIsEmotionProcessing(false);
            return currentBuffer;
          });
        }, 100);
      }
    }
  };

  const analyzeEmotionStability = (buffer) => {
    if (buffer.length < EMOTION_BUFFER_SIZE) return null;
  
    const emotionCounts = {};
    let totalConfidence = {};
    
    buffer.forEach(({ emotion, confidence }) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      totalConfidence[emotion] = (totalConfidence[emotion] || 0) + confidence;
    });
  
    const mostFrequentEmotion = Object.entries(emotionCounts)
      .reduce((prev, current) => prev[1] > current[1] ? prev : current);
  
    const [emotion, count] = mostFrequentEmotion;
    const stability = count / buffer.length;
  
    if (stability >= EMOTION_STABILITY_THRESHOLD) {
      const averageConfidence = totalConfidence[emotion] / count;
      return {
        emotion,
        confidence: averageConfidence,
        stability,
        count
      };
    }
  
    return null;
  };

  const checkEmotionAlerts = (emotion, confidence, stability = 0) => {
    const alerts = [];
  
    if (['sad', 'angry', 'fearful'].includes(emotion) && confidence > 0.6) {
      alerts.push({
        type: 'distress',
        message: `Stable ${emotion} detected (${(confidence * 100).toFixed(1)}% confidence)`,
        emotion,
        confidence,
        stability
      });
    }
  
    const recentEmotions = emotionHistory.slice(-10);
    const negativeEmotions = recentEmotions.filter((e) =>
      ['sad', 'angry', 'fearful', 'disgusted'].includes(e.emotion)
    );
  
    if (negativeEmotions.length >= 7) {
      alerts.push({
        type: 'prolonged_distress',
        message: 'Prolonged negative emotions detected',
        emotion: 'multiple',
        confidence: 0.8,
        stability: 1.0
      });
    }
  
    if (alerts.length > 0) {
      setEmotionAlerts(prev => [...prev, ...alerts]);
      setTimeout(() => {
        setEmotionAlerts(prev => prev.filter(alert => !alerts.includes(alert)));
      }, 10000);
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current) return;

    const overlayCanvas = overlayCanvasRef.current;
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!overlayCtx) return;
    const zoomLevel = window.devicePixelRatio || 1;

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let screenX = gazeDirection.x;
    let screenY = gazeDirection.y;

    if (detection) {
      setFaceDetected(true);
      processEmotions(detection.expressions);

      const box = detection.detection.box;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      if (currentEmotion) {
        const emotionColor = EMOTION_COLORS[currentEmotion] || '#6b7280';
        ctx.fillStyle = emotionColor;
        ctx.fillRect(box.x, box.y - 30, box.width, 25);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${EMOTION_ICONS[currentEmotion]} ${currentEmotion} ${(emotionConfidence * 100).toFixed(0)}%`,
          box.x + box.width / 2,
          box.y - 10
        );
      }

      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      const leftEyeCenter = getEyeCenter(leftEye);
      const rightEyeCenter = getEyeCenter(rightEye);

      const gazeX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
      const gazeY = (leftEyeCenter.y + rightEyeCenter.y) / 2;

      const SENSITIVITY = 2.5;
      let normalizedX = Math.min(Math.max(1- gazeX / canvas.width, 0), 1);
      let normalizedY = Math.min(Math.max(gazeY / canvas.height, 0), 1);
      let adjustedX = (normalizedX - 0.5) * SENSITIVITY + 0.5;
      let adjustedY = (normalizedY - 0.5) * SENSITIVITY + 0.5;
      screenX = isCalibrated ? mappingParams.a_x * adjustedX + mappingParams.b_x : adjustedX;
      screenY = isCalibrated ? mappingParams.a_y * adjustedY + mappingParams.b_y : adjustedY;
      screenX = Math.min(Math.max(screenX, 0), 1);
      screenY = Math.min(Math.max(screenY, 0), 1);

      setGazeDirection({ x: screenX, y: screenY });
      checkButtonGaze(screenX, screenY);
    } else {
      setFaceDetected(false);
      setCurrentEmotion(null);
      setEmotionConfidence(0);
      resetGazeTracking();
    }

    overlayCtx.fillStyle = '#ff0000';
    overlayCtx.beginPath();
    overlayCtx.arc(
      screenX * window.innerWidth * zoomLevel,
      screenY * window.innerHeight * zoomLevel,
      15,
      0,
      2 * Math.PI
    );
    overlayCtx.fill();

    if (isCalibrating) {
      overlayCtx.fillStyle = '#00ff00';
      overlayCtx.beginPath();
      overlayCtx.arc(
        screenX * window.innerWidth * zoomLevel,
        screenY * window.innerHeight * zoomLevel,
        7,
        0,
        2 * Math.PI
      );
      overlayCtx.fill();
    }
  };

  const getEyeCenter = (eyePoints) => {
    const x = eyePoints.reduce((sum, point) => sum + point.x, 0) / eyePoints.length;
    const y = eyePoints.reduce((sum, point) => sum + point.y, 0) / eyePoints.length;
    return { x, y };
  };

  // ✅ CORRECTED checkButtonGaze function
  const checkButtonGaze = (gazeX, gazeY) => {
    const buttonElements = document.querySelectorAll('.gaze-button');
    let foundButton = null;
    let minDistance = Infinity;
    let debugText = `Gaze: (${gazeX.toFixed(2)}, ${gazeY.toFixed(2)}) - `;

    const zoomLevel = window.devicePixelRatio || 1;
    const viewportX = gazeX * window.innerWidth;
    const viewportY = gazeY * window.innerHeight;

    buttonElements.forEach((buttonElement) => {
      const rect = buttonElement.getBoundingClientRect();
      
      // Get the button ID from the data attribute
      const buttonId = buttonElement.getAttribute('data-button-id');
      
      // Find the corresponding button in the array by ID
      const buttonData = buttons.find(btn => btn.id === buttonId);
      
      if (!buttonData) return; // Skip if button not found

      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(viewportX - buttonCenterX, 2) + Math.pow(viewportY - buttonCenterY, 2)
      );

      debugText += `${buttonData.label || buttonData.name}: ${distance.toFixed(0)}px `;

      const tolerance = 150 / zoomLevel;
      if (distance < tolerance && distance < minDistance) {
        minDistance = distance;
        foundButton = buttonData; // Now correctly mapped!
      }
    });

    setDebugInfo(debugText);
    handleGazeTracking(foundButton);
  };

  const handleGazeTracking = (currentButton) => {
    const now = Date.now();

    if (currentButton) {
      if (lastGazedButtonRef.current === currentButton.id) {
        if (gazeStartTimeRef.current) {
          const elapsed = now - gazeStartTimeRef.current;
          const progress = Math.min(elapsed / GAZE_THRESHOLD, 1);
          setGazeProgress(progress);

          if (elapsed >= GAZE_THRESHOLD) {
            activateButton(currentButton.id);
            resetGazeTracking();
          }
        }
      } else {
        startGazeTracking(currentButton.id);
      }
    } else {
      resetGazeTracking();
    }
  };

  const startGazeTracking = (buttonId) => {
    lastGazedButtonRef.current = buttonId;
    gazeStartTimeRef.current = Date.now();
    setSelectedButton(buttonId);
    setGazeProgress(0);
  };

  const resetGazeTracking = () => {
    lastGazedButtonRef.current = null;
    gazeStartTimeRef.current = null;
    setSelectedButton(null);
    setGazeProgress(0);
  };

  const activateButton = async (buttonId) => {
    console.log(`Activated: ${buttonId}`);

    setActivatedButton(buttonId);
    setTimeout(() => setActivatedButton(null), 2000);

    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    if (currentEmotion) {
      console.log(`Button ${buttonId} activated with emotion: ${currentEmotion} (${(emotionConfidence * 100).toFixed(1)}%)`);
    }

    switch (buttonId) {
      case 'call-nurse':
        await handleNurseCall();
        break;
      case 'water':
        await handleWaterRequest();
        break;
      case 'food':
        await handleFoodRequest();
        break;
      case 'pain':
        await handlePainReport();
        break;
      case 'bathroom':
        await handleBathroomRequest();
        break;
      case 'tv':
        await handleTVControl();
        break;
      case 'scroll-up':
        handleScrollUp();
        break;
      case 'scroll-down':
        handleScrollDown();
        break;
      case 'entertainment':
        setShowEntertainmentOptions(true);
        setTimeout(() => {
          scroll.scrollToBottom({
            duration: 1500,
            delay: 0,
            smooth: 'easeInOutQuint',
          });
        }, 200);
        break;
      case 'arijit':
      case 'lata':
      case 'rahman':
      case 'shreya':
      case 'kishore':
      case 'rahat':
      case 'sonu':
      case 'udit':
      case 'krishna':
      case 'bollywood':
        const selectedButton = buttons.find(button => button.id === buttonId);
        if (selectedButton?.link) {
          console.log("Selected: ", selectedButton.link);
          setSpotifyLink(selectedButton.link);
        }
        break;
      case 'back-to-menu':
        setShowEntertainmentOptions(false);
        break;
      case 'youtube-prev':
        setCurrentVideoIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : youTubeVideos.length - 1;
            setCurrentYouTubeVideo(generateYouTubeURL(youTubeVideos[newIndex].id, isYouTubePlaying));
            return newIndex;
          });
          break;
      case 'youtube-next':
        setCurrentVideoIndex((prev) => {
            const newIndex = prev < youTubeVideos.length - 1 ? prev + 1 : 0;
            setCurrentYouTubeVideo(generateYouTubeURL(youTubeVideos[newIndex].id, isYouTubePlaying));
            return newIndex;
          });
          break;
      case 'youtube-play-pause':
        const newPlayState = !isYouTubePlaying;
        setIsYouTubePlaying(newPlayState);
        
        if (!newPlayState) {
            // For pause: reload iframe with autoplay=0
            const pauseURL = generateYouTubeURL(youTubeVideos[currentVideoIndex].id, false);
            setCurrentYouTubeVideo(''); // Clear first
            setTimeout(() => setCurrentYouTubeVideo(pauseURL), 50); // Then reload
        } else {
            // For play: normal URL change
            setCurrentYouTubeVideo(generateYouTubeURL(youTubeVideos[currentVideoIndex].id, true));
        }
        break;


      case 'youtube-stop':
        setIsYouTubePlaying(false);
        setCurrentYouTubeVideo(generateYouTubeURL(youTubeVideos[currentVideoIndex].id, false));
        break;
      default:
        break;
    }
  };

  const showNotification = (message, type) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type };

    setNotifications((prev) => [...prev, notification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const handleNurseCall = async () => {
    const currentPatientData = patientDataRef.current;
    if (!currentPatientData) {
      showNotification('❌ Patient data not found', 'error');
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const nurseId = Array.isArray(currentPatientData.assigned_nurse_ids)
        ? currentPatientData.assigned_nurse_ids[0]
        : currentPatientData.assigned_nurse_ids;
      const { error } = await supabase.from('alert').insert([
        {
          name: 'Nurse Call',
          patient_id: currentPatientData.id,
          nurse_id: nurseId,
          hospital_id: currentPatientData.hospital_id,
          status: 'Sent',
          seen: 'No',
          createdat: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Supabase alert insert error:', error);
        showNotification('❌ Failed to NURSE CALL request', 'error');
        return;
      }

      showNotification('nurse call request sent to staff!', 'success');
    } catch (error) {
      console.error('handlenurse call error:', error);
      showNotification('❌ Failed to send nurse call request', 'error');
    }
  };

  const handleWaterRequest = async () => {
    const currentPatientData = patientDataRef.current;
    if (!currentPatientData) {
      showNotification('❌ Patient data not found', 'error');
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const nurseId = Array.isArray(currentPatientData.assigned_nurse_ids)
        ? currentPatientData.assigned_nurse_ids[0]
        : currentPatientData.assigned_nurse_ids;
      const { error } = await supabase.from('alert').insert([
        {
          name: 'Water Request',
          patient_id: currentPatientData.id,
          nurse_id: nurseId,
          hospital_id: currentPatientData.hospital_id,
          status: 'Sent',
          seen: 'No',
          createdat: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Supabase alert insert error:', error);
        showNotification('❌ Failed to send water request', 'error');
        return;
      }

      showNotification('💧 Water request sent to staff!', 'success');
    } catch (error) {
      console.error('handleWaterRequest error:', error);
      showNotification('❌ Failed to send water request', 'error');
    }
  };

  const handleFoodRequest = async () => {
    const currentPatientData = patientDataRef.current;
    if (!currentPatientData) {
      showNotification('❌ Patient data not found', 'error');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const nurseId = Array.isArray(currentPatientData.assigned_nurse_ids)
        ? currentPatientData.assigned_nurse_ids[0]
        : currentPatientData.assigned_nurse_ids;
      const { error } = await supabase.from('alert').insert([
        {
          name: 'Food Request',
          patient_id: currentPatientData.id,
          nurse_id: nurseId,
          hospital_id: currentPatientData.hospital_id,
          status: 'Sent',
          seen: 'No',
          createdat: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Supabase alert insert error:', error);
        showNotification('❌ Failed to send food request', 'error');
        return;
      }

      showNotification('💧 food request sent to staff!', 'success');
    } catch (error) {
      console.error('handlFoodRequst error:', error);
      showNotification('❌ Failed to send food request', 'error');
    }
  };

  const handlePainReport = async () => {
    const currentPatientData = patientDataRef.current;
    if (!currentPatientData) {
      showNotification('❌ Patient data not found', 'error');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const nurseId = Array.isArray(currentPatientData.assigned_nurse_ids)
        ? currentPatientData.assigned_nurse_ids[0]
        : currentPatientData.assigned_nurse_ids;
      const { error } = await supabase.from('alert').insert([
        {
          name: 'pain report',
          patient_id: currentPatientData.id,
          nurse_id: nurseId,
          hospital_id: currentPatientData.hospital_id,
          status: 'Sent',
          seen: 'No',
          createdat: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Supabase alert insert error:', error);
        showNotification('❌ Failed to send pain report', 'error');
        return;
      }

      showNotification(' pain report sent to staff!', 'success');
    } catch (error) {
      console.error('handlepanreport error:', error);
      showNotification('❌ Failed to send pain report', 'error');
    }
  };

  const handleBathroomRequest = async () => {
    const currentPatientData = patientDataRef.current;
    if (!currentPatientData) {
      showNotification('❌ Patient data not found', 'error');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const nurseId = Array.isArray(currentPatientData.assigned_nurse_ids)
        ? currentPatientData.assigned_nurse_ids[0]
        : currentPatientData.assigned_nurse_ids;
      const { error } = await supabase.from('alert').insert([
        {
          name: 'Bathroom Request',
          patient_id: currentPatientData.id,
          nurse_id: nurseId,
          hospital_id: currentPatientData.hospital_id,
          status: 'Sent',
          seen: 'No',
          createdat: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Supabase alert insert error:', error);
        showNotification('❌ Failed to send bathroom request', 'error');
        return;
      }

      showNotification(' bathroom request sent to staff!', 'success');
    } catch (error) {
      console.error('handlebathroomRequest error:', error);
      showNotification('❌ Failed to send bathroom request', 'error');
    }
  };

  const handleTVControl = async () => {
    const currentPatientData = patientDataRef.current;
    if (!currentPatientData) {
      showNotification('❌ Patient data not found', 'error');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const nurseId = Array.isArray(currentPatientData.assigned_nurse_ids)
        ? currentPatientData.assigned_nurse_ids[0]
        : currentPatientData.assigned_nurse_ids;
      const { error } = await supabase.from('alert').insert([
        {
          name: 'TV control Request',
          patient_id: currentPatientData.id,
          nurse_id: nurseId,
          hospital_id: currentPatientData.hospital_id,
          status: 'Sent',
          seen: 'No',
          createdat: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Supabase alert insert error:', error);
        showNotification('❌ Failed to send TV control request', 'error');
        return;
      }

      showNotification('TV control request sent to staff!', 'success');
    } catch (error) {
      console.error('handleTVcontrolRequest error:', error);
      showNotification('❌ Failed to send TV control request', 'error');
    }
  };

  const handleScrollUp = () => {
    window.scrollBy({
      top: -100,
      behavior: 'smooth',
    });
    showNotification('⬆️ Scrolled Up!', 'success');
  };

  const handleScrollDown = () => {
    window.scrollBy({
      top: 200,
      behavior: 'smooth',
    });
    showNotification('⬇️ Scrolled Down!', 'success');
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    setCurrentCalibrationPoint(0);
    setCalibrationPoints([]);
    setIsCalibrated(false);
    setMappingParams({ a_x: 1, b_x: 0, a_y: 1, b_y: 0 });
    setGazeDirection({ x: 0.5, y: 0.5 });
    
    if (CALIBRATION_POINTS.length === 0) {
      console.error('CALIBRATION_POINTS array is empty');
      setIsCalibrating(false);
      showNotification('❌ Calibration points not defined', 'error');
    }
  };

  const calibratePoint = () => {
    if (currentCalibrationPoint < CALIBRATION_POINTS.length) {
      const point = CALIBRATION_POINTS[currentCalibrationPoint];
      setCalibrationPoints((prev) => [...prev, { point, gaze: gazeDirection }]);
      setCurrentCalibrationPoint((prev) => prev + 1);

      if (currentCalibrationPoint + 1 >= CALIBRATION_POINTS.length) {
        finishCalibration();
      }
    }
  };

  const finishCalibration = () => {
    const topLeft = calibrationPoints.find((p) => p.point.label === 'Top Left');
    const topRight = calibrationPoints.find((p) => p.point.label === 'Top Right');
    const bottomLeft = calibrationPoints.find((p) => p.point.label === 'Bottom Left');

    if (topLeft && topRight && bottomLeft) {
      const detected_x_left = topLeft.gaze.x;
      const detected_x_right = topRight.gaze.x;
      const detected_y_top = topLeft.gaze.y;
      const detected_y_bottom = bottomLeft.gaze.y;

      const screen_x_left = topLeft.point.x;
      const screen_x_right = topRight.point.x;
      const screen_y_top = topLeft.point.y;
      const screen_y_bottom = bottomLeft.point.y;

      const a_x = (screen_x_right - screen_x_left) / (detected_x_right - detected_x_left || 0.0001);
      const b_x = screen_x_left - a_x * detected_x_left;
      const a_y = (screen_y_bottom - screen_y_top) / (detected_y_bottom - detected_y_top || 0.0001);
      const b_y = screen_y_top - a_y * detected_y_top;

      setMappingParams({ a_x, b_x, a_y, b_y });
      setIsCalibrated(true);
      console.log('Calibration complete:', { calibrationPoints, mappingParams });
      showNotification('🎯 Calibration completed!', 'success');
    } else {
      showNotification('❌ Calibration incomplete, please try again', 'error');
    }
    setIsCalibrating(false);
  };

  const clearEmotionBuffer = () => {
    setEmotionBuffer([]);
    setLastEmotionUpdate(0);
    setIsEmotionProcessing(false);
  };

  const clearEmotionHistory = () => {
    setEmotionHistory([]);
    setEmotionStats({});
    setEmotionAlerts([]);
    clearEmotionBuffer();
  };

  const getMostFrequentEmotion = () => {
    if (Object.keys(emotionStats).length === 0) return null;
    return Object.entries(emotionStats).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  };

  useEffect(() => {
    const updateCanvasSize = () => {
      if (overlayCanvasRef.current) {
        const zoomLevel = window.devicePixelRatio || 1;
        overlayCanvasRef.current.width = window.innerWidth * zoomLevel;
        overlayCanvasRef.current.height = window.innerHeight * zoomLevel;
        detectFace();
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    const initialRedraw = setTimeout(updateCanvasSize, 100);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      clearTimeout(initialRedraw);
    };
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && videoRef.current) {
      const interval = setInterval(detectFace, 100);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isLoaded]);

  useEffect(() => {
    return () => {
      resetGazeTracking();
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading face detection and emotion models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Overlay Canvas for Persistent Gaze Dot */}
      <canvas
        ref={overlayCanvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-40"
        style={{ zIndex: 40 }}
      />

      {/* Emotion Alerts */}
      <div className="fixed top-4 left-4 z-50 space-y-2">
        {emotionAlerts.map((alert, index) => (
          <div
            key={index}
            className="p-3 rounded-lg text-white text-sm font-semibold shadow-lg bg-red-500 animate-pulse"
          >
            ⚠️ {alert.message}
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg text-white text-lg font-semibold shadow-lg transform transition-all duration-300 animate-pulse ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Current Emotion Display */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Current Emotion</h3>
            {isEmotionProcessing && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          
          {currentEmotion ? (
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{EMOTION_ICONS[currentEmotion]}</span>
              <div>
                <div className="font-semibold capitalize" style={{ color: EMOTION_COLORS[currentEmotion] }}>
                  {currentEmotion}
                </div>
                <div className="text-sm text-gray-500">
                  {(emotionConfidence * 100).toFixed(1)}% confident
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">
              {isEmotionProcessing ? 'Processing...' : 'No stable emotion detected'}
            </div>
          )}
          
          {/* Emotion Buffer Progress */}
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">
              Buffer: {emotionBuffer.length}/{EMOTION_BUFFER_SIZE}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(emotionBuffer.length / EMOTION_BUFFER_SIZE) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Time until next update */}
          <div className="text-xs text-gray-500 mt-1">
            Next update in: {Math.max(0, ((EMOTION_DETECTION_DELAY - (Date.now() - lastEmotionUpdate)) / 1000)).toFixed(1)}s
          </div>
          
          <button
            onClick={() => setShowEmotionDetails(!showEmotionDetails)}
            className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            {showEmotionDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      {/* Emotion Details Panel */}
      {showEmotionDetails && (
        <div className="fixed bottom-32 right-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Emotion Analytics</h3>
            <button
              onClick={clearEmotionHistory}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs text-gray-600">
              Most Frequent:{' '}
              {getMostFrequentEmotion() ? (
                <>
                  {EMOTION_ICONS[getMostFrequentEmotion()]} {getMostFrequentEmotion()}
                </>
              ) : (
                'None'
              )}
            </div>
            
            <div className="text-xs text-gray-600">
              Detection Delay: {EMOTION_DETECTION_DELAY / 1000}s
            </div>
            
            <div className="text-xs text-gray-600">
              Processing: {isEmotionProcessing ? 'Yes' : 'No'}
            </div>
            
            <div className="text-xs text-gray-600">
              History: {emotionHistory.length}/{EMOTION_HISTORY_LIMIT}
            </div>
            
            <div className="text-xs space-y-1">
              <div className="font-semibold">Emotion Count:</div>
              {Object.entries(emotionStats).map(([emotion, count]) => (
                <div key={emotion} className="flex justify-between">
                  <span className="capitalize">
                    {EMOTION_ICONS[emotion]} {emotion}
                  </span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
            
            {/* Current buffer analysis */}
            {emotionBuffer.length > 0 && (
              <div className="text-xs space-y-1 border-t pt-2">
                <div className="font-semibold">Current Buffer:</div>
                {(() => {
                  const bufferCounts = {};
                  emotionBuffer.forEach(({ emotion }) => {
                    bufferCounts[emotion] = (bufferCounts[emotion] || 0) + 1;
                  });
                  return Object.entries(bufferCounts).map(([emotion, count]) => (
                    <div key={emotion} className="flex justify-between text-xs">
                      <span>{EMOTION_ICONS[emotion]} {emotion}</span>
                      <span>{count}/{emotionBuffer.length}</span>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Eye Gaze Control Interface
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video and Canvas Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Camera Feed</h2>
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-64 pointer-events-none"
                width={640}
                height={480}
              />
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={startCalibration}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Calibrate
              </button>
              <div className="text-sm text-gray-600">
                Gaze: ({gazeDirection.x.toFixed(2)}, {gazeDirection.y.toFixed(2)})
                <br />
                Mapping: (a_x: {mappingParams.a_x.toFixed(2)}, b_x: {mappingParams.b_x.toFixed(2)},
                a_y: {mappingParams.a_y.toFixed(2)}, b_y: {mappingParams.b_y.toFixed(2)})
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            <div className="grid grid-cols-2 gap-4">
              {buttons.slice(0, 7).map((button) => (
                <button
                  key={button.id}
                  data-button-id={button.id} 
                  className={`gaze-button relative p-6 rounded-lg text-white font-semibold transition-all duration-200 ${
                    button.color
                  } ${
                    selectedButton === button.id ? 'ring-4 ring-yellow-400 scale-105' : 'hover:scale-105'
                  } ${
                    activatedButton === button.id ? 'ring-4 ring-green-400 bg-green-500' : ''
                  }`}
                  onClick={() => activateButton(button.id)}
                >
                  <div className="text-3xl mb-2">{button.icon}</div>
                  <div className="text-sm">{button.label}</div>
                  {selectedButton === button.id && (
                    <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-yellow-400 rounded-full relative overflow-hidden">
                        <div
                          className="absolute inset-0 bg-yellow-600 transition-all duration-100"
                          style={{
                            height: `${gazeProgress * 100}%`,
                            bottom: 0,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Scroll Buttons */}
        <div className="fixed top-1/2 left-4 transform -translate-y-1/2 z-50 flex flex-col space-y-4">
          {buttons.slice(7, 9).map((button) => (
            <button
              key={button.id}
              data-button-id={button.id} 
              className={`gaze-button relative p-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                button.color
              } ${
                selectedButton === button.id ? 'ring-4 ring-yellow-400 scale-105' : 'hover:scale-105'
              } ${
                activatedButton === button.id ? 'ring-4 ring-green-400 bg-green-500' : ''
              }`}
              onClick={() => activateButton(button.id)}
            >
              <div className="text-2xl mb-1">{button.icon}</div>
              <div className="text-xs">{button.label}</div>
              {selectedButton === button.id && (
                <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-yellow-400 rounded-full relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-yellow-600 transition-all duration-100"
                      style={{
                        height: `${gazeProgress * 100}%`,
                        bottom: 0,
                      }}
                    />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Additional Sections for Testing */}
        <div className="mt-8 space-y-8">
          {showEntertainmentOptions && (
            <div className="my-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl shadow-xl border border-purple-200">
              <h2 className="text-2xl text-gray-800 font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text ">
                🎭 Entertainment Hub
              </h2>
               
              {/* YouTube Section with Gaze Controls */}
              <div className="mb-8 bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl text-gray-800 font-bold mb-4 flex items-center gap-2">
                  🎬 <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">Movies</span>
                </h3>
                
                {/* Video Control Buttons */}
                <div className="flex gap-3 mb-4 justify-center flex-wrap">
                  {/* Previous Video Button */}
                  {(() => {
                    const prevButton = buttons.find(button => button.id === 'youtube-prev');
                    return prevButton ? (
                      <button
                        key={prevButton.id}
                        data-button-id={prevButton.id} 
                        className={`gaze-button relative p-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                          prevButton.color
                        } ${
                          selectedButton === prevButton.id ? 'ring-4 ring-yellow-400 scale-105' : 'hover:scale-105'
                        } ${
                          activatedButton === prevButton.id ? 'ring-4 ring-green-400 bg-green-500' : ''
                        }`}
                        onClick={() => activateButton(prevButton.id)}
                      >
                        <div className="text-2xl mb-1">{prevButton.icon}</div>
                        <div className="text-xs">{prevButton.label}</div>
                        {selectedButton === prevButton.id && (
                          <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-yellow-400 rounded-full relative overflow-hidden">
                              <div
                                className="absolute inset-0 bg-yellow-600 transition-all duration-100"
                                style={{
                                  height: `${gazeProgress * 100}%`,
                                  bottom: 0,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    ) : null;
                  })()}

                  {/* Play/Pause Button */}
                  {(() => {
                    const playPauseButton = buttons.find(button => button.id === 'youtube-play-pause');
                    return playPauseButton ? (
                      <button
                        key={playPauseButton.id}
                        data-button-id={playPauseButton.id} 
                        className={`gaze-button relative p-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                          playPauseButton.color
                        } ${
                          selectedButton === playPauseButton.id ? 'ring-4 ring-yellow-400 scale-105' : 'hover:scale-105'
                        } ${
                          activatedButton === playPauseButton.id ? 'ring-4 ring-green-400 bg-green-500' : ''
                        }`}
                        onClick={() => activateButton(playPauseButton.id)}
                      >
                        <div className="text-2xl mb-1">
                          {isYouTubePlaying ? '⏸️' : '▶️'}
                        </div>
                        <div className="text-xs">{isYouTubePlaying ? 'Pause' : 'Play'}</div>
                        {selectedButton === playPauseButton.id && (
                          <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-yellow-400 rounded-full relative overflow-hidden">
                              <div
                                className="absolute inset-0 bg-yellow-600 transition-all duration-100"
                                style={{
                                  height: `${gazeProgress * 100}%`,
                                  bottom: 0,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    ) : null;
                  })()}

                  {/* Next Video Button */}
                  {(() => {
                    const nextButton = buttons.find(button => button.id === 'youtube-next');
                    return nextButton ? (
                      <button
                        key={nextButton.id}
                        data-button-id={nextButton.id} 
                        className={`gaze-button relative p-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                          nextButton.color
                        } ${
                          selectedButton === nextButton.id ? 'ring-4 ring-yellow-400 scale-105' : 'hover:scale-105'
                        } ${
                          activatedButton === nextButton.id ? 'ring-4 ring-green-400 bg-green-500' : ''
                        }`}
                        onClick={() => activateButton(nextButton.id)}
                      >
                        <div className="text-2xl mb-1">{nextButton.icon}</div>
                        <div className="text-xs">{nextButton.label}</div>
                        {selectedButton === nextButton.id && (
                          <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-yellow-400 rounded-full relative overflow-hidden">
                              <div
                                className="absolute inset-0 bg-yellow-600 transition-all duration-100"
                                style={{
                                  height: `${gazeProgress * 100}%`,
                                  bottom: 0,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    ) : null;
                  })()}

                  {/* Stop Button */}
                  {(() => {
                    const stopButton = buttons.find(button => button.id === 'youtube-stop');
                    return stopButton ? (
                      <button
                        key={stopButton.id}
                        data-button-id={stopButton.id}
                        className={`gaze-button relative p-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                          stopButton.color
                        } ${
                          selectedButton === stopButton.id ? 'ring-4 ring-yellow-400 scale-105' : 'hover:scale-105'
                        } ${
                          activatedButton === stopButton.id ? 'ring-4 ring-green-400 bg-green-500' : ''
                        }`}
                        onClick={() => activateButton(stopButton.id)}
                      >
                        <div className="text-2xl mb-1">{stopButton.icon}</div>
                        <div className="text-xs">{stopButton.label}</div>
                        {selectedButton === stopButton.id && (
                          <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-yellow-400 rounded-full relative overflow-hidden">
                              <div
                                className="absolute inset-0 bg-yellow-600 transition-all duration-100"
                                style={{
                                  height: `${gazeProgress * 100}%`,
                                  bottom: 0,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    ) : null;
                  })()}
                </div>

                {/* YouTube Player */}
                <div className="relative overflow-hidden rounded-xl shadow-md">
                  <iframe
                    id="youtube-player"
                    width="100%"
                    height="400"
                    src={currentYouTubeVideo}
                    title="YouTube Video Player"
                    allowFullScreen
                    className="rounded-xl border-0"
                  />
                  
                  {/* Video Info Overlay */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-60 rounded-full px-3 py-1 text-white text-sm">
                    {currentVideoIndex + 1} / {youTubeVideos.length}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full px-3 py-1 text-white text-sm">
                    {isYouTubePlaying ? '▶️ Playing' : '⏸️ Paused'}
                  </div>
                </div>

                {/* Current Video Title */}
                <div className="text-center text-gray-700 font-medium mt-3">
                  Now Playing: {youTubeVideos[currentVideoIndex]?.title}
                </div>
              </div>
               
              {/* Spotify Section */}
              <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl text-gray-800 font-bold mb-4 flex items-center gap-2">
                  🎵 <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Music</span>
                </h3>
                
                {/* Single Spotify Player */}
                <div className="relative overflow-hidden rounded-xl shadow-md mb-4">
                  <iframe
                    style={{ borderRadius: "12px" }}
                    src={spotifyLink}
                    width="100%"
                    height="152"
                    allow="encrypted-media"
                    allowFullScreen
                    className="border-0"
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {buttons.slice(9, 19).map((artist) => (
                      <button
                        key={artist.id}
                        data-button-id={artist.id}
                        className={`gaze-button relative p-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                          artist.color
                        } ${
                          selectedButton === artist.id ? 'ring-4 ring-yellow-400 scale-105' : 'hover:scale-105'
                        } ${
                          activatedButton === artist.id ? 'ring-4 ring-green-400 bg-green-500' : ''
                        }`}
                        onClick={() => activateButton(artist.id)}
                      >
                        <div className="text-2xl mb-1">{artist.icon}</div>
                        <div className="text-xs">{artist.name}</div>
                        {selectedButton === artist.id && (
                          <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-yellow-400 rounded-full relative overflow-hidden">
                              <div
                                className="absolute inset-0 bg-yellow-600 transition-all duration-100"
                                style={{
                                  height: `${gazeProgress * 100}%`,
                                  bottom: 0,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    {(() => {
                      const backButton = buttons.find(button => button.id === 'back-to-menu');
                      return backButton ? (
                        <button
                          key={backButton.id}
                          data-button-id={backButton.id} 
                          className={`gaze-button relative p-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                            backButton.color
                          } ${
                            selectedButton === backButton.id ? 'ring-4 ring-yellow-400 scale-105' : 'hover:scale-105'
                          } ${
                            activatedButton === backButton.id ? 'ring-4 ring-green-400 bg-green-500' : ''
                          }`}
                          onClick={() => activateButton(backButton.id)}
                        >
                          <div className="text-2xl mb-1">{backButton.icon}</div>
                          <div className="text-xs">{backButton.label}</div>
                          {selectedButton === backButton.id && (
                            <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                              <div className="w-8 h-8 border-3 border-yellow-400 rounded-full relative overflow-hidden">
                                <div
                                  className="absolute inset-0 bg-yellow-600 transition-all duration-100"
                                  style={{
                                    height: `${gazeProgress * 100}%`,
                                    bottom: 0,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </button>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div> 

        {isCalibrating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Calibration</h3>
              <p className="mb-6">
                {currentCalibrationPoint < CALIBRATION_POINTS.length
                  ? <>Look at the red dot at {CALIBRATION_POINTS[currentCalibrationPoint]?.label || 'Unknown'} and click calibrate</>
                  : <>Calibration complete!</>
                }
              </p>
              <div className="fixed inset-0 pointer-events-none">
                {currentCalibrationPoint < CALIBRATION_POINTS.length && CALIBRATION_POINTS[currentCalibrationPoint] && (
                  <div
                    className="absolute w-6 h-6 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                    style={{
                      left: `${CALIBRATION_POINTS[currentCalibrationPoint].x * 100}%`,
                      top: `${CALIBRATION_POINTS[currentCalibrationPoint].y * 100}%`,
                    }}
                  />
                )}
              </div>
              <button
                onClick={calibratePoint}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg mr-4"
                disabled={currentCalibrationPoint >= CALIBRATION_POINTS.length}
              >
                Calibrate Point
              </button>
              <button
                onClick={() => setIsCalibrating(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
