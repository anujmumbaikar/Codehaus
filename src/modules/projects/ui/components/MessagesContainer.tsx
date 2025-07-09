import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import MessageCard from "./MessageCard";
import MessageForm from "./MessageForm";
import { Fragment } from "@/generated/prisma";
import MessageLoading from "./MessageLoading";

interface Props {
  projectId: string;
  activeFragment:Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;

}

function MessagesContainer({ projectId,activeFragment,setActiveFragment }: Props) {
    const bottomRef = React.useRef<HTMLDivElement>(null);
  const trpc = useTRPC();
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({
      projectId: projectId,
    },{
      refetchInterval: 5000,
    })
  );
  useEffect(()=>{
    const lastAssistantMessageWithFragment = messages.findLast(
        (message) => message.role === "ASSISTANT" && message.Fragment,
    );
    if (lastAssistantMessageWithFragment) {
      setActiveFragment(lastAssistantMessageWithFragment.Fragment);
    }
  },[messages,setActiveFragment])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const lastMessage = messages[messages.length - 1];
    const isLastMessageUser = lastMessage?.role === "USER";
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              fragment={message.Fragment}
              createdAt={message.createdAt}
              isActiveFragment={activeFragment?.id === message.Fragment?.id}
              onFragmentClick={() => setActiveFragment(message.Fragment)}
              type={message.type}
            />
          ))}
          {isLastMessageUser && <MessageLoading/> }
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="relative p-3 pt-1">
        <div className="absoulte -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none"/>
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
}

export default MessagesContainer;
