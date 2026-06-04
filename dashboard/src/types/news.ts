export interface NewsArticleSummary {
  id: string
  title: string
  date: string
  author: string
  category: string
  image_url: string
  excerpt: string
}

export interface NewsArticle extends NewsArticleSummary {
  coach_takeaways: string[]
  content: string
}
