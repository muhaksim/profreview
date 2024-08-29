/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RAG } from "@/utils/actions";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function MainPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [inputMessage, setInputMessage] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    const newUserMessage = { role: "user", content: inputMessage };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage("");
    setIsAITyping(true);

    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const response = await RAG(inputMessage);

    const assistantMessage = { role: "assistant", content: response.generated };
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        role: assistantMessage.role,
        content: assistantMessage.content?.toString() ?? "",
      },
    ]);
    setIsAITyping(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-[#de5d58] text-white py-4 px-6 flex items-center gap-4 shadow-md">
        <Avatar className="h-12 w-12">
          <AvatarImage src="/placeholder-user.jpg" alt="ChatGPT" />
          <AvatarFallback><img src="bot.png" alt="Bot"/></AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold">Profreview</h2>
          <p className="text-sm opacity-80">AI Assistant</p>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-4",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "user" ? (
              <>
                <div className="rounded-2xl p-4 max-w-[80%] bg-[#de5d58] text-white shadow-md">
                  <p>{message.content}</p>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder-user.jpg" alt={message.role} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder-user.jpg" alt={message.role} />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <div className="rounded-2xl p-4 max-w-[80%] bg-white shadow-md">
                  <Markdown>{message.content}</Markdown>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="bg-white border-t px-6 py-4 shadow-md">
        {isAITyping && (
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" alt="assistant" />
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-500">
              Typing<span className="animate-pulse">...</span>
            </p>
          </div>
        )}
        <div className="relative">
          <Textarea
            placeholder="Message Customer Support..."
            name="message"
            id="message"
            rows={1}
            className="min-h-[48px] rounded-full resize-none p-4 pr-16 border-2 border-[#de5d58] focus:ring-2 focus:ring-[#de5d58] focus:border-transparent"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            className="absolute w-10 h-10 top-2 right-2 rounded-full bg-[#de5d58] hover:bg-[#c54c47] transition-colors"
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === "" || isAITyping}
          >
            <ArrowUpIcon className="w-5 h-5 text-white" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}
