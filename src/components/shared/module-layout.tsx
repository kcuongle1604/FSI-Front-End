// src/components/shared/module-layout.tsx
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "./page-header";

interface ModuleLayoutProps {
  title: string;
  tabs: { value: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode; 
}

export const ModuleLayout = ({ title, tabs, activeTab, onTabChange, children }: ModuleLayoutProps) => {
  return (
    <div className="h-full flex flex-col px-8 py-5 bg-slate-50/50">
      <PageHeader title={title} />
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
        {/* Container cho Tab List với phong cách Pill */}
        <div className="flex items-center mb-6">
          <TabsList className="bg-blue-50/50 p-1 h-auto rounded-lg border border-blue-100/50">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="rounded-md px-6 py-2 text-sm font-medium transition-all
                           data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:text-slate-700
                           data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  {tab.icon} {tab.label}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Nội dung Content Card */}
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </Tabs>
    </div>
  );
};