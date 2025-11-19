'use client';

import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import { Sparkles, Briefcase, MessageCircle, Star, BookText } from "lucide-react";
import { CardTextResponse } from "@/components/ui/card-text-response";
import { SynonymCards } from "@/components/ui/synonym-cards";
import { parseStreamingResponse, parseSynonyms, cleanQuotationMarks } from "@/lib/utils";
import { useState } from "react";

export default function Home() {
  const [responseText, setResponseText] = useState<string>("");
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (text: string, action?: string) => {
    if (!action) {
      console.log('No action selected');
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
        } else if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }

        console.error('API request failed:', errorMessage, response.status);
        alert(errorMessage); // Show error to user
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        console.error('No reader available');
        setIsLoading(false);
        return;
      }

      let fullResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk;
        console.log('Chunk received:', chunk);
      }

      console.log('Full response:', fullResponse);

      const extractedText = parseStreamingResponse(fullResponse);
      console.log('Extracted text:', extractedText);

      if (useSynonymEndpoint) {
        const synonymList = parseSynonyms(extractedText);
        console.log('Parsed synonyms:', synonymList);
        console.log('Synonym count:', synonymList.length);
        setSynonyms(synonymList);
      } else {
        const cleanedText = cleanQuotationMarks(extractedText);
        setResponseText(cleanedText || fullResponse);
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
        <div className="relative w-full h-[85vh] border-4 border-black/70 rounded-3xl bg-[#FAF7F5] p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(45,45,45,1)]">
          <div className="flex flex-col items-center justify-center w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-8 text-center uppercase tracking-tight">
              AI Text Rephraser & Synonym Finder
            </h1>
            <div className="w-full">
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