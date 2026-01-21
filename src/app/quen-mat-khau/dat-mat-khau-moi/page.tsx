"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"

export default function SetNewPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleConfirm = () => {
    // UI-only: navigate temporarily
    router.push("/quen-mat-khau/xac-nhan-ma")
  }

  const handleBack = () => {
    router.push("/quen-mat-khau/xac-nhan-ma")
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

      {/* Card */}
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

        {/* Title & Description */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Khôi phục mật khẩu</h1>
          <p className="text-gray-700 text-sm leading-relaxed">
            Tạo mật khẩu mới để hoàn tất quá trình khôi phục mật khẩu.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-900 mb-2 block">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-12 border border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirm" className="text-sm font-medium text-gray-900 mb-2 block">Xác nhận mật khẩu</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 pr-12 border border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              className="w-full h-12 text-base font-medium bg-[#167FFC] hover:bg-[#1470E3]"
              onClick={handleConfirm}
            >
              Xác nhận
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={handleBack}
            >
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
