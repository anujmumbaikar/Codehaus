"use client"

import Link from "next/link"
import Image from "next/image"
import {SignIn,SignedOut,SignInButton, SignUpButton, SignedIn} from "@clerk/nextjs";
import {Button} from "@/components/ui/button";
import UserControl from "@/components/user-control/UserControl";
function Navbar() {
  return (
    <nav className="p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
            <Image
                src="/CodeHaus.svg"
                alt="CodeHaus Logo"
                width={26}
                height={26}
            />
            <span className="font-medium text-xl">CodeHaus</span>
            </Link>
            <SignedOut>
                <div className="flex gap-2">
                    <SignUpButton>
                        <Button variant="outline" size="sm">
                            Sign Up
                        </Button>
                    </SignUpButton>
                    <SignInButton>
                        <Button size="sm">
                            Sign In
                        </Button>
                    </SignInButton>
                </div>
            </SignedOut>
            <SignedIn>
                <UserControl showName={true} />
            </SignedIn>
        </div>
    </nav>
  )
}

export default Navbar