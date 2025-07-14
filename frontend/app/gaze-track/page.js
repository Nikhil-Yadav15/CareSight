'use client';

import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function EyeGazeControlPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const gazeStartTimeRef = useRef(null);
  const lastGazedButtonRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gazeDirection, setGazeDirection] = useState({ x: 0.5, y: 0.5 });
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

  const GAZE_THRESHOLD = 2000;
  const CALIBRATION_POINTS = [
    { x: 0.1, y: 0.1, label: 'Top Left' },
    { x: 0.9, y: 0.1, label: 'Top Right' },
    { x: 0.5, y: 0.5, label: 'Center' },
    { x: 0.1, y: 0.9, label: 'Bottom Left' },
    { x: 0.9, y: 0.9, label: 'Bottom Right' }
  ];

  const buttons = [
    { id: 'call-nurse', label: 'Call Nurse', icon: '👩‍⚕️', color: 'bg-red-500' },
    { id: 'water', label: 'Water', icon: '💧', color: 'bg-blue-500' },
    { id: 'food', label: 'Food', icon: '🍽️', color: 'bg-green-500' },
    { id: 'pain', label: 'Pain', icon: '😣', color: 'bg-orange-500' },
    { id: 'bathroom', label: 'Bathroom', icon: '🚽', color: 'bg-purple-500' },
    { id: 'tv', label: 'TV Control', icon: '📺', color: 'bg-gray-500' },
    { id: 'scroll-up', label: 'Scroll Up', icon: '⬆️', color: 'bg-indigo-500' },
    { id: 'scroll-down', label: 'Scroll Down', icon: '⬇️', color: 'bg-indigo-500' },
    { id: 'section1-action', label: 'Section 1 Action', icon: '🔧', color: 'bg-teal-500' },
    { id: 'section2-action', label: 'Section 2 Action', icon: '⚙️', color: 'bg-cyan-500' }
  ];

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights')
      ]);
      setIsLoaded(true);
      startVideo();
    } catch (error) {
      console.error('Error loading models:', error);
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        ]);
        setIsLoaded(true);
        startVideo();
      } catch (localError) {
        console.error('Error loading local models:', localError);
        showNotification('❌ Failed to load face detection models', 'error');
      }
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      showNotification('❌ Failed to access camera', 'error');
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current) return;

    const overlayCanvas = overlayCanvasRef.current;
    const overlayCtx = overlayCanvas.getContext('2d');
    const zoomLevel = window.devicePixelRatio || 1;

    // Clear the canvas
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let screenX = gazeDirection.x;
    let screenY = gazeDirection.y;

    if (detection) {
      setFaceDetected(true);
      
      const box = detection.detection.box;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      const landmarks = detection.landmarks;
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      
      const leftEyeCenter = getEyeCenter(leftEye);
      const rightEyeCenter = getEyeCenter(rightEye);
      
      const gazeX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
      const gazeY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
      
      const SENSITIVITY = 2.5;
      let normalizedX = Math.min(Math.max(gazeX / canvas.width, 0), 1);
      let normalizedY = Math.min(Math.max(gazeY / canvas.height, 0), 1);
      let adjustedX = (normalizedX - 0.5) * SENSITIVITY + 0.5;
      let adjustedY = (normalizedY - 0.5) * SENSITIVITY + 0.5;
      screenX = isCalibrated ? mappingParams.a_x * adjustedX + mappingParams.b_x : adjustedX;
      screenY = isCalibrated ? mappingParams.a_y * adjustedY + mappingParams.b_y : adjustedY;
      screenX = Math.min(Math.max(screenX, 0), 1);
      screenY = Math.min(Math.max(screenY, 0), 1);
      
      // Update gazeDirection
      setGazeDirection({ x: screenX, y: screenY });
      
      // Check button interactions
      checkButtonGaze(screenX, screenY);
    } else {
      setFaceDetected(false);
      resetGazeTracking();
    }

    // Draw single red gaze dot
    overlayCtx.fillStyle = '#ff0000';
    overlayCtx.beginPath();
    overlayCtx.arc(screenX * window.innerWidth * zoomLevel, screenY * window.innerHeight * zoomLevel, 15, 0, 2 * Math.PI);
    overlayCtx.fill();
    
    // Draw green dot during calibration
    if (isCalibrating) {
      overlayCtx.fillStyle = '#00ff00';
      overlayCtx.beginPath();
      overlayCtx.arc(screenX * window.innerWidth * zoomLevel, screenY * window.innerHeight * zoomLevel, 7, 0, 2 * Math.PI);
      overlayCtx.fill();
    }
  };

  const getEyeCenter = (eyePoints) => {
    const x = eyePoints.reduce((sum, point) => sum + point.x, 0) / eyePoints.length;
    const y = eyePoints.reduce((sum, point) => sum + point.y, 0) / eyePoints.length;
    return { x, y };
  };

  const checkButtonGaze = (gazeX, gazeY) => {
    const buttonElements = document.querySelectorAll('.gaze-button');
    let foundButton = null;
    let minDistance = Infinity;
    let debugText = `Gaze: (${gazeX.toFixed(2)}, ${gazeY.toFixed(2)}) - `;
    
    const zoomLevel = window.devicePixelRatio || 1;
    const viewportX = gazeX * window.innerWidth;
    const viewportY = gazeY * window.innerHeight;
    
    buttonElements.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(viewportX - buttonCenterX, 2) + Math.pow(viewportY - buttonCenterY, 2)
      );
      
      debugText += `${buttons[index].label}: ${distance.toFixed(0)}px `;
      
      const tolerance = 150 / zoomLevel;
      if (distance < tolerance && distance < minDistance) {
        minDistance = distance;
        foundButton = buttons[index];
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
      case 'section1-action':
        await handleSection1Action();
        break;
      case 'section2-action':
        await handleSection2Action();
        break;
      default:
        break;
    }
  };

  const showNotification = (message, type) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleNurseCall = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      showNotification('✅ Nurse has been notified!', 'success');
    } catch (error) {
      showNotification('❌ Failed to contact nurse', 'error');
    }
  };

  const handleWaterRequest = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      showNotification('💧 Water request sent to staff!', 'success');
    } catch (error) {
      showNotification('❌ Failed to send water request', 'error');
    }
  };

  const handleFoodRequest = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      showNotification('🍽️ Food request sent to kitchen!', 'success');
    } catch (error) {
      showNotification('❌ Failed to send food request', 'error');
    }
  };

  const handlePainReport = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      showNotification('😣 Pain reported to medical staff!', 'success');
    } catch (error) {
      showNotification('❌ Failed to report pain', 'error');
    }
  };

  const handleBathroomRequest = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      showNotification('🚽 Bathroom assistance requested!', 'success');
    } catch (error) {
      showNotification('❌ Failed to request assistance', 'error');
    }
  };

  const handleTVControl = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      showNotification('📺 TV controls activated!', 'success');
    } catch (error) {
      showNotification('❌ Failed to control TV', 'error');
    }
  };

  const handleScrollUp = () => {
    window.scrollBy({
      top: -100,
      behavior: 'smooth'
    });
    showNotification('⬆️ Scrolled Up!', 'success');
  };

  const handleScrollDown = () => {
    window.scrollBy({
      top: 100,
      behavior: 'smooth'
    });
    showNotification('⬇️ Scrolled Down!', 'success');
  };

  const handleSection1Action = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      showNotification('🔧 Section 1 action triggered!', 'success');
    } catch (error) {
      showNotification('❌ Failed to trigger Section 1 action', 'error');
    }
  };

  const handleSection2Action = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      showNotification('⚙️ Section 2 action triggered!', 'success');
    } catch (error) {
      showNotification('❌ Failed to trigger Section 2 action', 'error');
    }
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    setCurrentCalibrationPoint(0);
    setCalibrationPoints([]);
    setIsCalibrated(false);
    setMappingParams({ a_x: 1, b_x: 0, a_y: 1, b_y: 0 });
    setGazeDirection({ x: 0.5, y: 0.5 }); // Center gaze at start
  };

  const calibratePoint = () => {
    if (currentCalibrationPoint < CALIBRATION_POINTS.length) {
      const point = CALIBRATION_POINTS[currentCalibrationPoint];
      setCalibrationPoints(prev => [...prev, { point, gaze: gazeDirection }]);
      setCurrentCalibrationPoint(prev => prev + 1);
      
      if (currentCalibrationPoint + 1 >= CALIBRATION_POINTS.length) {
        finishCalibration();
      }
    }
  };

  const finishCalibration = () => {
    const topLeft = calibrationPoints.find(p => p.point.label === 'Top Left');
    const topRight = calibrationPoints.find(p => p.point.label === 'Top Right');
    const bottomLeft = calibrationPoints.find(p => p.point.label === 'Bottom Left');

    if (topLeft && topRight && bottomLeft) {
      const detected_x_left = topLeft.gaze.x;
      const detected_x_right = topRight.gaze.x;
      const detected_y_top = topLeft.gaze.y;
      const detected_y_bottom = bottomLeft.gaze.y;

      const screen_x_left = topLeft.point.x; // 0.1
      const screen_x_right = topRight.point.x; // 0.9
      const screen_y_top = topLeft.point.y; // 0.1
      const screen_y_bottom = bottomLeft.point.y; // 0.9

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

  useEffect(() => {
    const updateCanvasSize = () => {
      if (overlayCanvasRef.current) {
        const zoomLevel = window.devicePixelRatio || 1;
        overlayCanvasRef.current.width = window.innerWidth * zoomLevel;
        overlayCanvasRef.current.height = window.innerHeight * zoomLevel;
        detectFace(); // Force redraw
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
          <p className="text-xl text-gray-600">Loading face detection models...</p>
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
                Mapping: (a_x: {mappingParams.a_x.toFixed(2)}, b_x: {mappingParams.b_x.toFixed(2)}, a_y: {mappingParams.a_y.toFixed(2)}, b_y: {mappingParams.b_y.toFixed(2)})
              </div>
            </div>
            
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <div>Debug: {debugInfo}</div>
              <div>Selected: {selectedButton || 'None'}</div>
              <div>Progress: {(gazeProgress * 100).toFixed(1)}%</div>
              <div>Face Detected: {faceDetected ? 'Yes' : 'No'}</div>
              <div>Calibrated: {isCalibrated ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            <div className="grid grid-cols-2 gap-4">
              {buttons.slice(0, 6).map((button) => (
                <button
                  key={button.id}
                  className={`gaze-button relative p-6 rounded-lg text-white font-semibold transition-all duration-200 ${
                    button.color
                  } ${
                    selectedButton === button.id
                      ? 'ring-4 ring-yellow-400 scale-105'
                      : 'hover:scale-105'
                  } ${
                    activatedButton === button.id
                      ? 'ring-4 ring-green-400 bg-green-500'
                      : ''
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
                            bottom: 0
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
          {buttons.slice(6, 8).map((button) => (
            <button
              key={button.id}
              className={`gaze-button relative p-4 rounded-lg text-white font-semibold transition-all duration-200 ${
                button.color
              } ${
                selectedButton === button.id
                  ? 'ring-4 ring-yellow-400 scale-105'
                  : 'hover:scale-105'
              } ${
                activatedButton === button.id
                  ? 'ring-4 ring-green-400 bg-green-500'
                  : ''
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
                        bottom: 0
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Section 1: Patient Settings</h2>
            <p className="text-gray-600 mb-4">
              Adjust settings related to patient comfort and preferences.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                className={`gaze-button relative p-6 rounded-lg text-white font-semibold transition-all duration-200 ${
                  buttons.find(b => b.id === 'section1-action').color
                } ${
                  selectedButton === 'section1-action'
                    ? 'ring-4 ring-yellow-400 scale-105'
                    : 'hover:scale-105'
                } ${
                  activatedButton === 'section1-action'
                    ? 'ring-4 ring-green-400 bg-green-500'
                    : ''
                }`}
                onClick={() => activateButton('section1-action')}
              >
                <div className="text-3xl mb-2">{buttons.find(b => b.id === 'section1-action').icon}</div>
                <div className="text-sm">{buttons.find(b => b.id === 'section1-action').label}</div>
                {selectedButton === 'section1-action' && (
                  <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-yellow-400 rounded-full relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-yellow-600 transition-all duration-100"
                        style={{
                          height: `${gazeProgress * 100}%`,
                          bottom: 0
                        }}
                      />
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Section 2: Room Controls</h2>
            <p className="text-gray-600 mb-4">
              Control room environment settings like lighting and temperature.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                className={`gaze-button relative p-6 rounded-lg text-white font-semibold transition-all duration-200 ${
                  buttons.find(b => b.id === 'section2-action').color
                } ${
                  selectedButton === 'section2-action'
                    ? 'ring-4 ring-yellow-400 scale-105'
                    : 'hover:scale-105'
                } ${
                  activatedButton === 'section2-action'
                    ? 'ring-4 ring-green-400 bg-green-500'
                    : ''
                }`}
                onClick={() => activateButton('section2-action')}
              >
                <div className="text-3xl mb-2">{buttons.find(b => b.id === 'section2-action').icon}</div>
                <div className="text-sm">{buttons.find(b => b.id === 'section2-action').label}</div>
                {selectedButton === 'section2-action' && (
                  <div className="absolute inset-0 bg-yellow-400 bg-opacity-30 rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-yellow-400 rounded-full relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-yellow-600 transition-all duration-100"
                        style={{
                          height: `${gazeProgress * 100}%`,
                          bottom: 0
                        }}
                      />
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>

          <div className="h-96 bg-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Spacer Section</h2>
            <p className="text-gray-600">
              This is a spacer section to allow scrolling for testing gaze-controlled scrolling.
            </p>
          </div>
        </div>
        
        {isCalibrating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Calibration</h3>
              <p className="mb-6">
                Look at the red dot at {CALIBRATION_POINTS[currentCalibrationPoint]?.label} and click calibrate
              </p>
              <div className="fixed inset-0 pointer-events-none">
                <div
                  className="absolute w-6 h-6 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{
                    left: `${CALIBRATION_POINTS[currentCalibrationPoint]?.x * 100}%`,
                    top: `${CALIBRATION_POINTS[currentCalibrationPoint]?.y * 100}%`
                  }}
                />
              </div>
              <button
                onClick={calibratePoint}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg mr-4"
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
