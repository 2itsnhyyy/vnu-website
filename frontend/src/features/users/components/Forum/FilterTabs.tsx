import type React from "react"

interface FilterTabsProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ activeTab, onTabChange }) => {
    const tabs = [
        { id: "newest", label: "Mới nhất" },
        { id: "oldest", label: "Cũ nhất" },
        { id: "hottest", label: "Hot nhất" },
    ]

    return (
        <div className="flex gap-2 mb-6 border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === tab.id
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                </button>
            ))}
        </div>
    )
}