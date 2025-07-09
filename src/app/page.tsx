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

// import { caller, getQueryClient,trpc } from '@/trpc/server'
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
// import React, { Suspense } from 'react'
// import Client from './api/client';
// async function page() {
//   // earlier without trpc it was like this
//   // const {data} = await fetch("/api/createAI",body);
//   // which is overhead actually , to create the path , then checking what should
//   // be sent in the body , what is the type of data , etc
//   // and server component already has access to the db.

//   // thats why trpc introduced somethings called as caller
//   // const data = await caller.createAI({text:"Anuj server"})

//   const queryClient = getQueryClient();
//   void queryClient.prefetchQuery(trpc.createAI.queryOptions({text:"Anuj server"}));

//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <Suspense fallback={<div>Loading...</div>}>
//         <Client/>
//       </Suspense>
//     </HydrationBoundary>
//   )
// }

// export default page

"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

function page() {
  const router = useRouter()
  const [values, setValues] = React.useState("");
  const trpc = useTRPC();
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      },
      onSuccess: (data) => {
        router.push(`/projects/${data.id}`);
      }
    })
  );
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="max-w-7xl mx-auto flex items-center flex-col gap-y-4 justify-center">
        <Input
          value={values}
          onChange={(e) => setValues(e.target.value)}
          className="mb-4"
        ></Input>
        <Button
          disabled={createProject.isPending}
          onClick={() => createProject.mutate({ value: values })}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default page;
