import React from 'react'


interface Props{
    params: Promise<{
        projectId: string
    }>
}
async function page({params}: Props) {
    const {projectId} = await params;
  return (
    <div>
        Project ID: {projectId}
    </div>
  )
}

export default page