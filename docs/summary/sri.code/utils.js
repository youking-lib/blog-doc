import ssri from 'ssri'

export function readerFileText (blob) {
  const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.currentTarget.result)
    reader.onerror = reject
    reader.readAsText(blob, 'utf-8')
  })
}

export function generateIntegrity (content) {
  const parsed = ssri.fromData(content)
  return parsed.toString()
}
