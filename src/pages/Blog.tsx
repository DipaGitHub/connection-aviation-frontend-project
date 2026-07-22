"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom"; // Essential tracking hooks
import { Calendar, User, ArrowRight, ArrowLeft, Loader2, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Subscribe from "@/components/Subscribe";
import { API, API_BASE_URL } from "@/services/api";

interface BlogPost {
  id: number;
  title: string;
  short_desc: string;
  full_content: string;
  publish_date: string;
  author: string;
  publish_status: "Published" | "Draft";
  tags: string;
  banner_image: string;
}

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const targetId = searchParams.get("id");


  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(API.blogs)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const livePosts = data.filter((b: BlogPost) => b.publish_status === "Published");
          setBlogs(livePosts);

          // Handle routing from external page links via Query Param ID matching maps
          if (targetId) {
            const matchedPost = livePosts.find((b) => b.id === Number(targetId));
            if (matchedPost) setSelectedBlog(matchedPost);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Blog Page Fetch Error:", err);
        setLoading(false);
      });
  }, [targetId]);

  const handleReadMore = (blog: BlogPost) => {
    setSearchParams({ id: String(blog.id) });
    setSelectedBlog(blog);
    setTimeout(() => mainContentRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleBackToList = () => {
    setSearchParams({});
    setSelectedBlog(null);
    setTimeout(() => mainContentRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const getImageUrl = (path?: string) => {
    if (!path) return "/placeholder-blog.jpg";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const getRelatedBlogs = (currentId: number, currentTags: string) => {
    const primaryTag = currentTags ? currentTags.split(",")[0].trim().toLowerCase() : "";
    let matches = blogs.filter((b) => {
      if (b.id === currentId) return false;
      const tagsList = b.tags ? b.tags.toLowerCase() : "";
      return primaryTag ? tagsList.includes(primaryTag) : true;
    });

    if (matches.length === 0) {
      matches = blogs.filter((b) => b.id !== currentId);
    }
    return matches.slice(0, 3);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-brand-navy flex items-center gap-2 font-bold">
          <Loader2 className="animate-spin h-5 w-5" />
          Loading Stories...
        </div>
      </div>
    );
  }

  return (
    <div ref={mainContentRef} className="min-h-screen bg-background flex flex-col justify-between">
      <Header />

      <main className="flex-grow pt-24">
        {!selectedBlog ? (
          <section className="py-20 bg-[#fafbfc]">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl space-y-12">

              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-bold text-brand-navy tracking-tight font-display">
                  Recent Stories From Our Blog
                </h1>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  Stay informed with the latest trends, insights, and best practices in digital transformation and business technology
                </p>
              </div>

              {blogs.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-medium">
                  No published stories found at this time.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                  {blogs.map((blog) => (
                    <article
                      key={blog.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-300"
                    >
                      <div>
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                          <img
                            src={getImageUrl(blog.banner_image)}
                            alt={blog.title}
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <span className="absolute top-4 left-4 bg-amber-400 text-[11px] font-bold text-gray-900 px-3 py-1 rounded-md uppercase tracking-wider">
                            {blog.tags ? blog.tags.split(",")[0].trim() : "General"}
                          </span>
                        </div>

                        <div className="p-6 space-y-3 text-left">
                          <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(blog.publish_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {blog.author}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-brand-navy line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
                            {blog.title}
                          </h3>

                          <p className="text-sm text-gray-500 line-clamp-3 font-normal leading-relaxed">
                            {blog.short_desc}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-2 text-left border-t border-gray-50">
                        <button
                          onClick={() => handleReadMore(blog)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:text-blue-600 group transition-colors"
                        >
                          Read More <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

            </div>
          </section>
        ) : (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl space-y-10">

              <div className="text-left">
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-navy bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-xs transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Blog
                </button>
              </div>

              <article className="space-y-6 text-left">
                <div className="space-y-4">
                  <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide">
                    {selectedBlog.tags ? selectedBlog.tags.split(",")[0].trim() : "General"}
                  </span>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy leading-tight tracking-tight">
                    {selectedBlog.title}
                  </h1>

                  <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400 font-medium border-b border-gray-100 pb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-red-500/70" />
                      {new Date(selectedBlog.publish_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4 text-red-500/70" />
                      By {selectedBlog.author}
                    </span>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-gray-600 font-medium italic leading-relaxed bg-slate-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  {selectedBlog.short_desc}
                </p>

                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-slate-100">
                  <img
                    src={getImageUrl(selectedBlog.banner_image)}
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div
                  className="prose prose-slate max-w-none pt-4 text-gray-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-normal"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.full_content }}
                />
              </article>

              <hr className="border-gray-200 my-16" />

              <div className="space-y-8 text-left">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-brand-navy tracking-tight">
                    Related Stories & Updates
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {getRelatedBlogs(selectedBlog.id, selectedBlog.tags).map((related) => (
                    <div
                      key={related.id}
                      onClick={() => handleReadMore(related)}
                      className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 shadow-xs hover:shadow-md cursor-pointer transition-all duration-300 group text-left"
                    >
                      <div className="w-full aspect-[16/10] rounded-lg overflow-hidden bg-slate-50">
                        <img
                          src={getImageUrl(related.banner_image)}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          {related.tags ? related.tags.split(",")[0] : "Insights"}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                          {related.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>
        )}

        <Subscribe />
      </main>

      <Footer />
    </div>
  );
};

export default Blog;