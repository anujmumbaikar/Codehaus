import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    EditIcon,
    SunMoonIcon
} from "lucide-react"
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface ProjectHeaderProps {
  projectId: string;
}

function ProjectHeader({projectId}: ProjectHeaderProps) {
    const trpc = useTRPC();
    const {data: project} = useSuspenseQuery(trpc.projects.getOne.queryOptions({
        id: projectId
    }));
    const {setTheme,theme} = useTheme();
  return (
    <header className="p-2 flex justify-between items-center border-b">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="focus-visible::ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2">
                <Image src="/CodeHaus.svg" alt="CodeHaus" width={24} height={24}/>
                <span>{project.name}</span>
                <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start">
            <DropdownMenuItem asChild>
                <Link href="/">
                    <ChevronLeftIcon/>
                    <span>Go to DashBoard</span>
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                    <SunMoonIcon className="size-4 text-muted-foreground"/>
                    <span>Appearence</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                            <DropdownMenuRadioItem value="light">
                                <span>Light</span>
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                                <span>Dark</span>
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                                <span>System</span>
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
        </DropdownMenuContent>
        </DropdownMenu>
    </header>
  )
}

export default ProjectHeader