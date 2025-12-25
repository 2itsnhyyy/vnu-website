import type React from "react"
import ReactMarkdown from "react-markdown"
import { ThumbsUp } from "lucide-react"
import type { Post } from "../../api/types/forumType"
import { formatTimeAgo } from "./utils/formatters"

interface PostContentProps {
    post: Post
    onLike: () => void
    isAuthenticated: boolean
}

export const PostContent: React.FC<PostContentProps> = ({ post, onLike, isAuthenticated }) => {
    const handleLikeClick = () => {
        if (!isAuthenticated) {
            alert('Bạn cần đăng nhập để thích bài viết')
            return
        }
        onLike()
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                        <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="prose max-w-none text-gray-700 mb-6 leading-relaxed">
                <ReactMarkdown
                    components={{
                        h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                        h4: ({ node, ...props }) => <h4 className="text-lg font-semibold mt-3 mb-2" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                        li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                        em: ({ node, ...props }) => <em className="italic" {...props} />,
                        code: ({ node, inline, ...props }: any) =>
                            inline ? (
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                            ) : (
                                <code className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props} />
                            ),
                        blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
                        ),
                        img: ({ node, ...props }) => (
                            <img
                                className="max-w-full h-auto rounded-lg my-4 shadow-md"
                                loading="lazy"
                                {...props}
                            />
                        ),
                        a: ({ node, ...props }) => (
                            <a
                                className="text-blue-600 hover:text-blue-800 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                            />
                        ),
                    }}
                >
                    {post.contentMarkdown}
                </ReactMarkdown>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {post.author.role === 1 ? "Admin" : "User"}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{post.commentsCount} bình luận</span>
                    <button
                        onClick={handleLikeClick}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                            post.liked
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                        title={isAuthenticated ? (post.liked ? "Bỏ thích" : "Thích") : "Đăng nhập để thích"}
                    >
                        <ThumbsUp size={18} fill={post.liked ? "currentColor" : "none"} />
                        <span className="text-sm font-medium">{post.likesCount}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}