import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { AuthenticatedSidebar } from "./AuthenticatedSidebar"
import { GuestSidebar } from "./GuestSidebar"
import { RightSidebar } from "./RightSidebar"

type NavigateHelpers = {
    toList: (filterParam?: string) => void
    toPost: (id: number) => void
    toCreate: () => void
    toEdit: (id: number) => void
    toReplies: () => void
    toLikes: () => void
    toMyPosts: () => void
}

const AuthenticatedSidebarComp = AuthenticatedSidebar as unknown as React.ComponentType<{ navigate: NavigateHelpers }>
const GuestSidebarComp = GuestSidebar as unknown as React.ComponentType<{ navigate: NavigateHelpers }>
import authService from "../../api/services/authService"
import { STORAGE_KEYS } from "../../api/config"

import ForumInterface from "./ForumContent"
import PostDetailPage from "./PostDetailContent"
import CreatePostPage from "./CreatePostContent"
import EditPostPage from "./EditPostContent"
import MyRepliesPage from "./MyRepliesContent"
import MyLikesPage from "./MyLikesContent"

const Forum: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    
    const view = searchParams.get('view') || 'list' 
    const postId = searchParams.get('postId')
    const filter = searchParams.get('filter')

    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
        setIsAuthenticated(!!token)
    }, [])

    const navigate = {
        toList: (filterParam?: string) => {
            const params = new URLSearchParams()
            if (filterParam) params.set('filter', filterParam)
            setSearchParams(params)
        },
        toPost: (id: number) => {
            const params = new URLSearchParams()
            params.set('view', 'post')
            params.set('postId', id.toString())
            setSearchParams(params)
        },
        toCreate: () => {
            const params = new URLSearchParams()
            params.set('view', 'create')
            setSearchParams(params)
        },
        toEdit: (id: number) => {
            const params = new URLSearchParams()
            params.set('view', 'edit')
            params.set('postId', id.toString())
            setSearchParams(params)
        },
        toReplies: () => {
            const params = new URLSearchParams()
            params.set('view', 'replies')
            setSearchParams(params)
        },
        toLikes: () => {
            const params = new URLSearchParams()
            params.set('view', 'likes')
            setSearchParams(params)
        },
        toMyPosts: () => {
            const params = new URLSearchParams()
            params.set('filter', 'my-posts')
            setSearchParams(params)
        }
    }

    const renderContent = () => {
        switch (view) {
            case 'post':
                return postId ? (
                    <PostDetailPage 
                        postId={parseInt(postId)} 
                        navigate={navigate}
                        isAuthenticated={isAuthenticated}
                    />
                ) : (
                    <ForumInterface 
                        navigate={navigate}
                        filter={filter}
                        isAuthenticated={isAuthenticated}
                    />
                )
            case 'create':
                return (
                    <CreatePostPage 
                        navigate={navigate}
                        isAuthenticated={isAuthenticated}
                    />
                )
            case 'edit':
                return postId ? (
                    <EditPostPage 
                        postId={parseInt(postId)}
                        navigate={navigate}
                        isAuthenticated={isAuthenticated}
                    />
                ) : (
                    <ForumInterface 
                        navigate={navigate}
                        filter={filter}
                        isAuthenticated={isAuthenticated}
                    />
                )
            case 'replies':
                return (
                    <MyRepliesPage 
                        navigate={navigate}
                        isAuthenticated={isAuthenticated}
                    />
                )
            case 'likes':
                return (
                    <MyLikesPage 
                        navigate={navigate}
                        isAuthenticated={isAuthenticated}
                    />
                )
            default:
                return (
                    <ForumInterface 
                        navigate={navigate}
                        filter={filter}
                        isAuthenticated={isAuthenticated}
                    />
                )
        }
    }

    return (
        <div className="flex h-screen bg-white pt-8">
            {isAuthenticated ? (
                <AuthenticatedSidebarComp navigate={navigate} />
            ) : (
                <GuestSidebarComp navigate={navigate} />
            )}

            <div className="flex-1 overflow-auto bg-white">
                {renderContent()}
            </div>

            <RightSidebar />
        </div>
    )
}

export default Forum