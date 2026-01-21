"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = () => {
    router.push("/nghiep-vu-dao-tao/xet-tot-nghiep")
  }

  return (
    <div className="relative flex items-center justify-center overflow-hidden" style={{ height: '111.11vh' }}>
      {/* Background using AspectRatio */}
      <div className="absolute inset-0 -z-10">
        <AspectRatio ratio={16 / 9} className="w-full h-full">
          <Image
            src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=1920&q=80"
            alt="Background"
            fill
            priority
            className="object-cover brightness-75"
          />
        </AspectRatio>
      </div>

      {/* Foreground Content */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <div className="rounded-full overflow-hidden w-[100px] h-[100px] bg-white border border-gray-200">
            <Image
              src="/logo-fsi.png"
              alt="FSI Logo"
              width={100}
              height={100}
              className="object-cover"
            />
          </div>
        </div>

        {/* Login Form */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-gray-700">Nhập thông tin tài khoản để truy cập hệ thống</p>
        </div>

        <div className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-900 mb-2 block">
              Email
            </Label>
            <Input id="email" type="email" placeholder="Nhập email" className="h-12" />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-900 mb-2 block">
              Mật khẩu
            </Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••" 
                className="h-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <Eye size={20} />
                ) : (
                  <EyeOff size={20} />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm font-medium text-gray-900 cursor-pointer">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <Link href="/quen-mat-khau" className="text-sm text-gray-900 underline">
            Quên mật khẩu?
            </Link>

          </div>

          <Button
            className="w-full h-12 text-base font-medium bg-[#167FFC] hover:bg-[#1470E3]"
            onClick={handleLogin}
          >
            Đăng nhập
          </Button>
        </div>
      </div>
    </div>
  )
}
