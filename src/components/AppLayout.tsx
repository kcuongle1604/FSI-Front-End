"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useCursor } from "@/hooks/use-cursor"
import {
  Users,
  BookOpen,
  Award,
  GraduationCap,
  FileText,
  Database,
  Settings,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  LogOut,
  Search,
  Plus,
  Layers,
  Calendar
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const menuStructure = [
  {
    id: 'academic-operations',
    label: 'Nghiệp vụ đào tạo',
    icon: BookOpen,
    children: [
      { id: 'graduation-review', label: 'Xét tốt nghiệp', icon: GraduationCap, path: '/nghiep-vu-dao-tao/xet-tot-nghiep' },
    ]
  },
  {
    id: 'data-import',
    label: 'Quản lý dữ liệu',
    icon: Database,
    children: [
      { id: 'import-students', label: 'Sinh viên', icon: Users, path: '/quan-ly-du-lieu/sinh-vien' },
      { id: 'import-scores', label: 'Điểm', icon: FileText, path: '/quan-ly-du-lieu/diem' },
      { id: 'import-credits', label: 'Chứng chỉ', icon: Award, path: '/quan-ly-du-lieu/chung-chi' },
      { id: 'import-programs', label: 'Chương trình đào tạo', icon: BookOpen, path: '/quan-ly-du-lieu/chuong-trinh-dao-tao' },
    ]
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: Settings,
    children: [
      { id: 'user-management', label: 'Quản lý người dùng', icon: Users, path: '/cai-dat/quan-ly-nguoi-dung' },
      { id: 'class-management', label: 'Quản lý lớp học', icon: GraduationCap, path: '/cai-dat/quan-ly-lop-hoc' },
      { id: 'specialization-management', label: 'Quản lý chuyên ngành', icon: Layers, path: '/cai-dat/quan-ly-chuyen-nganh' },
      { id: 'batch-management', label: 'Quản lý khoá', icon: Calendar, path: '/cai-dat/quan-ly-khoa' },
      { id: 'certificate-management', label: 'Quản lý chứng chỉ', icon: Award, path: '/cai-dat/quan-ly-chung-chi' },
      { id: 'regulation-management', label: 'Quản lý quy chế', icon: FileText, path: '/cai-dat/quan-ly-quy-che' },
    ]
  }
]

type AppLayoutProps = {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
  showSearch?: boolean
}

export default function AppLayout({ children, title, actions, showSearch = false }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { withPointerCursor } = useCursor()
  
  // Find which section should be expanded based on current path
  const getCurrentSection = () => {
    const currentSection = menuStructure.find(section => 
      section.children.some(item => item.path === pathname)
    )
    return currentSection ? [currentSection.id] : []
  }
  
  const [expandedMenus, setExpandedMenus] = useState<string[]>(getCurrentSection)

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const handleNavigation = (path: string, sectionId: string) => {
    // Auto expand the section when clicking on a menu item
    if (!expandedMenus.includes(sectionId)) {
      setExpandedMenus(prev => [...prev, sectionId])
    }
    
    // Use cursor hook for smooth transition
    withPointerCursor(() => {
      router.push(path)
    })
  }

  const handleSettings = () => {
    withPointerCursor(() => {
      router.push('/cai-dat-nguoi-dung')
    })
  }

  const handleLogout = () => {
    withPointerCursor(() => {
      router.push('/dang-nhap')
    })
  }

  return (
    <div className="flex bg-white min-h-screen overflow-hidden">
      {/* Sidebar Menu */}
      <aside className="w-64 border-r border-gray-200 flex flex-col min-h-screen" style={{ backgroundColor: '#D5DDED' }}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo-fsi.png" 
              alt="FSI Logo" 
              width={40} 
              height={40}
              className="object-contain shrink-0 rounded-full"
            />
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-gray-900">THỐNG KÊ - TIN HỌC</h2>
              <span className="text-xs text-gray-600">Hỗ trợ quản lý đào tạo</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {menuStructure.map((section) => {
            const SectionIcon = section.icon
            const isExpanded = expandedMenus.includes(section.id)
            
            return (
              <div key={section.id} className="mb-3">
                {/* Section Header */}
                <button
                  onClick={() => toggleMenu(section.id)}
                  className="clickable-element w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <SectionIcon size={20} className="text-gray-600" />
                    <span className="font-medium text-sm">{section.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-gray-400 transition-transform duration-200" />
                  ) : (
                    <ChevronRightIcon size={16} className="text-gray-400 transition-transform duration-200" />
                  )}
                </button>

                {/* Submenu Items */}
                {isExpanded && (
                  <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-3">
                    {section.children.map((item) => {
                      const ItemIcon = item.icon
                      const isActive = pathname === item.path
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item.path, section.id)}
                          className={`clickable-element w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
                            isActive
                              ? 'bg-[#E8F2FF] text-[#167FFC] font-medium border-l-2 border-[#167FFC] -ml-3.5 pl-3.5'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <ItemIcon size={18} className={isActive ? 'text-[#167FFC]' : 'text-gray-400'} />
                          <span className="whitespace-nowrap">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="clickable-element w-full text-left p-0 border-0 bg-transparent focus:outline-none">
                <div className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-3 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-[#E8F2FF] rounded-full flex items-center justify-center">
                    <Users size={18} className="text-[#167FFC]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">Trang Than</p>
                    <p className="text-xs text-gray-500 truncate">Giáo vụ khoa</p>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 shadow-lg border" 
              side="top" 
              sideOffset={-50}
            >
              <DropdownMenuItem 
                className="clickable-element cursor-pointer" 
                onClick={handleSettings}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt người dùng</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="clickable-element cursor-pointer text-red-600" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - combined with content */}
        {title && (
          <div className="bg-gray-50 px-8 py-3 flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-xl font-semibold text-gray-900 whitespace-nowrap">{title}</h1>
              {showSearch && (
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 h-9 text-sm bg-white border-gray-300 rounded-lg"
                  />
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                {actions}
              </div>
            </div>
            
            {/* Page Content */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        )}
        
        {!title && (
          <div className="flex-1 overflow-auto bg-white h-full">
            {children}
          </div>
        )}
      </main>
    </div>
  )
}
