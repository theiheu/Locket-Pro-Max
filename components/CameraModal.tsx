"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Video,
  Upload,
  RefreshCw,
  Send,
  Sparkles,
  Users,
  Check,
  AlertCircle,
  FlipHorizontal,
  Timer,
  Sun,
  Music,
  BatteryCharging,
  MapPin,
  Smile,
  Play,
  Square,
  Monitor,
  Brush,
  Layers,
  Clock,
  Eye,
  Lock,
  Calendar,
  Palette,
} from "lucide-react";
import {
  LocketFriend,
  LocketMoment,
  MomentBadge,
  ScheduledMoment,
  WidgetFrameStyle,
} from "@/types/locket";
import { sounds } from "@/lib/soundEffects";
import { DoodleCanvas } from "./DoodleCanvas";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  friends: LocketFriend[];
  onMomentPosted: (newMoment: LocketMoment) => void;
  onScheduleMoment: (scheduled: ScheduledMoment) => void;
  token?: string;
}

const FILTER_PRESETS = [
  { id: "normal", name: "Gốc", css: "none" },
  { id: "golden", name: "Golden", css: "sepia(0.3) saturate(1.4) contrast(1.05)" },
  { id: "mono", name: "B&W Noir", css: "grayscale(1) contrast(1.2)" },
  { id: "vintage", name: "Vintage 90s", css: "sepia(0.4) hue-rotate(-20deg) contrast(1.1)" },
  { id: "cyber", name: "Cyberpunk", css: "hue-rotate(180deg) saturate(1.6)" },
  { id: "pastel", name: "Pastel", css: "brightness(1.1) saturate(0.85)" },
];

