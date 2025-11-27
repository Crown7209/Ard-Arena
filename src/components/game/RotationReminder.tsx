"use client";

const RotationReminder = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 text-white">
      <div className="flex flex-col items-center justify-center gap-8 px-6">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Portrait phone (faint) */}
          <div className="absolute top-0 right-0 w-16 h-24 border-2 border-gray-700 rounded-lg opacity-50" />
          
          {/* Landscape phone (prominent) */}
          <div className="absolute bottom-0 left-0 w-24 h-16 border-2 border-white rounded-lg bg-gray-800">
            <div className="w-full h-full bg-gray-900 rounded-md" />
          </div>
          
          {/* Rotation arrow */}
          <svg
            className="absolute top-2 right-2 w-32 h-32 text-[#64ccc5]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 80 20 Q 50 50 20 80"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 15 75 L 20 80 L 25 75"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Rotate device</h2>
          <p className="text-gray-400 text-sm">
            This game supports only landscape orientation
          </p>
        </div>
      </div>
    </div>
  );
};

export default RotationReminder;

