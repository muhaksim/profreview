"use client";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RAG } from "@/utils/actions";
import Markdown from "react-markdown";

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
    <div className="flex flex-col h-screen text-black">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center gap-4">
        <Avatar>
          <AvatarImage src="/placeholder-user.jpg" alt="ChatGPT" />
          <AvatarFallback>GPT</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">Customer Support Bot</h2>
          <p className="text-sm text-primary-foreground/80">AI Assistant</p>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 ${
              message.role === "user" ? "justify-end" : ""
            }`}
          >
            {message.role === "user" ? (
              <>
                <div className={`rounded-lg p-4 max-w-[80%] bg-blue-100`}>
                  <p>{message.content}</p>
                </div>
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" alt={message.role} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </>
            ) : (
              <>
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" alt={message.role} />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <div className={`rounded-lg p-4 max-w-[80%] bg-gray-100`}>
                  <Markdown>{message.content}</Markdown>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="bg-background border-t px-6 py-4">
        {isAITyping && (
          <div className="flex items-center gap-2 mb-2">
            <Avatar>
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
            className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16"
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
            className="absolute w-8 h-8 top-3 right-3"
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === "" || isAITyping}
          >
            <ArrowUpIcon className="w-4 h-4" />
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
