"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface ToastProps {
    message: string;
    show: boolean;
}

export function Toast({ message, show }: ToastProps) {
    if (!show) return null;

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
            <div className="flex items-center gap-2 bg-text-primary text-bg-container px-4 py-3 rounded-lg border-2 border-text-primary shadow-[4px_4px_0px_0px_rgba(45,45,45,1)]">
                <Check className="w-4 h-4" />
                <span className="font-semibold text-sm">{message}</span>
            </div>
        </div>
    );
}

export function useToast() {
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState("");

    const showToast = (msg: string) => {
        setMessage(msg);
        setShow(true);
        setTimeout(() => setShow(false), 2000);
    };

    return { show, message, showToast };
}
