import { useState, createContext, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import HRHeader from './HRHeader'
import HRSidebar from './HRSidebar'

export const SidebarContext = createContext({
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobileOpen: false,
  setIsMobileOpen: () => {}
})

export const useSidebar = () => useContext(SidebarContext)

const HRLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <HRSidebar />
        <div
          className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-[margin] duration-300 ease-in-out ${
            isCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]'
          }`}
        >
          <HRHeader />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
            <div className="w-full max-w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

export default HRLayout