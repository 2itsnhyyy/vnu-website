import type React from "react"
import { useState, useMemo, useEffect } from "react"
import issuesService from "../../api/services/issuesService"
import { getCategoryFromTitle, INCIDENT_STATUS } from "../../api/types/issues.types"
import type { Incident, PaginationInfo } from "../../api/types/issues.types"
import { useNavigate } from "react-router-dom"

interface Category {
    label: string
    value: string
}

interface CategoryCounts {
    [key: string]: number
}

interface CategoryTabsProps {
    categories: Category[]
    activeTab: string
    onTabChange: (value: string) => void
    counts: CategoryCounts
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeTab, onTabChange, counts }) => {
    return (
        <div className="flex gap-8 border-b border-gray-200">
            {categories.map((category) => (
                <button
                    key={category.value}
                    onClick={() => onTabChange(category.value)}
                    className={`pb-4 relative transition-all duration-200 text-[18px] ${
                        activeTab === category.value ? "text-blue-600 font-bold" : "text-[#7C8493] hover:text-gray-900 font-bold"
                    }`}
                >
                    <span>
                        {category.label} ({counts[category.value] || 0})
                    </span>
                    {activeTab === category.value && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
            ))}
        </div>
    )
}

interface SearchAndFilterProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    onDateClick: () => void
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ searchTerm, onSearchChange, onDateClick }) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-[var(--color-text-main)]">Các thông báo</h2>
            <div className="flex gap-3">
                <button
                    onClick={onDateClick}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="text-blue-600 font-medium">Date</span>
                </button>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all duration-200"
                    />
                    <svg
                        className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

const TableHeader: React.FC = () => {
    return (
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 rounded-t-lg border-b border-gray-200">
            <div className="col-span-1 text-[18px] font-medium text-gray-600">STT</div>
            <div className="col-span-2 text-[18px] font-medium text-gray-600">Tiêu đề</div>
            <div className="col-span-4 text-[18px] font-medium text-gray-600">Nội dung</div>
            <div className="col-span-2 text-[18px] font-medium text-gray-600">Ngày đăng</div>
            <div className="col-span-2 text-[18px] font-medium text-gray-600">Trạng thái</div>
            <div className="col-span-1"></div>
        </div>
    )
}

interface IncidentRowProps {
    incident: Incident
    index: number
}

const IncidentRow: React.FC<IncidentRowProps> = ({ incident, index }) => {
    const navigate = useNavigate()
    
    const getStatusConfig = (status: number) => {
        if (status === INCIDENT_STATUS.PENDING) {
            return {
                text: "Đang xử lý",
                className: "bg-orange-50 text-orange-600 border-orange-200",
            }
        }
        return {
            text: "Đã xử lý",
            className: "bg-green-50 text-green-600 border-green-200",
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const statusConfig = getStatusConfig(incident.status)

    const handleViewDetails = () => {
        navigate(`/users/issues/${incident.incidentId}`)
    }

    return (
        <div className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
            <div className="col-span-1 text-gray-700">{index + 1}</div>
            <div className="col-span-2 font-medium text-gray-800">{incident.title}</div>
            <div className="col-span-4 text-gray-600 truncate">{incident.content}</div>
            <div className="col-span-2 text-gray-600">{formatDate(incident.createdAt)}</div>
            <div className="col-span-2">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.className}`}>
                    {statusConfig.text}
                </span>
            </div>
            <div className="col-span-1 flex justify-end">
                <button
                    onClick={handleViewDetails}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                    title="Xem chi tiết"
                >
                    <svg
                        className="w-5 h-5 text-gray-500 group-hover:text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    )
}

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = []
        const maxVisible = 7

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 3) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push("...")
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            }
        }
        return pages
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-6 pb-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </button>

            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === "number" && onPageChange(page)}
                    disabled={page === "..."}
                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg transition-colors ${
                        currentPage === page
                            ? "bg-blue-600 text-white font-medium"
                            : page === "..."
                                ? "cursor-default"
                                : "hover:bg-gray-100 border border-gray-300"
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </div>
    )
}

const IssuesList: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [pagination, setPagination] = useState<PaginationInfo | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    
    const itemsPerPage = 5

    const categories: Category[] = [
        { label: "Tất cả", value: "all" },
        { label: "Mất điện", value: "Mất điện" },
        { label: "Cúp nước", value: "Cúp nước" },
        { label: "Đang sửa chữa", value: "Đang sửa chữa" },
        { label: "Khác", value: "Khác" },
    ]

    useEffect(() => {
        const fetchIncidents = async () => {
            setLoading(true)
            setError(null)
            
            try {
                const filters: any = {
                    limit: itemsPerPage,
                    page: currentPage,
                }
                
                if (searchTerm.trim()) {
                    filters.search = searchTerm
                }

                const response = await issuesService.getIncidents(filters)
                setIncidents(response.incidents)
                setPagination(response.pagination)
            } catch (err: any) {
                console.error('Error fetching incidents:', err)
                setError(err.message || 'Không thể tải dữ liệu')
                setIncidents([])
            } finally {
                setLoading(false)
            }
        }

        fetchIncidents()
    }, [currentPage, searchTerm])

    // Calculate category counts from fetched data
    const categoryCounts: CategoryCounts = useMemo(() => {
        const counts: CategoryCounts = {
            all: incidents.length,
            "Mất điện": 0,
            "Cúp nước": 0,
            "Đang sửa chữa": 0,
            "Khác": 0,
        }

        incidents.forEach((incident) => {
            const category = getCategoryFromTitle(incident.title)
            if (counts[category] !== undefined) {
                counts[category]++
            }
        })

        if (pagination) {
            counts.all = pagination.totalItems
        }

        return counts
    }, [incidents, pagination])

    // Filter incidents by category (client-side)
    const filteredIncidents: Incident[] = useMemo(() => {
        if (activeTab === "all") {
            return incidents
        }
        
        return incidents.filter((incident) => {
            const category = getCategoryFromTitle(incident.title)
            return category === activeTab
        })
    }, [activeTab, incidents])

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setCurrentPage(1)
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    const totalPages = pagination?.totalPages || 1

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w mx-auto">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Tabs */}
                    <div className="px-6 pt-6">
                        <CategoryTabs
                            categories={categories}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            counts={categoryCounts}
                        />
                    </div>

                    {/* Search and Filter */}
                    <div className="px-6 pt-6">
                        <SearchAndFilter
                            searchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                            onDateClick={() => alert("Date filter clicked")}
                        />
                    </div>

                    {/* Table */}
                    <div className="px-6">
                        <TableHeader />
                        
                        {loading ? (
                            <div className="text-center py-16">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-16 text-red-500">
                                <p className="text-lg">Có lỗi xảy ra</p>
                                <p className="text-sm mt-2">{error}</p>
                            </div>
                        ) : filteredIncidents.length > 0 ? (
                            <div>
                                {filteredIncidents.map((incident, index) => (
                                    <IncidentRow
                                        key={incident.incidentId}
                                        incident={incident}
                                        index={(currentPage - 1) * itemsPerPage + index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-500">
                                <p className="text-lg">Không tìm thấy sự cố nào</p>
                                <p className="text-sm mt-2">Thử điều chỉnh bộ lọc hoặc tìm kiếm</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage} 
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default IssuesList
