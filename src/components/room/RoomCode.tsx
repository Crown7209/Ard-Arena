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
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm text-gray-400 uppercase tracking-widest font-bold">
        Room Code
      </span>
      <div className="flex items-center gap-4 bg-gray-800/50 px-8 py-4 rounded-2xl border border-gray-700">
        <div className="text-7xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-[0.2em]">
          {code}
        </div>
        <Button
          variant="ghost"
          onClick={copyCode}
          className="p-3 rounded-xl hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="Copy Code"
        >
          <Copy className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
