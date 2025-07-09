import React from 'react'
import Image from 'next/image'
import { useState,useEffect } from 'react'


const ShimmerMessages = ()=>{
    const messages = [
        "Thinking...",
        "Loading messages...",
        "Generating response...",
        "Analyzing your request...",
        "Building your website...",
        "Crafting components...",
        "Optimizing layout...",
        "Adding final touches...",
        "Almost there...",
    ]
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    useEffect(()=>{
        const interval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex +1) % messages.length);
        }, 2000);
        return () => clearInterval(interval);
    },[])
    return (
        <div className='flex itmes-center gap-2'>
            <span className='text-base text-muted-foreground animate-pulse'>
                {messages[currentMessageIndex]}
            </span>
        </div>
    )
}

function MessageLoading() {
  return (
    <div className='flex flex-col group px-2 pb-4'>
        <div className='flex items-center mb-2 gap-2 pl-2'>
            <Image
                src="/CodeHaus.svg"
                alt="CodeHaus"
                width={24}
                height={24}
                className='shrink-0'
            />
            <span className='text-sm font-medium'>CodeHaus</span>
        </div>
        <div className='pl-8.5 flex flex-col gap-y-4'>
            <ShimmerMessages/>
        </div>
    </div>
  )
}

export default MessageLoading