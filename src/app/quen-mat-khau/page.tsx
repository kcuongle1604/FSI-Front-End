"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  const handleSendEmail = () => {
    console.log("Send reset email to:", email)
    router.push("/quen-mat-khau/xac-nhan-ma")
  }

  const handleBack = () => {
    router.push("/dang-nhap")
  }

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: "111.11vh" }}
    >
      {/* Background */}
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
          <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-white border">
            <Image
              src="/logo-fsi.png"
              alt="FSI Logo"
              width={100}
              height={100}
              className="object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Khôi phục mật khẩu
          </h1>
          <p className="text-gray-700">
            Vui lòng nhập email của bạn để đặt lại mật khẩu.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-900 mb-2 block"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
          </div>

          {/* Buttons – SÁT LẠI */}
          <div className="space-y-2">
            <Button
              className="w-full h-12 text-base font-medium bg-[#167FFC] hover:bg-[#1470E3]"
              onClick={handleSendEmail}
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
