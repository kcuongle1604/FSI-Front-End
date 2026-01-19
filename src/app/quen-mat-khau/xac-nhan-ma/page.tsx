"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "next/image"

export default function VerifyOTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(["", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      if (value && index < 4) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const newOtp = [...otp]

      if (otp[index]) {
        newOtp[index] = ""
        setOtp(newOtp)
      } else if (index > 0) {
        newOtp[index - 1] = ""
        setOtp(newOtp)
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 5)

    if (/^[0-9]*$/.test(pastedData)) {
      const newOtp = pastedData
        .split("")
        .concat(Array(5 - pastedData.length).fill(""))
        .slice(0, 5)

      setOtp(newOtp)
      inputRefs.current[Math.min(pastedData.length, 4)]?.focus()
    }
  }

  const handleSendOtp = () => {
    console.log("OTP Code:", otp.join(""))
    router.push("/quen-mat-khau/dat-mat-khau-moi")
  }

  const handleBack = () => {
    router.push("/quen-mat-khau")
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
          <p className="text-gray-700 text-sm leading-relaxed">
            Chúng tôi đã gửi mã gồm 5 chữ số đến test@gmail.com.
            <br />
            Vui lòng nhập mã để đặt lại mật khẩu.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-lg font-semibold rounded-lg"
              />
            ))}
          </div>

          {/* Buttons – SÁT LẠI */}
          <div className="space-y-2">
            <Button
              className="w-full h-12 text-base font-medium bg-[#167FFC] hover:bg-[#1470E3]"
              onClick={handleSendOtp}
            >
              Gửi
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

        {/* Resend */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-700">
            Chưa nhận được email?{" "}
            <button className="font-medium underline hover:no-underline">
              Gửi lại email
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
