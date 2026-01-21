"use client"

import { useState } from "react"
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
import { Plus, Eye, EyeOff } from "lucide-react"
import AppLayout from "@/components/AppLayout"

export default function CaiDatNguoiDungPage() {
  const [activeTab, setActiveTab] = useState("ho-so")
  const [formData, setFormData] = useState({
    name: "Than Trang",
    email: "than.trang@gmail.com",
    role: "Giáo vụ khoa"
  })
  
  // State cho các input mật khẩu - hiển thị/ẩn
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSave = () => {
    console.log("Saving user settings:", formData)
    // Handle save logic here
  }

  const handleCancel = () => {
    // Reset form or go back
    console.log("Cancel settings")
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="shrink-0 px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Cài đặt tài khoản</h1>
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
            {activeTab === "ho-so" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin người dùng</h2>
                
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
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Giáo vụ khoa">Giáo vụ khoa</SelectItem>
                        <SelectItem value="Ban chủ nhiệm khoa">Ban chủ nhiệm khoa</SelectItem>
                        <SelectItem value="Giáo viên chủ nhiệm">Giáo viên chủ nhiệm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="px-6 bg-[#167FFC] hover:bg-[#1470E3] text-white"
                  >
                    Lưu
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "mat-khau" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Mật khẩu</h2>
                
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
                    onClick={handleCancel}
                    className="px-6 bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="px-6 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Lưu
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