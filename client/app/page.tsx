"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { API_URL, apiFetch } from "./lib/api";
import { getAnalyticsIdentity } from "./lib/analytics";

const nav = [
  ["home", "Home"],
  ["work", "Work"],
  ["services", "Services"],
  ["process", "Process"],
  ["about", "About"],
  ["contact", "Contact"],
] as const;

const services = [
  ["UI/UX Design", "Research-led interfaces that turn visitors into customers."],
  ["Custom Web Development", "Fast, accessible Next.js builds with clean, maintainable code."],
  ["E-Commerce", "Storefronts tuned for speed, trust and checkout conversion."],
  ["Brand Systems", "Logos, type and design tokens that stay consistent everywhere."],
  ["Conversion Strategy", "Funnels, copy and testing plans tied to revenue goals."],
  ["Launch & Support", "Monitoring, updates and a team on call after go-live."],
] as const;

type Project = readonly [name: string, category: string, text: string, image: string, id?: string, liveUrl?: string | null];

const filterCategories = [
  "All",
  "Fashion",
  "Accessories",
  "Restaurants",
  "Clinics",
  "Real Estate",
  "Salons",
  "Decor",
] as const;

const steps = [
  ["Discovery", "We learn your market, users and goals, then agree on measurable outcomes."],
  ["Flows", "User journeys and site maps that remove friction before any pixel is drawn."],
  ["Wireframes", "Low-fidelity layouts to settle structure and content hierarchy fast."],
  ["Mockups", "High-fidelity designs in your brand, reviewed with you on every key screen."],
  ["Prototyping", "Clickable prototypes and a coded build you can test on real devices."],
  ["Launch", "QA, performance checks, deployment and a handover you can rely on."],
] as const;

const faqs = [
  ["How long does a typical project take?", "Most marketing sites ship in 4–6 weeks. Custom platforms take 8–14 weeks, scoped at discovery."],
  ["What does it cost?", "Projects start from a fixed quote after discovery, so budget is clear before design begins."],
  ["Do you work with existing brands?", "Yes. We extend your identity or build a new system if you need one."],
  ["Will I own the code?", "Yes. You receive the full repository and documentation at launch."],
  ["Do you offer support after launch?", "Yes. Monthly retainers cover updates, monitoring and improvements."],
] as const;

const whatsappNumber = "923294574521";
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello V4 Softronic, I would like to discuss a project.")}`;

