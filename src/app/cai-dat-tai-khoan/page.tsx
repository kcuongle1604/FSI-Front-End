"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import AppLayout from "@/components/AppLayout"
import { getUserMe, updateUserMe, updateUserMePassword, User } from "@/lib/user.api"

export default function CaiDatNguoiDungPage() {
  const [activeTab, setActiveTab] = useState("ho-so")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // User profile state
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: ""
  })
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })
  
  // State cho các input mật khẩu - hiển thị/ẩn
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getUserMe()
      setUser(response.data)
      setFormData({
        name: response.data.username,
        email: response.data.email,
        role: response.data.role.name
      })
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError("Không thể tải thông tin người dùng")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      await updateUserMe({
        username: formData.name,
        email: formData.email
      })
      
      setSuccess("Cập nhật thông tin thành công")
      fetchUserData()
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Không thể cập nhật thông tin người dùng")
    } finally {
      setSaving(false)
    }
  }

  const handleSavePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setError("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("Mật khẩu mới không khớp")
      return
    }

    if (passwordForm.current_password == passwordForm.confirm_password) {
      setError("Mật khẩu mới phải khác mật khẩu hiện tại")
      return
    }

    if (passwordForm.new_password.trim().length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      
      await updateUserMePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      })
      
      setSuccess("Đổi mật khẩu thành công")
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: ""
      })
    } catch (err: any) {
      console.error("Error changing password:", err)
      setError(err.response?.data?.detail || "Không thể đổi mật khẩu")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setError(null)
    setSuccess(null)
    if (user) {
      setFormData({
        name: user.username,
        email: user.email,
        role: user.role.name
      })
    }
  }

  return (
    <AppLayout showSearch={false}>
      <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Cài đặt người dùng
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="border-b border-slate-200">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger
                value="ho-so"
                className="relative min-w-[140px] justify-center flex rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                Hồ sơ
              </TabsTrigger>
              <TabsTrigger
                value="mat-khau"
                className="relative min-w-[140px] justify-center flex rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 py-3 text-sm font-semibold transition-all"
              >
                Mật khẩu
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 min-h-0">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <span className="inline-flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang tải...
                </span>
              </div>
            ) : (
              <>
                <TabsContent value="ho-so" className="m-0 outline-none">
                  <div className="bg-white rounded-lg border-none p-6 max-w-2xl">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-slate-900">Thông tin người dùng</h2>
                      <p className="text-sm text-slate-600">Cập nhật thông tin cá nhân và email đăng nhập.</p>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                        {success}
                      </div>
                    )}

                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-800">
                          Họ và tên<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white"
                          placeholder="Nhập họ và tên"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-800">
                          Email<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-white"
                          placeholder="Nhập email"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-gray-800">
                          Vai trò<span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="role"
                          type="text"
                          value={formData.role}
                          disabled
                          className="w-full bg-gray-50 border-gray-300 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        disabled={saving}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="px-6 bg-[#167FFC] hover:bg-[#1470E3] text-white"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          "Lưu"
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mat-khau" className="m-0 outline-none">
                  <div className="bg-white rounded-lg border-none p-6 max-w-2xl">
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-slate-900">Mật khẩu</h2>
                      <p className="text-sm text-slate-600">Đổi mật khẩu đăng nhập tài khoản.</p>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                        {success}
                      </div>
                    )}

                    <div className="grid grid-cols-1 max-w-md gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-sm font-medium text-gray-800">
                          Mật khẩu hiện tại<span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            className="w-full pr-12 bg-white"
                            placeholder="Nhập mật khẩu hiện tại"
                            value={passwordForm.current_password}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showCurrentPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-sm font-medium text-gray-800">
                          Mật khẩu mới<span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            className="w-full pr-12 bg-white"
                            placeholder="Nhập mật khẩu mới"
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-800">
                          Xác nhận mật khẩu mới<span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            className="w-full pr-12 bg-white"
                            placeholder="Xác nhận mật khẩu mới"
                            value={passwordForm.confirm_password}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }))
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPasswordForm({
                            current_password: "",
                            new_password: "",
                            confirm_password: "",
                          })
                          handleCancel()
                        }}
                        className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        disabled={saving}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleSavePassword}
                        className="px-6 bg-[#167FFC] hover:bg-[#1470E3] text-white"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          "Lưu"
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </AppLayout>
  )
}