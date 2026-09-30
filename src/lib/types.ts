export interface McpServerData {
  id: string
  slug: string
  name: string
  description: string
  longDescription: string | null
  author: string
  repoUrl: string
  homepage: string | null
  category: string
  tags: string[]
  installCmd: string
  configJson: string
  stars: number
  featured: boolean
  verified: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryData {
  id: string
  slug: string
  name: string
  icon: string
  description: string
  count: number
}

export interface StatsData {
  totalServers: number
  totalCategories: number
  featuredServers: number
  totalStars: number
}
