"use client"

import type React from "react"
import { useState } from "react"
import { ImageIcon, Send } from "lucide-react"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"
import { RightSidebar } from "./RightSidebar"

// Create Post Form Component
const CreatePostForm: React.FC = () => {
    const [selectedTag, setSelectedTag] = useState("")
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [images, setImages] = useState<string[]>([])

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
            setImages([...images, ...newImages])
        }
    }

    const handleSubmit = () => {
        console.log({ selectedTag, title, content, images })
        // Handle form submission
    }

    const handleSaveDraft = () => {
        console.log("Saving draft...")
        // Handle save draft
    }

    return (
        <div className="bg-white rounded-xl shadow-sm">
            {/* Tag Selection */}
            <div className="p-6 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn tag</label>
                <div className="relative">
                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                        <option value="">Chọn tag</option>
                        <option value="golang">Golang</option>
                        <option value="linux">Linux</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="react">React</option>
                        <option value="ktx">KTX</option>
                        <option value="hoc-tap">Học tập</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Title Input */}
            <div className="p-6 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tiêu đề"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Content Input */}
            <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập nội dung bài đăng"
                    rows={12}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Image Preview */}
                {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        {images.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={img || "/placeholder.svg"}
                                    alt={`Upload ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => setImages(images.filter((_, i) => i !== index))}
                                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <div>
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
                        <ImageIcon size={18} />
                        <span className="text-sm font-medium">Thêm ảnh</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSaveDraft}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                        Lưu bản nhập
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Send size={18} />
                        Đăng
                    </button>
                </div>
            </div>
        </div>
    )
}

// Main Create Post Page Component
const CreatePostPage: React.FC = () => {
    return (
        <div className="flex h-screen bg-white pt-8">
            <AuthenticatedSidebar />

            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-4xl mx-auto px-12 pt-8 pb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Tạo bài đăng mới</h1>

                    <CreatePostForm />
                </div>
            </div>

            <RightSidebar />
        </div>
    )
}

export default CreatePostPage
