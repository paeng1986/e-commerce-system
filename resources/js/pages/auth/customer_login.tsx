import { GalleryVerticalEnd } from "lucide-react"
import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import img from "@/assets/images/banner.png"

export default function LoginPage() {

   const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div> */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm role="customer"/>
          </div>
        </div>
      </div>
      <div
        className="relative hidden lg:block h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        style={
          mounted
            ? { backgroundImage: `url(${img})`,  }
            : undefined
        }
      />
    </div>
  )
}
