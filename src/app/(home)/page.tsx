import ProjectForm from "@/modules/home/ui/components/ProjectFrom"
import { ProjectList } from "@/modules/home/ui/components/ProjectList"
import Image from "next/image"

function page() {
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full">
      <section className="space-y-6 py-[16vh] 2xl:py-48">
        <div className="flex flex-col items-center space-y-6">
          <Image
            src="/CodeHaus.svg"
            alt="CodeHaus"
            width={50}
            height={50}
            className="hidden md:block"
          />
            <h1 className="text-2xl md:text-5xl font-bold text-center">
              Build Something with your Vibe !
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-center">
              Just describe it — we’ll help you build it.
            </p>
            <div className="max-w-3xl mx-auto w-full">
              <ProjectForm/>
            </div>
        </div>
      </section>
      <ProjectList/>
    </div>
  )
}

export default page