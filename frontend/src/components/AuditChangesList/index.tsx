import type { AuditLogChange } from '@remnant/shared'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'

function formatValue(value: unknown): string {
  if (value === null || value === undefined)
    return '—'
  if (typeof value === 'string')
    return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  const json = JSON.stringify(value)
  return json.length > 120 ? `${json.slice(0, 120)}...` : json
}

function ChangeRow({ change }: { change: AuditLogChange }) {
  const beforeStr = formatValue(change.before)
  const afterStr = formatValue(change.after)
  const fullBefore = JSON.stringify(change.before, null, 2)
  const fullAfter = JSON.stringify(change.after, null, 2)

  return (
    <div className="flex items-start gap-2 text-sm font-mono">
      <span className="min-w-[140px] shrink-0 text-muted-foreground">
        {change.path}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate text-muted-foreground">{beforeStr}</span>
            </TooltipTrigger>
            <TooltipContent>
              <pre className="max-w-md overflow-auto text-xs">{fullBefore}</pre>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="shrink-0 text-muted-foreground">→</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate">{afterStr}</span>
            </TooltipTrigger>
            <TooltipContent>
              <pre className="max-w-md overflow-auto text-xs">{fullAfter}</pre>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

export function AuditChangesList({
  changes,
  emptyText = '—',
}: {
  changes: AuditLogChange[]
  emptyText?: string
}) {
  if (changes.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyText}</div>
  }

  return (
    <div className="space-y-1.5">
      {changes.map(change => (
        <ChangeRow key={change.path} change={change} />
      ))}
    </div>
  )
}
