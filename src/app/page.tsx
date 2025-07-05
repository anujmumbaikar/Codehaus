// "use client"
// import { useTRPC } from '@/trpc/client'
// import { useQuery } from '@tanstack/react-query';
// import React from 'react'

// function page() {
//   const trpc = useTRPC();
//   // earlier without trpc it was like this
//   // const {data} = useQuery(fetch("/api/createAI"));
//   const {data} = useQuery(trpc.createAI.queryOptions({text:"hello"}));
//   trpc.createAI.queryOptions({text:"hello"})
//   return (
//     <div>
//       {JSON.stringify(data)}
//       {data?.greeting}
//     </div>
//   )
// }
// export default page

import { caller, getQueryClient,trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react'
import Client from './api/client';
async function page() {
  // earlier without trpc it was like this
  // const {data} = await fetch("/api/createAI",body);
  // which is overhead actually , to create the path , then checking what should
  // be sent in the body , what is the type of data , etc 
  // and server component already has access to the db.

  // thats why trpc introduced somethings called as caller
  // const data = await caller.createAI({text:"Anuj server"})

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.createAI.queryOptions({text:"Anuj server"}));

  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <Client/>
      </Suspense>
    </HydrationBoundary>
  )
}

export default page