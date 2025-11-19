"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Toast, useToast } from "@/components/ui/toast";

interface CardTextResponseProps {
    text: string;
    className?: string;
}

export function CardTextResponse({ text, className }: CardTextResponseProps) {
    const [copied, setCopied] = useState(false);
    const { show, message, showToast } = useToast();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            showToast("Copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <>
            <button
                onClick={handleCopy}
                className={cn(
                    "relative w-full max-w-xl mx-auto mt-6",
                    "rounded-lg border-2 border-text-primary",
                    "bg-bg-container",
                    "p-6",
                    "animate-fadeIn",
                    "hover:bg-bg-base transition-colors duration-200",
                    "cursor-pointer text-left",
                    className
                )}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wide">
                            Rephrased Result
                        </h3>
                        <p className="text-base text-text-primary leading-relaxed whitespace-pre-wrap">
                            {text}
                        </p>
                    </div>
                    {copied && (
                        <Check className="w-5 h-5 text-accent-brown flex-shrink-0" />
                    )}
                </div>
            </button>
            <Toast show={show} message={message} />
        </>
    );
}
