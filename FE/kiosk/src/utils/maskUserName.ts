export const maskName = (name: string) => {
  if (!name) return ''
  if (name.length === 2) return name[0] + '*'
  if (name.length > 2)
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
  return name
}
