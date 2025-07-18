import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";

interface Props{
    points:number;
    msBeforeNext:number
}


function Useage({points, msBeforeNext}:Props) {
    const {has} = useAuth();
    const hasProAccess = has?.({plan: "pro"});
  return (
    <div className="rounded-t-xl bg-background border border-b-0 p-2.5">
        <div className="flex items-center gap-x-2">
            <div>
                <p className="text-sm">
                    {points} {hasProAccess ? "Pro Points" : "Points"} Remaining
                </p>
                <p className="text-muted-foreground text-sm">
                    Resets in{""}
                    {formatDuration(
                        intervalToDuration({
                            start: new Date(),
                            end: new Date(Date.now() + msBeforeNext),
                        }),
                        {
                            format:["days", "hours", "minutes"],
                        }
                    )}
                </p>
            </div> 
            <Button
                asChild
                size="sm"
                variant="secondary"
                className="ml-auto"
            >
                <Link href="/pricing">
                <CrownIcon/> Upgrade
                </Link>
            </Button>
        </div>
    </div>
  )
}

export default Useage