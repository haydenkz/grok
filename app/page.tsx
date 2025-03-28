"use client";
import { Textarea } from "@/components/ui/textarea";
import Header from "./components/Header";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";

// Define message type
interface Message {
    role: string;
    content: string;
}

// MessagesList: Renders the chat messages and handles scrolling/highlighting
function MessagesList({ messages, isLoading }: { messages: Message[], isLoading: boolean }) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages or loading state changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Highlight code blocks when messages change
    useEffect(() => {
        if (messagesContainerRef.current) {
            Prism.highlightAllUnder(messagesContainerRef.current);
        }
    }, [messages]); // Only depends on messages, not prompt

    return (
        <div className="flex overflow-y-auto wrap p-4 ">
            <div
                ref={messagesContainerRef}
                className="flex flex-col w-full max-w-2xl mx-auto space-y-4"
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex w-full ${
                            message.role === "assistant"
                                ? "w-full"
                                : "justify-end"
                        }`}
                    >
                        <div
                            className={`${
                                message.role === "assistant"
                                    ? "opacity-80 max-w-[100%]"
                                    : "bg-[#313234] text-white opacity-70 rounded-t-4xl rounded-bl-4xl border-[1px] max-w-[80%] rounded-br-md"
                            } px-4 py-3 break-words`}
                        >
                            <ReactMarkdown
                                rehypePlugins={[rehypeSanitize]}
                                components={{
                                    code({
                                        // node,
                                        className,
                                        children,
                                        ...props
                                    }) {
                                        const match = /language-(\w+)/.exec(
                                            className || ""
                                        );
                                        return !className?.includes("inline") ? (
                                            <div className="overflow-x-auto my-2 rounded-lg">
                                                <pre className="bg-[#1E1E1E] p-3 rounded-lg">
                                                    <code
                                                        className={
                                                            match
                                                                ? `language-${match[1]}`
                                                                : "language-text"
                                                        }
                                                        {...props}
                                                    >
                                                        {String(
                                                            children
                                                        ).replace(/\n$/, "")}
                                                    </code>
                                                </pre>
                                            </div>
                                        ) : (
                                            <code
                                                className="bg-[#1E1E1E] px-1 py-0.5 rounded text-xs text-gray-200 w-full"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start w-full">
                        <div className="opacity-80 max-w-[80%] p-4">
                            <span className="animate-pulse">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}

// ChatInput: Manages the input area and submission
function ChatInput({ onSubmit, isLoading }: { onSubmit: (prompt: string) => void; isLoading: boolean }) {
    const [prompt, setPrompt] = useState("");

    const handleSubmit = () => {
        if (!prompt || isLoading) return;
        onSubmit(prompt);
        setPrompt("");
    };

    return (
        <div className="px-4 pb-3 bg-transparent justify-center items-center flex">
            <div className="flex max-w-[51rem] w-full flex-col min-h-20 items-center justify-center rounded-3xl bg-card relative border-[1px] overflow-hidden max-h-80">
                <Textarea
                    placeholder="What do you want to know?"
                    className="w-full border-none shadow-none focus-visible:ring-0 rounded-3xl pt-5 pb-0 scrollbar-thin resize-none opacity-90"
                    onChange={(e) => setPrompt(e.target.value)}
                    value={prompt}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
                <div className="flex flex-row items-center w-full px-4 mt-12">
                    <button
                        className={`flex items-center justify-center w-8 h-8 p-2 rounded-full ${
                            prompt && !isLoading ? "bg-white" : "bg-[#454648]"
                        } text-black absolute bottom-4 right-4`}
                        onClick={handleSubmit}
                        disabled={!prompt || isLoading}
                    >
                        {prompt && !isLoading ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 opacity-70"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Home: Parent component managing state and layout
export default function Home() {
    const [chatStarted, setChatStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "" },
    ]);

    const handleNewMessage = async (prompt: string) => {
        const userMessage = { role: "user", content: prompt };
        setMessages((prev) => [...prev, userMessage]);
        setChatStarted(true);
        setIsLoading(true);

        try {
            const messageLog = messages.concat(userMessage).map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));
            const response = await fetch("/api/grok", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messageLog),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API error (${response.status}):`, errorText);
                throw new Error(
                    `API responded with status: ${response.status}`
                );
            }

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.choices[0].message.content },
            ]);
        } catch (error) {
            console.error("Error calling Grok API:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Sorry, I encountered an error. Please try again later.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // calculate the height of minus the header height

        <main className="flex flex-col h-[calc(100vh-4rem)] ">
            <Header />
            <div className="flex-1 overflow-hidden flex flex-col">
                {!chatStarted && (
                    <div className="flex flex-col items-center justify-center w-full h-full p-4">
                        <h1 className="text-2xl font-bold text-center">
                            Welcome to Grok.
                        </h1>
                        <p className="mt-2 text-lg text-center opacity-50">
                            How can I help you today?
                        </p>
                    </div>
                )}
                {chatStarted && (
                    <MessagesList messages={messages} isLoading={isLoading} />
                )}
            </div>
            <ChatInput onSubmit={handleNewMessage} isLoading={isLoading} />
        </main>
    );
}
