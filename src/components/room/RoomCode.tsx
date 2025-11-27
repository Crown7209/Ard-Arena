import { Copy } from "lucide-react";
import { Button } from "../ui/Button";

interface RoomCodeProps {
  code: string;
}

export function RoomCode({ code }: RoomCodeProps) {
  const copyCode = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        alert("Code copied to clipboard!");
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Code copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to copy code:", err);
      alert("Failed to copy code manually");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 md:gap-4">
      <span className="text-[10px] md:text-sm text-white/60 uppercase tracking-[0.2em] md:tracking-widest font-bold">
        Room Code
      </span>
      <div className="flex items-center gap-2 md:gap-4 bg-black/60 px-3 md:px-8 py-2 md:py-4 rounded-lg md:rounded-2xl border border-white/20">
        <div className="text-2xl md:text-7xl font-mono font-black text-[#64ccc5] tracking-[0.15em] md:tracking-[0.2em]">
          {code}
        </div>
        <button
          onClick={copyCode}
          className="p-1.5 md:p-3 rounded-lg md:rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Copy Code"
        >
          <Copy className="w-3 h-3 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  );
}
