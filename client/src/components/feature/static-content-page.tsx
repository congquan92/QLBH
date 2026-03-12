import { PublicPageContent } from "@/data/public-pages";

export default function StaticContentPage({ content }: { content: PublicPageContent }) {
    return (
        <div className="min-h-screen bg-white">
            <section className="border-b border-gray-200 bg-gradient-to-br from-stone-950 via-neutral-900 to-zinc-800 text-white">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-300">{content.eyebrow}</p>
                    <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{content.title}</h1>
                    <p className="mt-5 max-w-3xl text-base leading-7 text-gray-200 sm:text-lg">{content.description}</p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        {content.highlights.map((highlight) => (
                            <span key={highlight} className="border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                                {highlight}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="grid gap-6 lg:grid-cols-2">
                    {content.sections.map((section) => (
                        <article key={section.title} className="border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-gray-600">
                                {section.body.map((paragraph) => (
                                    <p key={paragraph}>{paragraph}</p>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
