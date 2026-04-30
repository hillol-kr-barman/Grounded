import SourceCard from './SourceCard'
import type { Message } from '../types'

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div
          className={`size-7 rounded-full shrink-0 flex items-center justify-center text-[0.6rem] font-bold mt-0.5 ${
            isUser
              ? 'bg-[rgba(255,255,255,0.07)] text-muted border border-border'
              : 'bg-soft border border-border-strong text-accent'
          }`}
        >
          {isUser ? 'U' : 'G'}
        </div>

        <div
          className={`px-4 py-3 rounded-xl text-[0.88rem] leading-[1.65] ${
            isUser
              ? 'bg-[rgba(255,255,255,0.05)] border border-border text-text rounded-tr-sm'
              : 'bg-surface border border-border text-text rounded-tl-sm'
          }`}
        >
          {message.content ? (
            <>
              {message.content}
              {message.streaming && (
                <span className="inline-block w-0.5 h-[1em] bg-accent ml-0.5 align-middle animate-pulse" />
              )}
            </>
          ) : (
            message.streaming && (
              <span className="flex items-center gap-1 py-0.5">
                <span className="size-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            )
          )}
        </div>
      </div>

      {!isUser && !message.streaming && (message.sources?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1.5 ml-9">
          <span className="font-mono text-[0.62rem] text-[#6b7685] self-center mr-1">Sources:</span>
          {message.sources!.map((source, i) => (
            <SourceCard key={i} source={source} />
          ))}
        </div>
      )}
    </div>
  )
}
