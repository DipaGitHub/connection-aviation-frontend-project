"use client";

import { useState, useEffect } from "react";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../services/api.ts";

interface BlogPost {
  id: number;
  title: string;
  short_desc: string;
  publish_date: string;
  author: string;
  publish_status: "Published" | "Draft";
  tags: string;
  banner_image: string;
}

const BlogSection = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/blogs`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const livePosts = data.filter((b: BlogPost) => b.publish_status === "Published");
          // Take only the top 3 most recent stories for the home page layout preview
          setBlogs(livePosts.slice(0, 3));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Home Blog Section Error:", err);
        setLoading(false);
      });
  }, []);

  const getImageUrl = (path?: string) => {
    if (!path) return "/placeholder-blog.jpg";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (loading || blogs.length === 0) return null;

  return (
    <section className="py-20 bg-[#fafbfc] border-t border-gray-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-brand-navy tracking-tight font-display">
            Recent Stories From Our Blog
          </h2>
          <p className="text-sm md:text-base text-gray-500 leading-relaxed">
            Stay informed with the latest trends, insights, and best practices in digital transformation and business technology.
          </p>
        </div>

        {/* Dynamic Card Grid Layout */}
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

              {/* Redirects seamlessly to the independent core /blog app route instead of changing state locally */}
              <div className="px-6 pb-6 pt-2 text-left border-t border-gray-50">
                <Link
                  to={`/blog?id=${blog.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:text-blue-600 group transition-colors"
                >
                  Read More <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center pt-4">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all shadow-sm"
          >
            View All Stories
          </Link>
        </div>

      </div>
    </section>
  );
};

export default BlogSection;