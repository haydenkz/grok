import { Textarea } from "@/components/ui/textarea";

export default function Prompt() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4">
            <div className="flex-1 h-full">
                <h1 className="text-3xl font-bold text-center text-black dark:text-white">
                    Ask me anything
                </h1>
                <p className="mt-2 text-lg text-center text-gray-500 dark:text-gray-400">
                    I am here to help you with anything you need.
                </p>
            </div>
            <div className="flex-0 flex-col items-center justify-center w-full h-full max-h-52 rounded-3xl bg-card relative border-[1px] overflow-hidden">
                <Textarea
                    placeholder="What do you want to know?"
                    className="w-full flex-1 border-none shadow-none focus-visible:ring-0 rounded-3xl pt-5 scrollbar-thin resize-none"
                />
                {/* button list */}
                <div className="flex flex-row items-center justify-end w-full px-4 mt-12">
                    {/* black up arrow button on the right side circle */}
                    <button className="flex items-center justify-center w-8 h-8 p-2 rounded-full bg-white text-black absolute bottom-4 right-4">
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
                    </button>
                </div>
            </div>
        </div>
    );
}
