'use client';

import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import { Sparkles, Briefcase, MessageCircle, Star, BookText } from "lucide-react";
import { CardTextResponse } from "@/components/ui/card-text-response";
import { SynonymCards } from "@/components/ui/synonym-cards";
import { Toast, useToast } from "@/components/ui/toast";
import { useState } from "react";

export default function Home() {
  const [responseText, setResponseText] = useState<string>("");
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { show, message, showToast } = useToast();

  const handleSubmit = async (text: string, action?: string) => {
    if (!action) {
      return;
    }

    // Clear previous responses and set loading state
    setResponseText("");
    setSynonyms([]);
    setIsLoading(true);

    // Check if action is explicitly "synonym" or if input is a single word
    const wordCount = text.trim().split(/\s+/).length;
    const isSingleWord = wordCount === 1;
    const isSynonymAction = action.toLowerCase() === 'synonym';
    const useSynonymEndpoint = isSynonymAction || isSingleWord;

    try {
      const endpoint = useSynonymEndpoint ? '/api/synonym' : '/api/rephrase';
      const bodyKey = useSynonymEndpoint ? 'word' : 'sentence';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [bodyKey]: text,
          ...(useSynonymEndpoint ? {} : { sentiment: action.toLowerCase() }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorMessage = 'API request failed';

        if (response.status === 403) {
          errorMessage = 'Request blocked by security check. Please refresh and try again.';
        } else if (response.status === 400) {
          // Validation error from server
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || 'Invalid input';
          } catch {
            errorMessage = 'Invalid input';
          }
        } else if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }

        console.error('API request failed:', errorMessage, response.status);
        showToast(errorMessage); // Show error in toast
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      try {
        if (useSynonymEndpoint) {
          if (data.synonyms && Array.isArray(data.synonyms)) {
            setSynonyms(data.synonyms);
          }
        } else {
          if (action.toLowerCase() === 'star method') {
            // Helper to find key case-insensitively
            const getValue = (obj: any, key: string) => {
              const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
              return foundKey ? obj[foundKey] : undefined;
            };

            const situation = getValue(data, 'situation');
            const task = getValue(data, 'task');
            const starAction = getValue(data, 'action');
            const result = getValue(data, 'result');

            const formattedStar = `Situation: ${situation || '...'}

Task: ${task || '...'}

Action: ${starAction || '...'}

Result: ${result || '...'}`;
            setResponseText(formattedStar);
          } else {
            setResponseText(data.rephrased || JSON.stringify(data));
          }
        }
      } catch (e) {
        console.error('Failed to handle response:', e);
        setResponseText('Error processing response');
      }

    } catch (error) {
      console.error('Error calling API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-bg-base">
      {/* Grid background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(232,221,211)_1px,transparent_1px),linear-gradient(to_bottom,rgb(232,221,211)_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <main className="relative flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-12 px-4">
        {/* Main container with brutalist border */}
        <div className="relative w-full h-[85vh] border-4 border-black/70 rounded-3xl bg-[#FAF7F5] p-8 mr-2 md:mr-0 md:p-12 shadow-[8px_8px_0px_0px_rgba(45,45,45,1)] flex flex-col">
          <div className="flex flex-col items-center w-full flex-1 min-h-0">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-8 text-center uppercase tracking-tight flex-shrink-0">
              AI Text Rephraser & Synonym Finder
            </h1>
            <div className="w-full flex-shrink-0">
              <AIInputWithSuggestions
                actions={CUSTOM_ACTIONS}
                defaultSelected="Fluent"
                placeholder="Enter text to rephrase, find synonyms for a word, or use the STAR method..."
                onSubmit={handleSubmit}
                disabled={isLoading}
              />
            </div>

            {synonyms.length > 0 && (
              <SynonymCards synonyms={synonyms} />
            )}

            {responseText && (
              <CardTextResponse text={responseText} />
            )}
          </div>

          {/* Toast notification */}
          <Toast show={show} message={message} />
        </div>
      </main>
    </div>
  );
}

const CUSTOM_ACTIONS = [
  {
    text: "Fluent",
    icon: Sparkles,
    colors: {
      icon: "text-blue-600",
      border: "border-blue-500",
      bg: "bg-blue-100",
    },
  },
  {
    text: "Professional",
    icon: Briefcase,
    colors: {
      icon: "text-green-600",
      border: "border-green-400",
      bg: "bg-green-100",
    },
  },
  {
    text: "Casual",
    icon: MessageCircle,
    colors: {
      icon: "text-purple-600",
      border: "border-purple-500",
      bg: "bg-purple-200",
    },
  },
  {
    text: "STAR Method",
    icon: Star,
    colors: {
      icon: "text-amber-600",
      border: "border-amber-500",
      bg: "bg-amber-100",
    },
  },
  {
    text: "Synonym",
    icon: BookText,
    colors: {
      icon: "text-rose-600",
      border: "border-rose-400",
      bg: "bg-rose-100",
    },
  },
];