const FRAME_OPTIONS: { id: WidgetFrameStyle; name: string }[] = [
  { id: "default", name: "Mặc định" },
  { id: "polaroid", name: "Polaroid" },
  { id: "vhs", name: "VHS 90s" },
  { id: "cyberpunk", name: "Cyberpunk" },
  { id: "love", name: "Trái Tim" },
];

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  friends,
  onMomentPosted,
  onScheduleMoment,
  token,
}) => {
  const [activeTab, setActiveTab] = useState<"camera" | "screen" | "upload">("camera");
  const [captureMode, setCaptureMode] = useState<"photo" | "video">("photo");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("normal");
  const [selectedBadge, setSelectedBadge] = useState<MomentBadge | undefined>(undefined);
  const [countdownTimer, setCountdownTimer] = useState<number>(0);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);

  // Advanced features (3, 4, 6, 7)
  const [selectedFrame, setSelectedFrame] = useState<WidgetFrameStyle>("default");
  const [isViewOnce, setIsViewOnce] = useState(false);
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [capsuleDays, setCapsuleDays] = useState(7);
  const [hasDateStamp, setHasDateStamp] = useState(false);

  const [isDoodleOpen, setIsDoodleOpen] = useState(false);
  const [isDualCapture, setIsDualCapture] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledMinutes, setScheduledMinutes] = useState(10);

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentToAll, setSentToAll] = useState(true);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isFacingUser, setIsFacingUser] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera
  useEffect(() => {
    if (isOpen && activeTab === "camera" && !capturedImage && !capturedVideo) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, capturedImage, capturedVideo, isFacingUser, captureMode]);

  const startCamera = async () => {
    try {
      setErrorMsg(null);
      if (streamRef.current) stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: isFacingUser ? "user" : "environment",
          aspectRatio: 1,
        },
        audio: captureMode === "video",
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera access denied or unavailable:", err.message);
      setErrorMsg("Không thể truy cập camera. Vui lòng thử Chụp màn hình hoặc Tải ảnh từ máy.");
      setActiveTab("upload");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Capture Screen
  const handleCaptureScreen = async () => {
    try {
      setErrorMsg(null);
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: false,
      });

      const screenVideo = document.createElement("video");
      screenVideo.srcObject = displayStream;
      await screenVideo.play();

      sounds.playShutter();

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = Math.min(screenVideo.videoWidth, screenVideo.videoHeight);
      const startX = (screenVideo.videoWidth - size) / 2;
      const startY = (screenVideo.videoHeight - size) / 2;
      ctx.drawImage(screenVideo, startX, startY, size, size, 0, 0, 1080, 1080);

      // Dual capture if enabled
      if (isDualCapture && videoRef.current) {
        const webcam = videoRef.current;
        const bubbleSize = 280;
        const bubbleX = 1080 - bubbleSize - 40;
        const bubbleY = 40;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleSize, bubbleSize, 40);
        ctx.clip();
        ctx.drawImage(webcam, 0, 0, bubbleSize, bubbleSize);
        ctx.restore();

        ctx.strokeStyle = "#FACC15";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.roundRect(bubbleX, bubbleY, bubbleSize, bubbleSize, 40);
        ctx.stroke();
      }

      displayStream.getTracks().forEach((t) => t.stop());
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedImage(dataUrl);
    } catch (err: any) {
      console.warn("Screen capture failed:", err);
    }
  };

  // Capture Photo
  const triggerCapturePhoto = () => {
    if (countdownTimer > 0) {
      setCountdownRemaining(countdownTimer);
      let count = countdownTimer;
      const interval = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(interval);
          setCountdownRemaining(null);
          takeSnapshot();
        } else {
          setCountdownRemaining(count);
        }
      }, 1000);
    } else {
      takeSnapshot();
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    sounds.playShutter();

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 1080;
    canvas.height = 1080;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Filter
    const filterObj = FILTER_PRESETS.find((f) => f.id === selectedFilter);
    if (filterObj && filterObj.css !== "none") {
      ctx.filter = filterObj.css;
    }

    if (isFacingUser) {
      ctx.translate(1080, 0);
      ctx.scale(-1, 1);
    }

    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, 1080, 1080);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  // Video recording
  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp8,opus",
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedVideo(videoUrl);
        takeSnapshotForThumbnail();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 14) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      stopCamera();
    }
  };

  const takeSnapshotForThumbnail = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, 720, 720);
      setCapturedImage(canvas.toDataURL("image/jpeg", 0.8));
    }
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video/")) {
      const videoUrl = URL.createObjectURL(file);
      setCapturedVideo(videoUrl);
      setCapturedImage("https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80");
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = Math.min(img.width, img.height);
          canvas.width = 1080;
          canvas.height = 1080;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          ctx.drawImage(img, startX, startY, size, size, 0, 0, 1080, 1080);
          setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
    setIsDoodleOpen(false);
    if (activeTab === "camera") {
      startCamera();
    }
  };

  // Post or Schedule Moment
  const handlePostOrSchedule = async () => {
    if (!capturedImage && !capturedVideo) return;

    const timeCapsuleUnlockAt = isTimeCapsule
      ? new Date(Date.now() + capsuleDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    // Schedule queue
    if (isScheduling) {
      const scheduledDate = new Date(Date.now() + scheduledMinutes * 60 * 1000);
      const scheduledItem: ScheduledMoment = {
        id: `sched_${Date.now()}`,
        imageBase64: capturedImage || "",
        videoUrl: capturedVideo || undefined,
        mediaType: capturedVideo ? "video" : "image",
        caption: caption.trim(),
        badge: selectedBadge,
        filter: selectedFilter,
        frameStyle: selectedFrame,
        isViewOnce: isViewOnce,
        timeCapsuleUnlockAt: timeCapsuleUnlockAt,
        hasDateStamp: hasDateStamp || selectedFrame === "vhs",
        scheduledTime: scheduledDate.toISOString(),
        sentToAll: sentToAll,
        recipients: sentToAll ? [] : selectedRecipients,
        createdAt: new Date().toISOString(),
      };
      onScheduleMoment(scheduledItem);
      onClose();
      setCapturedImage(null);
      setCapturedVideo(null);
      setCaption("");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    sounds.playSend();

    try {
      const res = await fetch("/api/locket/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          imageBase64: capturedImage,
          videoUrl: capturedVideo || undefined,
          mediaType: capturedVideo ? "video" : "image",
          caption: caption.trim(),
          badge: selectedBadge,
          filter: selectedFilter,
          frameStyle: selectedFrame,
          isViewOnce: isViewOnce,
          timeCapsuleUnlockAt: timeCapsuleUnlockAt,
          hasDateStamp: hasDateStamp || selectedFrame === "vhs",
          sentToAll: sentToAll,
          recipients: sentToAll ? [] : selectedRecipients,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gửi khoảnh khắc thất bại");
      }

      onMomentPosted({
        ...data.moment,
        mediaType: capturedVideo ? "video" : "image",
        videoUrl: capturedVideo || undefined,
        badge: selectedBadge,
        filter: selectedFilter,
        frameStyle: selectedFrame,
        isViewOnce: isViewOnce,
        timeCapsuleUnlockAt: timeCapsuleUnlockAt,
        hasDateStamp: hasDateStamp || selectedFrame === "vhs",
      });

      onClose();
      setCapturedImage(null);
      setCapturedVideo(null);
      setCaption("");
      setSelectedBadge(undefined);
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi đăng ảnh.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentFilterCss = FILTER_PRESETS.find((f) => f.id === selectedFilter)?.css || "none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-4xl p-5 shadow-2xl flex flex-col max-h-[94vh] overflow-y-auto">
        {/* Doodle Canvas Drawer */}
        {isDoodleOpen && capturedImage && (
          <DoodleCanvas
            imageSrc={capturedImage}
            onSave={(newImg) => {
              setCapturedImage(newImg);
              setIsDoodleOpen(false);
            }}
            onCancel={() => setIsDoodleOpen(false)}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <h3 className="font-bold text-white text-base">Gửi Khoảnh Khắc Mới</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 3 Tab Selector: Camera vs Screen vs Upload */}
        {!capturedImage && !capturedVideo && (
          <div className="flex items-center justify-between gap-1 mb-3">
            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-2xl flex-1 border border-white/5">
              <button
                onClick={() => setActiveTab("camera")}
                className={`py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === "camera"
                    ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Camera className="w-3 h-3" />
                Camera
              </button>
              <button
                onClick={() => {
                  setActiveTab("screen");
                  handleCaptureScreen();
                }}
                className={`py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === "screen"
                    ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3 h-3" />
                Màn hình
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === "upload"
                    ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Upload className="w-3 h-3" />
                Tải tệp
              </button>
            </div>

            {activeTab === "camera" && (
              <div className="flex items-center bg-zinc-900 p-1 rounded-2xl border border-white/5">
                <button
                  onClick={() => setCaptureMode("photo")}
                  className={`p-1.5 rounded-xl transition-all ${
                    captureMode === "photo" ? "bg-yellow-400 text-black" : "text-zinc-400"
                  }`}
                  title="Chụp ảnh"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCaptureMode("video")}
                  className={`p-1.5 rounded-xl transition-all ${
                    captureMode === "video" ? "bg-yellow-400 text-black" : "text-zinc-400"
                  }`}
                  title="Quay video ngắn (tối đa 15s)"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Viewport: Live Camera OR Captured Preview */}
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
          {capturedVideo ? (
            <video
              src={capturedVideo}
              autoPlay
              loop
              controls
              className="w-full h-full object-cover"
              style={{ filter: currentFilterCss }}
            />
          ) : capturedImage ? (
            <>
              <img
                src={capturedImage}
                alt="Preview"
                className="w-full h-full object-cover"
                style={{ filter: currentFilterCss }}
              />
              <button
                onClick={() => setIsDoodleOpen(true)}
                className="absolute top-3 right-3 p-2.5 rounded-full glass-pill text-yellow-400 hover:scale-105 transition-all shadow-lg flex items-center gap-1 text-xs font-bold"
                title="Vẽ & dán sticker"
              >
                <Brush className="w-4 h-4" />
                <span>Vẽ tay</span>
              </button>
            </>
          ) : activeTab === "camera" ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isFacingUser ? "scale-x-[-1]" : ""}`}
                style={{ filter: currentFilterCss }}
              />

              {countdownRemaining !== null && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30">
                  <span className="text-8xl font-black text-yellow-400 animate-ping">
                    {countdownRemaining}
                  </span>
                </div>
              )}

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                <button
                  onClick={() => setCountdownTimer((prev) => (prev === 0 ? 3 : prev === 3 ? 5 : 0))}
                  className={`px-2.5 py-1.5 rounded-full glass-pill text-xs font-bold flex items-center gap-1 transition-all ${
                    countdownTimer > 0 ? "text-yellow-400 border-yellow-400/40" : "text-white/80"
                  }`}
                  title="Hẹn giờ chụp ảnh"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{countdownTimer === 0 ? "Tắt" : `${countdownTimer}s`}</span>
                </button>

                <button
                  onClick={() => setIsDualCapture(!isDualCapture)}
                  className={`px-2.5 py-1.5 rounded-full glass-pill text-xs font-bold flex items-center gap-1 transition-all ${
                    isDualCapture ? "text-yellow-400 border-yellow-400/40" : "text-white/80"
                  }`}
                  title="Chế độ kép (Webcam + Màn hình)"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Kép</span>
                </button>

                <button
                  onClick={() => setIsFacingUser(!isFacingUser)}
                  className="p-2 rounded-full glass-pill text-white/80 hover:text-yellow-400 transition-all"
                  title="Đổi camera trước/sau"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>

              {isRecording && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 animate-pulse z-20">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  <span>00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 00:15</span>
                </div>
              )}
            </>
          ) : activeTab === "screen" ? (
            <div
              onClick={handleCaptureScreen}
              className="flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-zinc-800/40 w-full h-full transition-all"
            >
              <div className="w-16 h-16 rounded-3xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center mb-3">
                <Monitor className="w-8 h-8" />
              </div>
              <p className="text-white font-bold text-sm mb-1">Bấm để chọn cửa sổ hoặc màn hình</p>
              <p className="text-zinc-400 text-xs">Chia sẻ game, bài hát Spotify hoặc trang làm việc</p>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-zinc-800/40 w-full h-full transition-all"
            >
              <div className="w-16 h-16 rounded-3xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center mb-3">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-white font-bold text-sm mb-1">Kéo thả ảnh hoặc video từ máy tính</p>
              <p className="text-zinc-400 text-xs">Hỗ trợ JPG, PNG, WEBP, MP4, WEBM</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Shutter Button */}
        {!capturedImage && !capturedVideo && activeTab === "camera" && (
          <div className="flex flex-col items-center mb-3">
            {captureMode === "photo" ? (
              <button
                onClick={triggerCapturePhoto}
                className="w-16 h-16 rounded-full border-4 border-yellow-400 p-1 flex items-center justify-center active:scale-90 transition-all shadow-xl shadow-yellow-400/20"
                title="Chụp ảnh"
              >
                <div className="w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-300" />
              </button>
            ) : !isRecording ? (
              <button
                onClick={startRecording}
                className="w-16 h-16 rounded-full border-4 border-red-500 p-1 flex items-center justify-center active:scale-90 transition-all shadow-xl shadow-red-500/20"
                title="Bắt đầu quay video"
              >
                <div className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-400" />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full border-4 border-red-500 p-1 flex items-center justify-center active:scale-90 transition-all animate-pulse"
                title="Dừng quay"
              >
                <Square className="w-6 h-6 fill-red-500 text-red-500" />
              </button>
            )}
          </div>
        )}

        {/* Real-time Filters picker */}
        <div className="mb-3">
          <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {FILTER_PRESETS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap border transition-all ${
                  selectedFilter === f.id
                    ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                    : "bg-zinc-900 text-zinc-400 border-white/5 hover:text-white"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Moment Configuration */}
        {(capturedImage || capturedVideo) && (
          <div className="flex flex-col gap-3">
            {/* Choose Frame Style (Tính năng 4) */}
            <div>
              <span className="text-[11px] font-bold text-zinc-400 mb-1.5 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-yellow-400" />
                Khung viền ảnh (Frames):
              </span>
              <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                {FRAME_OPTIONS.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap border transition-all ${
                      selectedFrame === frame.id
                        ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                        : "bg-zinc-900 text-zinc-400 border-white/5"
                    }`}
                  >
                    {frame.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges / Note types */}
            <div>
              <span className="text-[11px] font-bold text-zinc-400 mb-1.5 block">Nhãn dán (Badge)</span>
              <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                <button
                  onClick={() => setSelectedBadge(undefined)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap border ${
                    !selectedBadge ? "bg-yellow-400 text-black border-yellow-400 font-bold" : "bg-zinc-900 text-zinc-400 border-white/5"
                  }`}
                >
                  Không nhãn
                </button>
                <button
                  onClick={() => setSelectedBadge({ type: "weather", text: "28°C • Nắng đẹp ☀️", icon: "☀️" })}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap border flex items-center gap-1 ${
                    selectedBadge?.type === "weather" ? "bg-yellow-400 text-black border-yellow-400 font-bold" : "bg-zinc-900 text-zinc-400 border-white/5"
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  Thời tiết
                </button>
                <button
                  onClick={() => setSelectedBadge({ type: "music", text: "🎵 Nơi Này Có Anh - Sơn Tùng M-TP", icon: "🎵" })}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap border flex items-center gap-1 ${
                    selectedBadge?.type === "music" ? "bg-yellow-400 text-black border-yellow-400 font-bold" : "bg-zinc-900 text-zinc-400 border-white/5"
                  }`}
                >
                  <Music className="w-3 h-3" />
                  Bài hát
                </button>
                <button
                  onClick={() => setSelectedBadge({ type: "battery", text: "⚡ 88% Pin • Đang sạc", icon: "⚡" })}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap border flex items-center gap-1 ${
                    selectedBadge?.type === "battery" ? "bg-yellow-400 text-black border-yellow-400 font-bold" : "bg-zinc-900 text-zinc-400 border-white/5"
                  }`}
                >
                  <BatteryCharging className="w-3 h-3" />
                  Pin
                </button>
                <button
                  onClick={() => setSelectedBadge({ type: "location", text: "📍 Hà Nội, Việt Nam", icon: "📍" })}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap border flex items-center gap-1 ${
                    selectedBadge?.type === "location" ? "bg-yellow-400 text-black border-yellow-400 font-bold" : "bg-zinc-900 text-zinc-400 border-white/5"
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  Vị trí
                </button>
              </div>
            </div>

            {/* Special Feature Toggles (View Once, Time Capsule, Date Stamp) */}
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-zinc-900/60 rounded-2xl border border-white/5">
              {/* View Once Toggle (Tính năng 6) */}
              <button
                onClick={() => setIsViewOnce(!isViewOnce)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all ${
                  isViewOnce
                    ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : "bg-zinc-900 text-zinc-400 border-white/5"
                }`}
                title="Ảnh bí mật tự hủy sau khi xem"
              >
                <Eye className="w-3 h-3" />
                <span>Xem 1 lần</span>
              </button>

              {/* Time Capsule Toggle (Tính năng 3) */}
              <button
                onClick={() => setIsTimeCapsule(!isTimeCapsule)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all ${
                  isTimeCapsule
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-zinc-900 text-zinc-400 border-white/5"
                }`}
                title="Khóa ảnh đến tương lai mới mở"
              >
                <Lock className="w-3 h-3" />
                <span>Hộp thư</span>
              </button>

              {/* Vintage Date Stamp (Tính năng 7) */}
              <button
                onClick={() => setHasDateStamp(!hasDateStamp)}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all ${
                  hasDateStamp
                    ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/40"
                    : "bg-zinc-900 text-zinc-400 border-white/5"
                }`}
                title="Đóng dấu ngày giờ cổ điển cam '26 11 23"
              >
                <Clock className="w-3 h-3" />
                <span>Dấu ngày</span>
              </button>
            </div>

            {/* Time Capsule Duration options */}
            {isTimeCapsule && (
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <span className="text-amber-300 font-bold">Khóa và mở sau:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 7, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setCapsuleDays(d)}
                      className={`px-2 py-0.5 rounded-lg font-bold border ${
                        capsuleDays === d
                          ? "bg-amber-400 text-black border-amber-400"
                          : "bg-zinc-900 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {d} ngày
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Caption Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Thêm lời nhắn (caption)..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={90}
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 transition-all"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-zinc-500">
                {caption.length}/90
              </span>
            </div>

            {/* Recipient Selector */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-yellow-400" />
                  Người nhận
                </span>
                <button
                  onClick={() => setSentToAll(!sentToAll)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-all ${
                    sentToAll
                      ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/30"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {sentToAll ? "Tất cả bạn bè" : "Chọn bạn cụ thể"}
                </button>
              </div>

              {!sentToAll && (
                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                  {friends.map((friend) => {
                    const isSelected = selectedRecipients.includes(friend.id);
                    return (
                      <button
                        key={friend.id}
                        onClick={() => toggleRecipient(friend.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs whitespace-nowrap transition-all ${
                          isSelected
                            ? "bg-yellow-400 text-black border-yellow-400 font-bold"
                            : "bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                        }`}
                      >
                        <img src={friend.avatarUrl} alt={friend.name} className="w-4 h-4 rounded-full" />
                        <span>{friend.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-black" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleRetake}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold border border-white/10 transition-all text-center"
              >
                Chụp lại
              </button>
              <button
                onClick={handlePostOrSchedule}
                disabled={isSubmitting}
                className="flex-[2] py-2.5 px-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-lg shadow-yellow-400/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-black" />
                    Gửi Khoảnh Khắc
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
