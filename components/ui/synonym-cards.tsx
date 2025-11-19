"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Toast, useToast } from "@/components/ui/toast";

interface SynonymCardsProps {
    synonyms: string[];
    className?: string;
}

export function SynonymCards({ synonyms, className }: SynonymCardsProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const { show, message, showToast } = useToast();

    const handleCopy = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            showToast("Copied to clipboard!");
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <>
            <div className={cn("w-full max-w-xl mx-auto mt-4", className)}>
                <h3 className="text-xs font-semibold text-text-muted mb-2 px-1 uppercase tracking-wide">
                    Alternatives
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {synonyms.map((synonym, index) => (
                        <button
                            key={index}
                            onClick={() => handleCopy(synonym, index)}
                            className={cn(
                                "relative rounded-lg border-2 border-text-primary",
                                "bg-bg-container",
                                "p-2",
                                "animate-fadeIn",
                                "hover:bg-bg-base transition-colors duration-200",
                                "cursor-pointer text-left w-full"
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-text-primary truncate">
                                    {synonym}
                                </span>
                                {copiedIndex === index && (
                                    <Check className="w-3 h-3 text-accent-brown flex-shrink-0" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <Toast show={show} message={message} />
        </>
    );
}
