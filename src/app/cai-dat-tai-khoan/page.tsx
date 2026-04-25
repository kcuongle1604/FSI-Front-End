"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Eye, EyeOff, Loader2 } from "lucide-react"
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
    <AppLayout>
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="shrink-0 px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Quản lý tài khoản</h1>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6">
            {/* Tab Navigation */}
            <div className="mb-6">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab("ho-so")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "ho-so"
                      ? "border-[#167FFC] text-[#167FFC] bg-[#E8F2FF]"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                  }`}
                >
                  Hồ sơ
                </button>
                <button
                  onClick={() => setActiveTab("mat-khau")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "mat-khau"
                      ? "border-[#167FFC] text-[#167FFC] bg-[#E8F2FF]"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                  }`}
                >
                  Mật khẩu
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : activeTab === "ho-so" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin người dùng</h2>
                
                {/* Error/Success Messages */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
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
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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

                {/* Action Buttons */}
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
            )}

            {activeTab === "mat-khau" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Mật khẩu</h2>
                
                {/* Error/Success Messages */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
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
                        className="w-full pr-12"
                        placeholder="Nhập mật khẩu hiện tại"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
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
                        className="w-full pr-12"
                        placeholder="Nhập mật khẩu mới"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                      Xác nhận mật khẩu mới<span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full pr-12"
                        placeholder="Xác nhận mật khẩu mới"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? (
                          <Eye size={18} />
                        ) : (
                          <EyeOff size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPasswordForm({
                        current_password: "",
                        new_password: "",
                        confirm_password: ""
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
                    className="px-6 bg-blue-500 hover:bg-blue-600 text-white"
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
            )}
          </div>
        </div>
      </div>
      </div>
    </AppLayout>
  )
}