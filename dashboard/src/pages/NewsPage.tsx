import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import { useNewsArticle, useNewsList } from '../lib/api'
import { LoadingState, EmptyState } from '../components/LoadingState'
import { ArticleImage } from '../components/ArticleImage'
import { CoachPageShell } from '../components/coach/CoachPageShell'
import { SpotlightCard } from '../components/coach/SpotlightCard'
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function NewsPage() {
  const { articleId } = useParams()
  const { data: list, isLoading: listLoading, isError: listError } = useNewsList()
  const { data: article, isLoading: articleLoading } = useNewsArticle(articleId)

  if (articleId) {
    if (articleLoading) return <LoadingState message="Loading article…" />
    if (!article) return <EmptyState title="Article not found" />
    return (
      <article className="mx-auto max-w-3xl space-y-6">
        <Link to="/app/news" className="inline-flex items-center gap-1 text-sm text-coach-lime hover:underline">          <ArrowLeft className="h-4 w-4" /> Back to news
        </Link>
        <ArticleImage
          src={article.image_url}
          alt={article.title}
          className="w-full rounded-xl border border-slate-700/80 object-cover"
          style={{ maxHeight: 360 }}
        />
        <div>
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{article.category}</span>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-white">{article.title}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {formatDate(article.date)} · {article.author}
          </p>
        </div>

        <SpotlightCard className="border-coach-lime/30 bg-coach-lime/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-coach-lime">            <Lightbulb className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Coach takeaways</h2>
          </div>
          <ul className="space-y-2">
            {article.coach_takeaways.map((tip) => (
              <li key={tip} className="flex gap-2 text-sm text-slate-200">
                <span className="text-coach-lime">•</span>                {tip}
              </li>
            ))}
          </ul>
        </SpotlightCard>
        <div className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed text-slate-300">
          {article.content.split('\n\n').map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
        </div>
      </article>
    )
  }

  if (listLoading) return <LoadingState message="Loading news…" />

  const articles = list?.articles ?? []

  if (!articles.length && listError) {
    return <EmptyState title="Could not load news" description="Restart the API or refresh the page." />
  }

  return (
    <CoachPageShell
      title="Coach News"
      subtitle="Tactical articles to sharpen your coaching — formations, tournaments, and data-driven insights"
    >
      <div className="grid gap-6">
        {articles.map((a) => (
          <Link
            key={a.id}
            to={`/app/news/${a.id}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-coach-border bg-coach-surface transition-colors hover:border-coach-lime/40 sm:flex-row"
          >            <ArticleImage
              src={a.image_url}
              alt={a.title}
              className="h-48 w-full object-cover sm:h-48 sm:w-72 sm:shrink-0"
            />
            <div className="flex flex-col justify-center p-5">
              <span className="text-xs font-medium uppercase tracking-wide text-coach-lime">{a.category}</span>
              <h3 className="mt-1 text-lg font-semibold text-white group-hover:text-coach-lime">{a.title}</h3>              <p className="mt-2 line-clamp-2 text-sm text-slate-400">{a.excerpt}</p>
              <p className="mt-3 text-xs text-slate-500">
                {formatDate(a.date)} · {a.author}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {!articles.length && (
        <EmptyState title="No articles yet" description="Check back soon for coaching news." />
      )}
    </CoachPageShell>
  )
}