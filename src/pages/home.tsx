"use client"

import { Hono } from "hono"

export const Home = new Hono()

Home.get("/", (c) => {
  const title = "Unofficial Amazon Music API"
  const description =
    "Unofficial metadata-only REST API for educational purposes. Access Amazon music metadata programmatically."

  return c.html(
    <html>
      <head>
        <title>Unofficial Amazon Music API</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://amazon-music-api.vercel.app" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://amazon-music-api.vercel.app" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * { 
              font-family: 'Inter', sans-serif; 
              box-sizing: border-box;
            }
            
            html, body {
              margin: 0;
              padding: 0;
              background: #0f172a;
              color: #e2e8f0;
            }
            
            body {
              background: linear-gradient(135deg, #0f172a 0%, #1a1f35 50%, #0f172a 100%);
              min-height: 100vh;
              background-attachment: fixed;
            }

            /* Removed grid overlay for cleaner look */
            body::before {
              content: "";
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: none;
              pointer-events: none;
              z-index: -1;
            }

            .card {
              background: rgba(15, 23, 42, 0.5);
              backdrop-filter: blur(8px);
              -webkit-backdrop-filter: blur(8px);
              border: 1px solid rgba(71, 85, 105, 0.2);
              transition: all 0.3s ease;
              border-radius: 12px;
            }

            .card:hover {
              background: rgba(30, 41, 59, 0.7);
              border-color: rgba(148, 163, 184, 0.3);
              transform: translateY(-2px);
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .btn-primary {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: #fff;
              border: none;
              font-weight: 600;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
              cursor: pointer;
            }

            .btn-primary:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            }

            .stat-item {
              text-align: center;
              padding: 20px 12px;
            }

            .stat-number {
              font-size: 28px;
              font-weight: 700;
              color: #f1f5f9;
              line-height: 1.2;
              margin-bottom: 8px;
            }

            .stat-label {
              font-size: 12px;
              font-weight: 600;
              letter-spacing: 1px;
              color: #94a3b8;
              text-transform: uppercase;
            }

            .feature-icon {
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(59, 130, 246, 0.1);
              border-radius: 8px;
              margin-bottom: 16px;
              transition: all 0.3s ease;
              color: #3b82f6;
            }

            .card:hover .feature-icon {
              background: rgba(59, 130, 246, 0.2);
              transform: scale(1.1);
            }

            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(24px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-slide-up {
              animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              opacity: 0;
            }

            .delay-100 { animation-delay: 0.1s; }
            .delay-200 { animation-delay: 0.2s; }
            .delay-300 { animation-delay: 0.3s; }
            .delay-400 { animation-delay: 0.4s; }
            .delay-500 { animation-delay: 0.5s; }

            ::-webkit-scrollbar {
              width: 8px;
            }
            ::-webkit-scrollbar-track {
              background: #0f172a;
            }
            ::-webkit-scrollbar-thumb {
              background: #334155;
              border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: #475569;
            }
            `,
          }}
        />
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4 py-20 md:py-28">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            <div className="max-w-3xl w-full relative z-10">
              {/* Icon */}
              <div className="flex justify-center mb-8 animate-slide-up">
                <div className="p-3 rounded-lg card">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-center mb-6 animate-slide-up delay-100 leading-tight tracking-tight text-white">
                Amazon Music API
              </h1>

              {/* Badge */}
              <div className="flex justify-center mb-8 animate-slide-up delay-200">
                <span className="px-4 py-2 text-xs md:text-sm font-semibold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Educational • Metadata Only
                </span>
              </div>

              {/* Description */}
              <p className="text-center text-lg md:text-xl text-slate-300 mb-8 animate-slide-up delay-300 max-w-2xl mx-auto font-medium leading-relaxed">
                A clean, metadata-only REST API for accessing Amazon Music data. Perfect for educational projects and
                learning.
              </p>

              {/* Disclaimer - Simplified styling */}
              <div className="card p-4 md:p-5 mb-10 animate-slide-up delay-400 max-w-2xl mx-auto border-amber-500/20 bg-amber-500/5">
                <p className="text-amber-200/80 text-sm leading-relaxed flex items-start gap-3">
                  <span className="text-amber-400 text-lg flex-shrink-0 mt-0.5">⚠️</span>
                  <span>
                    <strong>Educational Use Only:</strong> This unofficial API provides metadata access only. No media
                    streaming or downloads.
                  </span>
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center animate-slide-up delay-500">
                <a
                  href="/docs"
                  className="btn-primary px-8 md:px-12 py-3 md:py-4 rounded-lg text-base md:text-lg no-underline inline-flex items-center gap-2 group font-semibold"
                >
                  View Documentation
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-5xl w-full mx-auto px-4 pb-24 md:pb-32 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="card stat-item rounded-lg">
                <div className="stat-number">25M+</div>
                <div className="stat-label">Tracks Available</div>
              </div>
              <div className="card stat-item rounded-lg">
                <div className="stat-number">99%</div>
                <div className="stat-label">Uptime SLA</div>
              </div>
              <div className="card stat-item rounded-lg">
                <div className="stat-number">&lt;150ms</div>
                <div className="stat-label">Response Time</div>
              </div>
              <div className="card stat-item rounded-lg">
                <div className="stat-number">Free</div>
                <div className="stat-label">Forever</div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl w-full mx-auto px-4 pb-24 md:pb-32 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
              Why developers <span className="text-blue-400">love it</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {/* Feature 1 */}
              <div className="card p-6 md:p-7 rounded-lg animate-slide-up">
                <div className="feature-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Lightning Fast</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Optimized responses with intelligent caching and CDN distribution.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-6 md:p-7 rounded-lg animate-slide-up delay-100">
                <div className="feature-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Secure</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  API key authentication with built-in rate limiting.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-6 md:p-7 rounded-lg animate-slide-up delay-200">
                <div className="feature-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Clean API</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Well-structured, predictable JSON responses.</p>
              </div>

              {/* Feature 4 */}
              <div className="card p-6 md:p-7 rounded-lg animate-slide-up delay-300">
                <div className="feature-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Well Documented</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Complete docs with examples and interactive explorer.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="card p-6 md:p-7 rounded-lg animate-slide-up delay-400">
                <div className="feature-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Metadata Only</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  No streaming, downloads, or copyright content access.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="card p-6 md:p-7 rounded-lg animate-slide-up delay-500">
                <div className="feature-icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Always Free</h3>
                <p className="text-sm text-slate-400 leading-relaxed">No cost, no fees, no paywalls. Forever free.</p>
              </div>
            </div>
          </div>

          <footer className="border-t border-slate-700/30 py-8 px-4 mt-auto bg-slate-900/20 backdrop-blur-sm">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
                <div className="flex gap-8">
                  <a href="/docs" className="text-slate-400 hover:text-blue-400 transition-colors font-medium">
                    Documentation
                  </a>
                  <a href="/status" className="text-slate-400 hover:text-blue-400 transition-colors font-medium">
                    API Status
                  </a>
                </div>
                <p className="text-slate-500 text-center md:text-right">
                  © 2025 Unofficial Amazon Music API • Educational Use Only
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>,
  )
})

