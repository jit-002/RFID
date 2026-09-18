import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  ArrowUp,
  X,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Copy,
  Mic,
  MicOff,
  Sparkles,
  BookOpen,
  Square
} from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

export interface FileWithPreview {
  id: string;
  file: File;
  preview?: string;
  type: string;
  uploadStatus: "pending" | "uploading" | "complete" | "error";
  uploadProgress?: number;
  textContent?: string;
  base64?: string;
}

export interface PastedContent {
  id: string;
  content: string;
  timestamp: Date;
  wordCount: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

interface ChatInputProps {
  initialValue?: string;
  onSendMessage?: (
    message: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[]
  ) => void;
  onStopGeneration?: () => void;
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  models?: ModelOption[];
  defaultModel?: string;
  onModelChange?: (modelId: string) => void;
  isListening?: boolean;
  onToggleVoice?: () => void;
}

const MAX_FILES = 8;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const PASTE_THRESHOLD = 250;

export const DEFAULT_STUDY_MODELS: ModelOption[] = [
  {
    id: "auto",
    name: "Auto",
    description: "Auto-adaptive AI according to tasks (fast, reasoning, vision, creative)",
    badge: "Auto",
  },
  {
    id: "sathi-3.6",
    name: "Sathi 3.6",
    description: "Ultra-fast academic reasoning & mathematical solver",
    badge: "Fast",
  },
  {
    id: "sathi-3.8",
    name: "Sathi 3.8",
    description: "Advanced numerical problem solver & question paper analysis",
    badge: "Fast",
  },
  {
    id: "sathi-vision",
    name: "Sathi Vision",
    description: "Multimodal vision specialist for diagrams, charts, and handwritten pages",
    badge: "Vision",
  },
  {
    id: "sathi-pro",
    name: "Sathi Pro",
    description: "Deep derivations, proofs & complex competitive exam reasoning",
    badge: "Pro",
  },
  {
    id: "claude-sathi",
    name: "Sathi Claude",
    description: "Detailed step-by-step conceptual essays & programming explanations",
  },
  {
    id: "gpt-sathi",
    name: "Sathi GPT",
    description: "General board preparation, chemistry reactions & revision notes",
  },
  {
    id: "sathi-creative",
    name: "Sathi Creative",
    description: "AI visual generation for educational diagrams, illustrations, and posters",
    badge: "Creative",
  },
  {
    id: "sathi-canvas",
    name: "Sathi Canvas",
    description: "High-resolution academic diagrams, scientific charts, and formula sheets",
    badge: "Canvas",
  },
];

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const isTextualFile = (file: File): boolean => {
  const textualTypes = [
    "text/",
    "application/json",
    "application/xml",
    "application/javascript",
    "application/typescript",
  ];
  const textualExtensions = [
    "txt", "md", "py", "js", "ts", "jsx", "tsx", "html", "css", "json", "xml", "csv", "sql", "java", "cpp", "c"
  ];
  const isMime = textualTypes.some(type => file.type.toLowerCase().startsWith(type));
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return isMime || textualExtensions.includes(ext);
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const FilePreviewCard: React.FC<{
  file: FileWithPreview;
  onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith("image/");
  const isTextual = isTextualFile(file.file);

  return (
    <div className="relative group bg-slate-900/90 border border-white/10 rounded-xl p-2.5 size-[115px] shadow-lg flex-shrink-0 overflow-hidden">
      {isImage && file.preview ? (
        <div className="relative size-full rounded-lg overflow-hidden bg-black/60">
          <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
            <span className="text-[10px] font-mono text-cyan-300 truncate max-w-full">
              {file.file.name}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-[11px] font-semibold truncate text-white">{file.file.name}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {formatFileSize(file.file.size)}
          </div>
          <div className="px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-cyan-400 border border-cyan-500/20 w-fit">
            {file.file.type === "application/pdf" || file.file.name.toLowerCase().endsWith(".pdf")
              ? "PDF / QUESTION PAPER"
              : isTextual
              ? "TEXT/CODE"
              : "DOCUMENT"}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => onRemove(file.id)}
        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100"
        title="Remove file"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

const PastedContentCard: React.FC<{
  content: PastedContent;
  onRemove: (id: string) => void;
}> = ({ content, onRemove }) => {
  return (
    <div className="relative group bg-slate-900/90 border border-white/10 rounded-xl p-2.5 size-[115px] shadow-lg flex-shrink-0 overflow-hidden flex flex-col justify-between">
      <div className="text-[9px] text-slate-300 overflow-hidden leading-relaxed line-clamp-4">
        {content.content}
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[9px] font-mono text-cyan-400">
        <span>{content.wordCount} words</span>
        <span className="text-slate-500">PASTED</span>
      </div>

      <button
        type="button"
        onClick={() => onRemove(content.id)}
        className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/80 hover:bg-rose-600 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100"
        title="Remove content"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

export const ClaudeChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  disabled = false,
  placeholder = "Ask Study Sathi (PVM 2.0) anything — math problem, CBSE question paper, code, or essay...",
  maxFiles = MAX_FILES,
  maxFileSize = MAX_FILE_SIZE,
  acceptedFileTypes = ["image/*", ".pdf", ".txt", ".md", ".py", ".js", ".html"],
  models = DEFAULT_STUDY_MODELS,
  defaultModel = "auto",
  onModelChange,
  initialValue = "",
  isListening = false,
  onToggleVoice,
}) => {
  const [message, setMessage] = useState(initialValue || "");

  useEffect(() => {
    if (initialValue) {
      setMessage(initialValue);
    }
  }, [initialValue]);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = 160;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  useEffect(() => {
    if (defaultModel) {
      setSelectedModel(defaultModel);
    }
  }, [defaultModel]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileSelect = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const availableSlots = maxFiles - files.length;
      if (availableSlots <= 0) return;

      const filesToAdd = Array.from(selectedFiles).slice(0, availableSlots);

      for (const file of filesToAdd) {
        if (file.size > maxFileSize) continue;

        const id = `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        let textContent: string | undefined;
        let base64: string | undefined;

        if (isTextualFile(file)) {
          try {
            textContent = await readFileAsText(file);
          } catch {}
        }

        if (isImage || isPdf) {
          try {
            base64 = await readFileAsBase64(file);
          } catch {}
        }

        const newFileItem: FileWithPreview = {
          id,
          file,
          preview: isImage ? URL.createObjectURL(file) : undefined,
          type: file.type || (isPdf ? "application/pdf" : "application/octet-stream"),
          uploadStatus: "complete",
          uploadProgress: 100,
          textContent,
          base64,
        };

        setFiles(prev => [...prev, newFileItem]);
      }
    },
    [files.length, maxFiles, maxFileSize]
  );

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData.items;
      const fileItems = Array.from(items).filter(item => item.kind === "file");

      if (fileItems.length > 0 && files.length < maxFiles) {
        e.preventDefault();
        const pastedFiles = fileItems.map(item => item.getAsFile()).filter(Boolean) as File[];
        const dataTransfer = new DataTransfer();
        pastedFiles.forEach(file => dataTransfer.items.add(file));
        handleFileSelect(dataTransfer.files);
        return;
      }

      const textData = e.clipboardData.getData("text");
      if (textData && textData.length > PASTE_THRESHOLD && pastedContent.length < 5) {
        e.preventDefault();
        setMessage(prev => prev + (prev ? " " : "") + textData.slice(0, 150) + "...");
        const pastedItem: PastedContent = {
          id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          content: textData,
          timestamp: new Date(),
          wordCount: textData.split(/\s+/).filter(Boolean).length,
        };
        setPastedContent(prev => [...prev, pastedItem]);
      }
    },
    [handleFileSelect, files.length, maxFiles, pastedContent.length]
  );

  const handleSend = () => {
    if (disabled || (!message.trim() && files.length === 0 && pastedContent.length === 0)) return;

    onSendMessage?.(message, files, pastedContent);
    setMessage("");
    setFiles([]);
    setPastedContent([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = message.trim() || files.length > 0 || pastedContent.length > 0;
  const activeModelObj = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div
      className="relative w-full max-w-4xl mx-auto"
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
      onDrop={e => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files);
      }}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-cyan-950/80 border-2 border-dashed border-cyan-400 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md">
          <p className="text-sm font-bold text-cyan-300 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 animate-bounce" />
            Drop question paper or image to inspect
          </p>
        </div>
      )}

      <div className="bg-[#121620]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col focus-within:border-cyan-500/50 transition-all">
        {/* Uploads Preview Bar */}
        {(files.length > 0 || pastedContent.length > 0) && (
          <div className="overflow-x-auto border-b border-white/[0.08] p-3 flex gap-2.5 bg-black/30 rounded-t-2xl">
            {pastedContent.map(content => (
              <PastedContentCard
                key={content.id}
                content={content}
                onRemove={id => setPastedContent(prev => prev.filter(c => c.id !== id))}
              />
            ))}
            {files.map(file => (
              <FilePreviewCard key={file.id} file={file} onRemove={removeFile} />
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full p-4 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none resize-none border-none leading-relaxed custom-scrollbar max-h-40 min-h-[70px]"
          rows={1}
        />

        {/* Actions Bottom Bar */}
        <div className="flex items-center justify-between px-3.5 pb-3 pt-1">
          <div className="flex items-center gap-1.5">
            {/* File upload trigger */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || files.length >= maxFiles}
              className="h-9 w-9 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl"
              title="Attach question paper, image, or code"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Voice input mic trigger */}
            {onToggleVoice && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onToggleVoice}
                className={cn(
                  "h-9 w-9 rounded-xl transition-all",
                  isListening
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                    : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                )}
                title={isListening ? "Listening... click to stop" : "Speak question"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono ml-2">
              <BookOpen className="h-3 w-3 text-cyan-400" />
              <span>Study Sathi 2.0 Academic Engine</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Model Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/[0.06] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span className="truncate max-w-[80px] sm:max-w-[130px]">{activeModelObj.name}</span>
                <ChevronDown className={cn("h-3 w-3 text-slate-400 transition-transform", isModelDropdownOpen && "rotate-180")} />
              </button>

              {isModelDropdownOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-72 max-w-[calc(100vw-24px)] bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Select Inference Model
                  </div>
                  {models.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id);
                        onModelChange?.(m.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left p-2 rounded-xl transition-colors flex items-center justify-between text-xs",
                        m.id === selectedModel ? "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30" : "hover:bg-white/[0.06] text-slate-300"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white truncate">{m.name}</span>
                          {m.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{m.description}</p>
                      </div>
                      {m.id === selectedModel && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Send or Stop Button */}
            {disabled && onStopGeneration ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-md bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40"
                title="Stop generation"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!hasContent || disabled}
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-md",
                  hasContent && !disabled
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-glow-cyan hover:scale-105"
                    : "bg-white/[0.05] text-slate-600 cursor-not-allowed border border-white/[0.05]"
                )}
                title="Send message (Enter)"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept={acceptedFileTypes.join(",")}
        onChange={e => {
          handleFileSelect(e.target.files);
          if (e.target) e.target.value = "";
        }}
      />
    </div>
  );
};