export default function Home({ initialActive = "home" }: { initialActive?: string }) {
  const [active, setActive] = useState(initialActive);
  const [filter, setFilter] = useState("All");
  const [drawer, setDrawer] = useState(false);
  const [processIndex, setProcessIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaderWord, setLoaderWord] = useState("LET’S");
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem("v4-loader-seen") === "1") {
      setLoading(false);
      return;
    }
    const words = ["LET’S", "MAKE", "SOMETHING", "AWESOME"];
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      if (index < words.length) {
        setLoaderWord(words[index]);
      } else {
        window.clearInterval(interval);
        window.setTimeout(() => {
          sessionStorage.setItem("v4-loader-seen", "1");
          setLoading(false);
        }, 150);
      }
    }, 180);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    const refreshProjects = async () => {
      try {
        const response = await apiFetch("/api/projects");
        if (!response.ok) throw new Error(`Project request failed with status ${response.status}`);
        const data = await response.json();
        if (active && Array.isArray(data.projects)) {
          setProjects(data.projects.map((project: { name: string; category: string; text: string; image: string; id: string; liveUrl: string | null }) =>
            [project.name, project.category, project.text, project.image, project.id, project.liveUrl] as const));
        }
      } catch (error) {
        if (active) console.error("Could not refresh projects from the backend.", error);
      }
    };

    void refreshProjects();
    const interval = window.setInterval(refreshProjects, 30_000);
    window.addEventListener("focus", refreshProjects);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshProjects);
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      const path = window.location.pathname.replace("/", "") || "home";
      setActive(nav.some(([id]) => id === path) ? path : "home");
      window.scrollTo(0, 0);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const go = (id: string) => {
    window.history.pushState({}, "", id === "home" ? "/" : `/${id}`);
    setActive(id);
    window.scrollTo(0, 0);
  };

  const track = (type: "project_view" | "filter_view", niche: string, projectName?: string, projectId?: string) => {
    const identity = type === "project_view" ? getAnalyticsIdentity() : {};
    apiFetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, niche, projectName, projectId, ...identity }),
    }).catch(() => undefined);
  };

  const visibleProjects = filter === "All" ? projects : projects.filter((project) => project[1] === filter);

  return (
    <>
      {loading && (
        <div className="curtain" role="status" aria-label="Loading V4 Softronic">
          <div className="curtain-word">
            {loaderWord === "AWESOME" ? <><span>AWESOME</span><b>.</b></> : <><i /><span>{loaderWord}</span></>}
          </div>
        </div>
      )}
      <div id="main">
      <header className="header">
        <button className="logo" onClick={() => go("home")} aria-label="V4 Softronic home">
          <img src="/v4-logo.png" alt="V4 Softronic" width="132" height="76" />
        </button>
        <nav className="nav" aria-label="Primary">
          {nav.map(([id, label]) => (
            <button key={id} className={active === id ? "on" : ""} onClick={() => go(id)}>{label}</button>
          ))}
        </nav>
      </header>

      {active === "home" && (
        <>
          <section className="hero page">
            <div className="hero-inner">
              <span className="eb">Web Design &amp; Engineering Agency</span>
              <svg className="wordmark" viewBox="0 0 1000 190" role="img" aria-label="V4 SOFTRONIC">
                <text x="500" y="145" textAnchor="middle" textLength="960" lengthAdjust="spacingAndGlyphs">V4 SOFTRONIC</text>
              </svg>
              <p className="hero-sub">Digital Craftsmanship Built for Business Growth.</p>
              <p className="hero-copy">We design and build fast, conversion-first websites and web apps for growing brands.</p>
              <div className="hb">
                <button className="btn" onClick={() => setDrawer(true)}>Start a Project</button>
                <button className="btn out" onClick={() => go("work")}>See Our Work</button>
              </div>
            </div>
            <button className="scroll" onClick={() => go("work")} aria-label="Scroll to work" />
          </section>

          <section className="showcase-strip" aria-label="Selected clients">
            <div className="showcase-track">
              {["Selected for local growth", "Built for conversion", "Designed for trust",
              "Selected for local growth", "Built for conversion", "Designed for trust"].map((name, index) => (
              <span key={`${name}-${index}`}>{name}</span>
              ))}
            </div>
          </section>

          <section className="w home-section">
            <div className="section-heading">
              <span className="section-kicker">What we do</span>
              <h2>What we build.</h2>
              <p>Six disciplines, one accountable team.</p>
            </div>
            <div className="grid services-grid">
              {services.map(([title, text], index) => (
                <article className="card service" key={title}>
                  <span className="service-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="w home-section">
            <div className="section-heading">
              <span className="section-kicker">Selected work</span>
              <h2>Featured work.</h2>
            </div>
            <div className="grid featured-grid">
              {projects.map(([name, category, text, image, id, liveUrl]) => (
                <button className="featured-card" key={id || name} onClick={() => {
                  track("project_view", category, name, id);
                  if (liveUrl) window.open(liveUrl, "_blank", "noopener,noreferrer");
                  else go("work");
                }}>
                  <Image src={image} alt={`${name} project preview`} width={800} height={500} sizes="(max-width: 768px) 100vw, 50vw" unoptimized={image.startsWith(API_URL)} />
                  <span>{category}</span>
                  <h3>{name}</h3>
                  <p>{text}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="w home-section process-home">
            <div className="section-heading">
              <span className="section-kicker">Our process</span>
              <h2>Six steps, no surprises.</h2>
              <p>Clear decisions, thoughtful craft and measurable outcomes at every stage.</p>
            </div>
            <div className="process-layout">
              <div className="timeline">
                {steps.map(([title, text], index) => (
                  <article
                    key={title}
                    className={processIndex === index ? "active" : ""}
                    onMouseEnter={() => setProcessIndex(index)}
                    onClick={() => setProcessIndex(index)}
                    onFocus={() => setProcessIndex(index)}
                    tabIndex={0}
                  >
                    <b>Step {index + 1}</b><h3>{title}</h3><p>{text}</p>
                  </article>
                ))}
              </div>
              <div className="process-visual">
                <img src={`/process-${processIndex + 1}.webp`} alt={`${steps[processIndex][0]} and design process`} />
                <div className="process-caption">
                  <span>0{processIndex + 1} / 06</span>
                  <div>
                    <h3>{steps[processIndex][0]}</h3>
                    <p>{steps[processIndex][1]}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="w home-section comparison-section">
            <div className="section-heading">
              <span className="section-kicker">Why V4</span>
              <h2>Agency vs. traditional freelancer.</h2>
            </div>
            <div className="comparison">
              <div><b>Team</b><span>Designers, engineers, strategists</span><span>One person</span></div>
              <div><b>Availability</b><span>Coverage during leave or illness</span><span>Single point of failure</span></div>
              <div><b>Process</b><span>Documented six-step workflow</span><span>Varies by person</span></div>
              <div><b>Scale</b><span>Grows with your roadmap</span><span>Capacity capped</span></div>
              <div><b>Support</b><span>Post-launch retainer</span><span>Ad hoc</span></div>
            </div>
          </section>

          <section className="w home-section story-section">
            <img src="/brandyfy-team.jpeg" alt="V4 Softronic digital team" />
            <div>
              <span className="section-kicker">What makes us different</span>
              <h2>We make complex products feel effortless.</h2>
              <p>V4 Softronic brings design, development and digital strategy together to build clear, reliable experiences from the first idea to final launch.</p>
              <div className="story-grid">
                <article><h3>Design plus development</h3><p>One connected team from research and interface design to production code.</p></article>
                <article><h3>Strategy meets creativity</h3><p>Every creative decision supports your audience, brand and business goals.</p></article>
              </div>
            </div>
          </section>

          <section className="w home-section metrics-section">
            <div className="metric"><strong>6</strong><span>Design &amp; engineering disciplines</span></div>
            <div className="metric"><strong>1 day</strong><span>Typical inquiry response</span></div>
            <div className="metric"><strong>Launch</strong><span>to long-term support</span></div>
          </section>

          <section className="w home-section faq-section">
            <div className="section-heading">
              <span className="section-kicker">Questions, answered</span>
              <h2>Frequently asked.</h2>
            </div>
            <div className="faq-list">
              {faqs.map(([question, answer]) => (
                <details key={question}><summary>{question}</summary><p>{answer}</p></details>
              ))}
            </div>
          </section>
        </>
      )}

      {active === "work" && (
        <section className="w page">
          <h2>Proof in Every Pixel.</h2>
          <div className="tabs">
            {filterCategories.map((item) => (
              <button key={item} className={`chip ${filter === item ? "on" : ""}`} onClick={() => { setFilter(item); track("filter_view", item); }}>{item}</button>
            ))}
          </div>
          <div className="grid">
            {visibleProjects.map(([name, category, text, image, id, liveUrl]) => {
              const content = (
                <>
                  <div className="mock mock-image"><Image src={image} alt={`${name} project preview`} fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized={image.startsWith(API_URL)} /></div>
                  <div className="cb"><span className="project-cat">{category}</span><h3>{name}</h3><p>{text}</p></div>
                </>
              );
              return liveUrl ? (
                <a className="card project" key={id || name} href={liveUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("project_view", category, name, id)}>
                  {content}
                </a>
              ) : (
                <article className="card project" key={id || name} onClick={() => track("project_view", category, name, id)}>
                  {content}
                </article>
              );
            })}
            {visibleProjects.length === 0 && filter !== "All" && <p>No projects in this category yet.</p>}
            {filter === "All" && (
              <article className="card project your-project">
                <div className="your-project-mark">V4</div>
                <div className="cb">
                  <span className="project-cat">Your project here</span>
                  <h3>Let&apos;s create something remarkable.</h3>
                  <p>Start with a free conversation about your goals and next digital advantage.</p>
                  <a className="btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Discuss on WhatsApp</a>
                </div>
              </article>
            )}
          </div>
        </section>
      )}

      {active === "services" && (
        <section className="w page">
          <h2>Strategy, Design, and Code—Under One Roof.</h2>
          <div className="grid services-grid">
            {services.map(([title, text], index) => (
              <article className="card service" key={title}>
                <span className="service-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {active === "process" && (
        <section className="w page">
          <h2>Where Creative Precision Meets Engineering.</h2>
          <div className="process-layout">
          <div className="timeline">
            {steps.map(([title, text], index) => (
              <article
                key={title}
                className={processIndex === index ? "active" : ""}
                onMouseEnter={() => setProcessIndex(index)}
                onClick={() => setProcessIndex(index)}
                onFocus={() => setProcessIndex(index)}
                tabIndex={0}
              ><b>Step {index + 1}</b><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
          <div className="process-visual">
            <img src={`/process-${processIndex + 1}.webp`} alt={`${steps[processIndex][0]} and design process`} />
          </div>
          </div>
        </section>
      )}

      {active === "about" && (
        <section className="w page about-page">
          <div className="about-hero">
            <span className="section-kicker">Agency Foundation &amp; Team Structure</span>
            <h2>One team. Four disciplines. One shared direction.</h2>
            <p>
              We are building a team that understands business needs, finds opportunities,
              designs solutions, develops technology, tests quality and delivers real value.
            </p>
            <div className="about-principle">
              <strong>Start with what we can deliver. Build trust through quality. Expand through capability.</strong>
            </div>
          </div>

          <div className="allocation-card">
            <span className="section-kicker">How we work</span>
            <h2>Connected disciplines. Shared accountability.</h2>
            <p>
              Strategy, design, development and quality assurance work together from the
              first brief to launch, keeping decisions clear and every detail aligned.
            </p>
            <div className="about-disciplines">
              {[
                ["Strategy", "Research, positioning, business goals and conversion planning to give every project a clear direction."],
                ["UI/UX", "User journeys, wireframes, visual systems and polished interfaces built for clarity and trust."],
                ["Development", "Fast, accessible and scalable websites and applications with clean, maintainable engineering."],
                ["QA", "Cross-device testing, accessibility, performance checks and careful review before every launch."],
              ].map(([discipline, detail], index) => (
                <article key={discipline}>
                  <span>0{index + 1}</span>
                  <h3>{discipline}</h3>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {active === "contact" && (
        <section className="w contact page">
          <h2>Let&apos;s Build Your Next Digital Advantage.</h2>
          <p>Tell us what you need. We reply within one business day.</p>
          <Inquiry />
        </section>
      )}

      <nav className="mobile-nav" aria-label="Mobile">
        {nav.map(([id, label]) => (
          <button key={id} className={active === id ? "on" : ""} onClick={() => go(id)}>{label}</button>
        ))}
      </nav>

      <a className="whatsapp-float" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat with V4 Softronic on WhatsApp">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16.04 3.2A12.72 12.72 0 0 0 5.1 22.52L3.5 28.8l6.42-1.68A12.74 12.74 0 1 0 16.04 3.2Zm0 22.98a10.14 10.14 0 0 1-5.17-1.42l-.37-.22-3.8 1 1.02-3.71-.24-.38A10.22 10.22 0 1 1 16.04 26.18Zm5.6-7.66c-.31-.15-1.82-.9-2.1-1-.28-.1-.48-.15-.68.15-.2.31-.78 1-.96 1.21-.18.2-.35.23-.66.08-.31-.15-1.31-.48-2.49-1.54a9.25 9.25 0 0 1-1.71-2.12c-.18-.31-.02-.48.13-.63.14-.14.31-.36.46-.54.15-.18.2-.31.31-.51.1-.2.05-.38-.03-.54-.08-.15-.68-1.64-.93-2.24-.25-.59-.5-.51-.68-.52h-.58c-.2 0-.54.08-.82.38-.28.31-1.07 1.05-1.07 2.56 0 1.5 1.1 2.96 1.25 3.17.15.2 2.16 3.3 5.23 4.63.73.31 1.3.5 1.74.64.73.23 1.4.2 1.93.12.59-.09 1.82-.74 2.08-1.46.26-.71.26-1.32.18-1.45-.08-.13-.28-.2-.59-.36Z" />
        </svg>
        <span>WhatsApp</span>
      </a>

      {drawer && <button className="overlay" aria-label="Close inquiry" onClick={() => setDrawer(false)} />}
      <aside className={`drawer ${drawer ? "open" : ""}`} aria-hidden={!drawer} {...(!drawer ? { inert: true } : {})}>
        <div className="drawer-head"><h2>Start a Project</h2><button onClick={() => setDrawer(false)} aria-label="Close">×</button></div>
        <Inquiry onSuccess={() => window.setTimeout(() => setDrawer(false), 900)} />
      </aside>

      <footer>
        <div className="footer-watermark">V4 SOFTRONIC</div>
        <h2>Have a project in mind?</h2>
        <a className="btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer">Let&apos;s Talk on WhatsApp</a>
        <p>© 2026 V4 Softronic. All rights reserved.</p>
      </footer>
      </div>
    </>
  );
}

function Inquiry({ onSuccess }: { onSuccess?: () => void } = {}) {
  const [need, setNeed] = useState("");
  const [budget, setBudget] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      setError("");
      const data = new FormData(event.currentTarget);
      const message = [
        "Hello V4 Softronic, I would like to discuss a project.",
        `Name: ${data.get("name") || ""}`,
        `Email: ${data.get("email") || ""}`,
        `Service: ${need || "Not selected"}`,
        `Budget: ${budget || "Not selected"}`,
        `Details: ${data.get("details") || ""}`,
      ].join("\n");
      const popup = window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      apiFetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "inquiry",
          niche: need || "Not selected",
          name: data.get("name") || "",
          email: data.get("email") || "",
        }),
      }).catch(() => undefined);
      if (popup) {
        setSent(true);
        onSuccess?.();
      } else {
        setError("Popup blocked. Allow popups and try again, or use the WhatsApp button.");
      }
    }}>
      <div><label htmlFor="name">Name</label><input id="name" name="name" required placeholder="Your name" /></div>
      <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required placeholder="you@company.com" /></div>
      <div><label>What do you need?</label><div className="row">
        {["UI/UX Design", "Web Development", "E-Commerce", "Brand Systems"].map((item) => (
          <button type="button" key={item} className={`chip ${need === item ? "on" : ""}`} onClick={() => setNeed(item)}>{item}</button>
        ))}
      </div></div>
      <div><label>Budget</label><div className="row">
        {["PKR 25K–50K", "PKR 50K–100K", "PKR 100K–250K", "PKR 250K+"].map((item) => (
          <button type="button" key={item} className={`chip ${budget === item ? "on" : ""}`} onClick={() => setBudget(item)}>{item}</button>
        ))}
      </div></div>
      <div><label htmlFor="details">Project details</label><textarea id="details" name="details" rows={4} placeholder="Goals, timeline, links" /></div>
      {error && <p role="alert" style={{ color: "#a33" }}>{error}</p>}
      <button className="btn" type="submit">{sent ? "WhatsApp opened. We'll reply within one business day." : "Send inquiry"}</button>
    </form>
  );
}