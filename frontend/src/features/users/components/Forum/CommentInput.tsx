import type React from "react"
import { useState, useRef } from "react"
import { Send, Image as ImageIcon } from "lucide-react"
import forumService from "../../api/services/forumService"

interface CommentInputProps {
    onSubmit: (text: string) => Promise<void>
    isAuthenticated: boolean
    parentId?: number | null
    placeholder?: string
    onCancel?: () => void
}

export const CommentInput: React.FC<CommentInputProps> = ({ 
    onSubmit, 
    isAuthenticated, 
    parentId, 
    placeholder = "Nhập câu trả lời của bạn", 
    onCancel 
}) => {
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadingImages, setUploadingImages] = useState<Array<{ id: number; name: string }>>([])
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const uploadToCloudinary = async (file: File) => {
        try {
            const data = await forumService.uploadImages([file])
            return data[0]
        } catch (error) {
            console.error('Error uploading image:', error)
            throw error
        }
    }

    const insertImageMarkdown = (imageUrl: string, cursorPosition: number) => {
        const beforeCursor = comment.substring(0, cursorPosition)
        const afterCursor = comment.substring(cursorPosition)
        const imageMarkdown = `![image](${imageUrl})`

        const newContent = beforeCursor + imageMarkdown + afterCursor
        setComment(newContent)

        setTimeout(() => {
            if (textareaRef.current) {
                const newPosition = cursorPosition + imageMarkdown.length
                textareaRef.current.setSelectionRange(newPosition, newPosition)
                textareaRef.current.focus()
            }
        }, 0)
    }

    const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData?.items
        if (!items) return

        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            if (item.type.indexOf('image') !== -1) {
                e.preventDefault()

                const file = item.getAsFile()
                if (!file) continue

                const uploadId = Date.now() + i
                const cursorPosition = textareaRef.current?.selectionStart || comment.length

                setUploadingImages(prev => [...prev, { id: uploadId, name: file.name }])

                try {
                    const uploadedImage = await uploadToCloudinary(file)
                    setUploadingImages(prev => prev.filter(img => img.id !== uploadId))
                    insertImageMarkdown(uploadedImage.url, cursorPosition)
                } catch (error) {
                    alert('Không thể upload ảnh. Vui lòng thử lại.')
                    setUploadingImages(prev => prev.filter(img => img.id !== uploadId))
                }
            }
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (!file.type.startsWith('image/')) continue

            const uploadId = Date.now() + i
            const cursorPosition = textareaRef.current?.selectionStart || comment.length

            setUploadingImages(prev => [...prev, { id: uploadId, name: file.name }])

            try {
                const uploadedImage = await uploadToCloudinary(file)
                setUploadingImages(prev => prev.filter(img => img.id !== uploadId))
                insertImageMarkdown(uploadedImage.url, cursorPosition)
            } catch (error) {
                alert('Không thể upload ảnh. Vui lòng thử lại.')
                setUploadingImages(prev => prev.filter(img => img.id !== uploadId))
            }
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            alert('Bạn cần đăng nhập để bình luận')
            return
        }

        if (comment.trim()) {
            setIsSubmitting(true)
            try {
                await onSubmit(comment)
                setComment("")
                setUploadingImages([])
                if (onCancel) onCancel()
            } finally {
                setIsSubmitting(false)
            }
        }
    }

    const handleCancel = () => {
        setComment("")
        setUploadingImages([])
        if (onCancel) onCancel()
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-xl p-4 ${parentId ? 'ml-12' : 'mb-6'} shadow-sm`}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {parentId ? "Trả lời bình luận" : "Bình luận"}
            </h3>

            <textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onPaste={handlePaste}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={!isAuthenticated || isSubmitting}
            />

            {uploadingImages.length > 0 && (
                <div className="mt-2 space-y-1">
                    {uploadingImages.map((img) => (
                        <div key={img.id} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                            <span>Đang upload {img.name}...</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Thêm ảnh"
                        disabled={!isAuthenticated || isSubmitting}
                    >
                        <ImageIcon size={18} />
                    </button>
                    <span className="text-xs text-gray-500">
                        Paste ảnh vào ô nhập
                    </span>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
                        disabled={!isAuthenticated || isSubmitting || !comment.trim() || uploadingImages.length > 0}
                    >
                        <Send size={14} />
                        {isSubmitting ? "Đang gửi..." : "Gửi"}
                    </button>
                </div>
            </div>

            {!isAuthenticated && (
                <p className="text-xs text-gray-500 mt-2">
                    Bạn cần <a href="/users/login" className="text-blue-500 hover:underline">đăng nhập</a> để bình luận
                </p>
            )}
        </div>
    )
}