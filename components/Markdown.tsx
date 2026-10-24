import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function Markdown({ text }: { text: string }) {
  return <div className="prose"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer nofollow ugc">{children}</a>, img: ({ alt }) => <span>{alt ? `[image: ${alt}]` : '[image]'}</span>, h1: ({ children }) => <p className="md-h">{children}</p> }}>{text}</ReactMarkdown></div>
}
