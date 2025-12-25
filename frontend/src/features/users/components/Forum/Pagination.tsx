import type React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    // Không hiển thị pagination nếu chỉ có 1 trang hoặc không có trang nào
    if (totalPages <= 1) {
        return null
    }

    const renderPageNumbers = () => {
        const pages = []

        if (currentPage > 1) {
            pages.push(
                <button key="prev" onClick={() => onPageChange(currentPage - 1)} className="p-2 hover:bg-gray-100 rounded">
                    <ChevronLeft size={20} />
                </button>,
            )
        }

        for (let i = 1; i <= Math.min(5, totalPages); i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`w-10 h-10 rounded ${currentPage === i ? "bg-blue-500 text-white" : "hover:bg-gray-100 text-gray-700"
                        }`}
                >
                    {i}
                </button>,
            )
        }

        if (totalPages > 5) {
            pages.push(
                <span key="dots" className="px-2">
                    ...
                </span>,
            )
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className="w-10 h-10 rounded hover:bg-gray-100 text-gray-700"
                >
                    {totalPages}
                </button>,
            )
        }

        if (currentPage < totalPages) {
            pages.push(
                <button key="next" onClick={() => onPageChange(currentPage + 1)} className="p-2 hover:bg-gray-100 rounded">
                    <ChevronRight size={20} />
                </button>,
            )
        }

        return pages
    }

    return <div className="flex justify-center items-center gap-2 py-8">{renderPageNumbers()}</div>
}