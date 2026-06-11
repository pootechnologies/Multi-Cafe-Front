import { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Move, Maximize, RotateCcw } from "lucide-react";

const ImageModal = ({ imageUrl, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const modalContentRef = useRef(null);

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      if (modalContentRef.current) {
        modalContentRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = (e.clientX - startPos.x) / zoomLevel;
    const newY = (e.clientY - startPos.y) / zoomLevel;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (modalContentRef.current) {
      modalContentRef.current.style.cursor = 'grab';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[2000] p-4 animate-in fade-in duration-300"
      onWheel={handleWheel}
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        className="relative bg-white/5 dark:bg-slate-900/50 rounded-[32px] p-2 max-w-[95vw] max-h-[95vh] border border-white/10 overflow-hidden shadow-2xl"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Controls */}
        <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-rose-500/80 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center shadow-2xl transition-all"
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex flex-col gap-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl">
            <button onClick={handleZoomIn} className="h-10 w-10 rounded-xl hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="Zoom In">
              <ZoomIn className="h-5 w-5" />
            </button>
            <button onClick={handleZoomOut} className="h-10 w-10 rounded-xl hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="Zoom Out">
              <ZoomOut className="h-5 w-5" />
            </button>
            <button onClick={resetZoom} className="h-10 w-10 rounded-xl hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="Reset">
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Zoomed Image Container */}
        <div className="w-full h-full min-w-[300px] min-h-[300px] flex items-center justify-center overflow-hidden">
          <div
            ref={imageRef}
            className="transition-transform duration-200 ease-out will-change-transform"
            style={{
              transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
            }}
          >
            <img
              src={imageUrl}
              alt="Product Preview"
              className="max-w-[85vw] max-h-[85vh] object-contain select-none pointer-events-none rounded-xl"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
