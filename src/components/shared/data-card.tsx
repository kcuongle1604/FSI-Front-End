//Khung trắng và Toolbar
interface DataCardProps {
  children: React.ReactNode;
  toolbar?: React.ReactNode; // Slot dành cho Search và Buttons
}

export const DataCard = ({ children, toolbar }: DataCardProps) => (
  <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
    {toolbar && (
      <div className="p-4 flex items-center justify-between gap-4 border-b border-slate-100 bg-white">
        {toolbar}
      </div>
    )}
    <div className="flex-1 overflow-auto">
      {children}
    </div>
  </div>
);