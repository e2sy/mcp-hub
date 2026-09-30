export interface ServerEntry {
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
}

export interface CategoryEntry {
  slug: string
  name: string
  icon: string
  description: string
}

export interface Registry {
  version: string
  generatedAt: string
  categories: CategoryEntry[]
  servers: ServerEntry[]
}

export interface ClientConfig {
  name: string
  configPath: string
  configExists: boolean
}

export interface ClientDetection {
  name: string
  detected: boolean
  configPath: string | null
}
