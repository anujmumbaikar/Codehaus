"use client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import MessagesContainer from "../components/MessagesContainer";
import { Suspense, useState } from "react";
import { Fragment } from "@/generated/prisma";
import ProjectHeader from "../components/ProjectHeader";
import FragmentWeb from "../components/FragmentWeb";

interface ProjectViewProps {
  projectId: string;
}
function ProjectView({ projectId }: ProjectViewProps) {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <Suspense fallback={<p>Loading Project</p>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<p>Loading Messages</p>}>
            <MessagesContainer
            projectId={projectId} 
            activeFragment={activeFragment}
            setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={65}
          minSize={50}
          className="flex flex-col min-h-0"
        >
          {!!activeFragment && <FragmentWeb data={activeFragment}/>}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default ProjectView;
