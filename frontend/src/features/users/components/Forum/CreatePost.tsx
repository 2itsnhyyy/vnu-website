"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Send, ArrowLeft } from "lucide-react"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"
import { RightSidebar } from "./RightSidebar"
import MDEditor from "@uiw/react-md-editor"
import forumService from "../../api/services/forumService"

const CreatePostPage: React.FC = () => {
    const navigate = useNavigate()
    const { postId } = useParams<{ postId: string }>()
    const [title, setTitle] = useState("")
    const [contentMarkdown, setContentMarkdown] = useState("")
    const [loading, setLoading] = useState(false)
    const [fetchingPost, setFetchingPost] = useState(false)
    const isEditMode = !!postId

    useEffect(() => {
        if (isEditMode && postId) {
            fetchPost()
        }
    }, [postId])

    const fetchPost = async () => {
        setFetchingPost(true)
        try {
            const response = await forumService.getPostDetail(Number(postId))
            setTitle(response.post.title)
            setContentMarkdown(response.post.contentMarkdown)
        } catch (error: any) {
            alert(error.message || "Không thể tải bài đăng")
            navigate("/users/forum")
        } finally {
            setFetchingPost(false)
        }
    }

    const handleSubmit = async () => {
        if (!title.trim() || !contentMarkdown.trim()) {
            alert("Vui lòng nhập đầy đủ tiêu đề và nội dung")
            return
        }

        try {
            setLoading(true)
            if (isEditMode && postId) {
                await forumService.updatePost(Number(postId), { title, contentMarkdown })
                alert("Cập nhật bài đăng thành công!")
            } else {
                await forumService.createPost({ title, contentMarkdown })
                alert("Đăng bài thành công!")
            }
            navigate("/users/forum")
        } catch (error: any) {
            alert(error.message || "Có lỗi xảy ra")
            console.error("Error saving post:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        if (title || contentMarkdown) {
            if (confirm("Bạn có chắc muốn hủy? Các thay đổi sẽ không được lưu.")) {
                navigate("/users/forum")
            }
        } else {
            navigate("/users/forum")
        }
    }

    if (fetchingPost) {
        return (
            <div className="flex h-screen bg-white pt-8">
                <AuthenticatedSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-gray-600">Đang tải...</p>
                    </div>
                </div>
                <RightSidebar />
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-white pt-8">
            <AuthenticatedSidebar />

            <div className="flex-1 overflow-auto bg-white">
                <div className="max-w-4xl mx-auto px-12 pt-8 pb-10">
                    <button
                        onClick={() => navigate("/users/forum")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Quay lại</span>
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        {isEditMode ? "Chỉnh sửa bài đăng" : "Tạo bài đăng mới"}
                    </h1>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        {/* Title Input */}
                        <div className="p-6 border-b border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiêu đề <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nhập tiêu đề bài đăng"
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Content Input with MDEditor */}
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nội dung <span className="text-red-500">*</span>
                            </label>
                            <div className="border border-gray-300 rounded-lg overflow-hidden">
                                <MDEditor
                                    value={contentMarkdown}
                                    onChange={(value) => setContentMarkdown(value || "")}
                                    preview="edit"
                                    height={500}
                                    data-color-mode="light"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                                {loading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Đăng bài"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <RightSidebar />
        </div>
    )
}

export default CreatePostPage