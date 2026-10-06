export function virtualListRange({
  itemCount,
  itemHeight,
  scrollTop,
  viewportHeight,
  overscan = 4
}) {
  const count = Math.max(0, Number(itemCount) || 0)
  const height = Math.max(1, Number(itemHeight) || 1)
  const buffer = Math.max(0, Number(overscan) || 0)
  const top = Math.max(0, Number(scrollTop) || 0)
  const viewport = Math.max(0, Number(viewportHeight) || 0)
  const start = Math.min(count, Math.max(0, Math.floor(top / height) - buffer))
  const end = Math.min(count, Math.ceil((top + viewport) / height) + buffer)
  return {
    start,
    end,
    offset: start * height,
    totalHeight: count * height
  }
}
