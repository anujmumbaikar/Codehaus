"use client'"
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { UserButton } from "@clerk/nextjs"
import { use } from "react";
import {dark} from '@clerk/themes'

interface UserControlProps {
    showName?: boolean;
}
function UserControl({ showName }: UserControlProps) {
    const currentTheme = useCurrentTheme();
  return (
    <UserButton
    showName={showName}
    appearance={{
      elements: {
        userButtonAvatarBox: "rouded-md!",
        userButtonAvatar: "rounded-md! size-8!",
        userButtonTrigger: "rounded-md!",
      },
      baseTheme: currentTheme === "dark" ? dark : undefined,
    }}
    />
  )
}

export default UserControl