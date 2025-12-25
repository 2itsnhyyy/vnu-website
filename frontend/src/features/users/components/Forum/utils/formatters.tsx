export const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays === 1) return "1 ngày trước"
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
}

export const getPlainText = (markdown: string): string => {
    return markdown
        .replace(/!\[.*?\]\(.*?\)/g, '') 
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        .trim()
}

export const renderCommentContent = (content: string) => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
    const parts: Array<{ type: 'text' | 'image'; content?: string; src?: string; alt?: string; key: string }> = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = imageRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: content.substring(lastIndex, match.index),
                key: `text-${lastIndex}`
            })
        }

        parts.push({
            type: 'image',
            alt: match[1] || 'image',
            src: match[2],
            key: `image-${match.index}`
        })

        lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
        parts.push({
            type: 'text',
            content: content.substring(lastIndex),
            key: `text-${lastIndex}`
        })
    }

    return parts.map((part) => {
        if (part.type === 'image') {
            return (
                <img
                    key={part.key}
                    src={part.src}
                    alt={part.alt}
                    className="max-w-full h-auto rounded-lg my-2 cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                    onClick={() => window.open(part.src, '_blank')}
                />
            )
        }
        return (
            <span key={part.key} className="whitespace-pre-wrap">
                {part.content}
            </span>
        )
    })
}