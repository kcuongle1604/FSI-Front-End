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
import { login } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu")
      return
    }

    try {
      setLoading(true)
      setError("")

      // 🔐 CALL API LOGIN
      const res = await login(email, password)

      // ✅ LƯU TOKEN
      localStorage.setItem("access_token", res.access_token)

      // (optional) remember me
      if (rememberMe) {
        localStorage.setItem("remember_me", "true")
      }

      // ✅ REDIRECT SAU LOGIN
      router.push("/nghiep-vu-dao-tao/xet-tot-nghiep")
    } catch (err) {
      setError("Email hoặc mật khẩu không đúng")
    } finally {
      setLoading(false)
    }
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
          <div className="rounded-full overflow-hidden w-[100px] h-[100px] bg-white border border-gray-200">
            <Image src="/logo-fsi.png" alt="FSI Logo" width={100} height={100} />
          </div>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng nhập
          </h1>
          <p className="text-gray-700">
            Nhập thông tin tài khoản để truy cập hệ thống
          </p>
        </div>

        <div className="space-y-5">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-900 mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Nhập email"
              className="h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
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

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 text-center">
              {error}
            </p>
          )}

          {/* Button */}
          <Button
            className="w-full h-12 text-base font-medium bg-[#167FFC] hover:bg-[#1470E3]"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </div>
      </div>
    </div>
  )
}