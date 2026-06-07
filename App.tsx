import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import profileImg from './assets/profile.png'
import profileHomeImg from './assets/profile-home.png'



import Loader from './components/Loader'
import Navbar from './components/Navbar'
import SectionHeader from './components/SectionHeader'
import ProjectCard from './components/ProjectCard'
import type { Project } from './components/ProjectCard'
import SkillCard from './components/SkillCard'
import ExperienceItem from './components/ExperienceItem'




type SectionId = 'home' | 'about' | 'skills' | 'projects' | 'experience' | 'contact'

export default function App() {
  const items = useMemo(
    () =>
      [
        { id: 'home', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'skills', label: 'Skills' },
        { id: 'projects', label: 'Projects' },
        { id: 'experience', label: 'Experience' },
        { id: 'contact', label: 'Contact' },
      ] as const,
    [],
  )

  const [activeId, setActiveId] = useState<SectionId>('home')
  const [cursor, setCursor] = useState({ x: 0, y: 0 })

  const [typingIndex, setTypingIndex] = useState(0)
  const [typingText, setTypingText] = useState('')
  const typingPhrases = useMemo(
    () => [
      'Creative Developer & Robotics Engineer',
      'Cyberpunk Neon • Glassmorphism UI',
      'Robotics • IoT • UI/UX',
    ],
    [],
  )

  const revealRootRef = useRef<HTMLDivElement | null>(null)

  // Scrollspy + reveal
  const [suspendScrollspy, setSuspendScrollspy] = useState(false)

  const revealTriggerRef = useRef(0)

  useEffect(() => {

    const root = revealRootRef.current

    if (!root) return

    // Reveal
    // Trigger ulang reveal saat filter Projects berubah agar kartu yang baru muncul tidak tetap opacity:0
    revealTriggerRef.current += 1

    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))

    // Reset reveal state hanya untuk elemen yang belum pernah diinisialisasi,
    // supaya Experience/Contact tidak "kedip" saat effect re-run.
    els.forEach((el, idx) => {
      el.style.setProperty('--i', String(idx))
      if (!el.classList.contains('is-visible')) {
        el.classList.remove('is-visible')
      }
    })


    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('is-visible')
        })
      },
      { threshold: 0.12 },
    )



    els.forEach((el) => io.observe(el))

    // Scrollspy (stabilized)
    // Problem sebelumnya: IntersectionObserver + intersectionRatio bisa fluktuatif saat border area overlap,
    // sehingga activeId terlihat 'lompat'.
    // Solusi: tentukan section yang paling dekat dengan "garis acuan" di bawah navbar sticky.
    const sectionEls = Array.from(
      root.querySelectorAll<HTMLElement>('section[data-section]'),
    )

    let rafId = 0
    const update = () => {
      const nav = document.querySelector<HTMLElement>('.nav')
      const navH = nav?.offsetHeight ?? 0
      const referenceY = navH + 8 // sedikit di bawah navbar

      // cari section dengan jarak terdekat dari referenceY
      // (gunakan getBoundingClientRect relatif viewport)
      let best: { id: SectionId; dist: number } | null = null
      for (const s of sectionEls) {
        const rect = s.getBoundingClientRect()
        // dist: seberapa jauh top section dari referenceY
        const dist = Math.abs(rect.top - referenceY)
        const id = s.dataset.section as SectionId | undefined
        if (!id) continue

        if (!best || dist < best.dist) best = { id, dist }
      }

      if (best && best.id !== activeId) setActiveId(best.id)
    }

    const onScroll = () => {
      if (suspendScrollspy) return
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(update)
    }

    // initial
    update()

    const guardedOnScroll = () => {
      onScroll()
    }


    // pakai listener ter-guard biar tidak update activeId saat user klik filter
    window.addEventListener('scroll', guardedOnScroll, { passive: true })


    return () => {
      io.disconnect()
      window.removeEventListener('scroll', guardedOnScroll)
      cancelAnimationFrame(rafId)
    }
  }, [activeId, suspendScrollspy])




  // Cursor lighting follow
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setCursor({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // Typing effect (stabilize layout so other elements don't “shake”)
  useEffect(() => {
    let mounted = true
    const phrase = typingPhrases[typingIndex % typingPhrases.length]

    // Fix layout: don't change any container metrics while typing.
    // Render full phrase once (to establish line box), then type within fixed width.
    // (Avoid setState sync during effect body; do it inside rAF)
    const timer = window.setInterval(() => {}, 0)
    const raf = requestAnimationFrame(() => {
      if (!mounted) return
      setTypingText(phrase)

      // next tick: start typing from empty so animation is consistent
      window.setTimeout(() => {
        if (!mounted) return
        setTypingText('')

        let i = 0
        const typingTimer = window.setInterval(() => {
          if (!mounted) return
          i += 1
          setTypingText(phrase.slice(0, i))
          if (i >= phrase.length) {
            window.clearInterval(typingTimer)
            window.setTimeout(() => {
              if (!mounted) return
              setTypingIndex((x) => x + 1)
            }, 900)
          }
        }, 28)
      }, 0)
    })

    return () => {
      mounted = false
      cancelAnimationFrame(raf)
      window.clearInterval(timer)
    }
  }, [typingIndex, typingPhrases])




  const skillLevels = useMemo(
    () =>
      ({
        HTML: 92,
        CSS: 90,
        JavaScript: 84,
        React: 86,
        'Node.js': 78,
        Arduino: 82,
        'UI/UX Design': 76,
        Robotics: 88,
        Python: 81,
        CXX: 80,
      }) as const,
    [],
  )


  const skills = useMemo(
    () =>
      [
        {
          name: 'HTML',
          level: skillLevels.HTML,
          icon: (
            <img
              src="/HTML5_logo_and_wordmark.svg.png"
              alt=""
              width="29"
              height="26"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'CSS',
          level: skillLevels.CSS,
          icon: (
           <img
              src="/avuzxc7c9-removebg-preview.png"
              alt=""
              width="31"
              height="32"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'JavaScript',
          level: skillLevels.JavaScript,
          icon: (
            <img
              src="/javascript-logo-javascript-icon-transparent-free-png.webp"
              alt=""
              width="32"
              height="33"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'C++',
          level: skillLevels.CXX,
          icon: (
          <img
              src="/png-clipart-c-logo-the-c-programming-language-computer-icons-computer-programming-source-code-programming-miscellaneous-template-thumbnail-removebg-preview.png"
              alt=""
              width="30"
              height="31"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'Python',
          level: skillLevels.Python,
          icon: (
            <img
              src="/Python-logo-notext.svg.png"
              alt=""
              width="25"
              height="28"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },

        {
          name: 'Vite',
          level: skillLevels.Arduino,
          icon: (
            <img
              src="/4915800-middle-removebg-preview.png"
              alt=""
              width="25"
              height="28"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'Materialize',
          level: skillLevels['UI/UX Design'],
          icon: (
            <img
              src="/images-removebg-preview.png"
              alt=""
              width="25"
              height="28"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'TailwindCSS',
          level: skillLevels.Robotics,
          icon: (
           <img
              src="/tailwind-css-logo-png_seeklogo-354675-removebg-preview.png"
              alt=""
              width="25"
              height="28"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'Node.js',
          level: skillLevels['Node.js'],
          icon: (
            <img
              src="/87-879058_formation-node-js-node-js-logo-vector-removebg-preview.png"
              alt=""
              width="26"
              height="28"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'React',
          level: skillLevels.React,
          icon: (
            <img
              src="/React-icon.svg.png"
              alt=""
              width="28"
              height="26"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'Windows',
          level: skillLevels.React,
          icon: (
            <img
              src="/windows-11-logo-in-svg-format-v0-sudz5o3s1vn91.png"
              alt=""
              width="23"
              height="23"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        }, 
        {
          name: 'Arch Linux',
          level: skillLevels.React,
          icon: (
            <img
              src="/Arch_Linux__Crystal__icon.svg.png"
              alt=""
              width="23"
              height="23"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'Arduino IDE',
          level: skillLevels.React,
          icon: (
            <img
              src="/images-removebg-preview (1).png"
              alt=""
              width="23"
              height="23"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },
        {
          name: 'Visual Code',
          level: skillLevels.React,
          icon: (
            <img
              src="/Visual_Studio_Code_1.35_icon.svg.png"
              alt=""
              width="23"
              height="23"
              style={{ display: 'block' }}
              aria-hidden="true"
            />
          ),
        },

      ] as Array<{ name: string; level: number; icon: React.ReactNode }>,
    [skillLevels],
  )

  const projects = useMemo<Project[]>(
    () => [
      {
        id: 'p1',
        category: 'Website Project',
        title: 'Stexcell',
        description:
          'Website excellent class, Angkatan 2023, dan Kelas dengan kenangan yang tak terlupakan.',
        techStack: ['React', 'JavaScript', 'CSS', 'HTML'],
        demoUrl: 'https://excellentclass2026.vercel.app/',
        demoLabel: 'Link',
        githubUrl: undefined,
        imageUrl: '/projects/Screenshot 2026-05-25 075402.png',


      },

      {
        id: 'p2',
        category: 'IoT Project',
        title: 'Spoiled Food Detector',
        description:
          'Robot prototipe dengan code sederhana, Menggunakan mikrokontroler esp32, dan penghitungan kimia.',
        techStack: ['Arduino', 'C++', 'Sensors MQ-135, Dan MQ-4'],
        demoUrl: '/projects/MAN 2 Kota Kediri Scientific bukan asli.pdf',
        githubUrl:
          'https://github.com/tigers1111111111/coding-untuk-FreshAlert-alat-pendeteksi-makana-',
        imageUrl: '/projects/IMG-20251119-WA0064.jpg',
      },

      {
        id: 'p4',
        category: 'UI Design',
        title: 'Glass UI Component Kit',
        description:
          'Kumpulan komponen UI futuristik: cards, buttons, timeline, dan form dengan neon glow.',
        techStack: ['UI/UX', 'Design System', 'CSS'],
        demoUrl: undefined,
        githubUrl: undefined,
      },
    ],
    [],
  )


  const [projectFilter, setProjectFilter] = useState<Project['category'] | 'All'>('All')



  const projectCategories = useMemo(
    () =>
      [
        { id: 'All' as const, label: 'All' },
        { id: 'Website Project' as const, label: 'Website Project' },
        { id: 'Robot Project' as const, label: 'Robot Project' },
        { id: 'IoT Project' as const, label: 'IoT Project' },
        { id: 'UI Design' as const, label: 'UI Design' },
      ] as const,
    [],
  )


  const filteredProjects = useMemo(() => {
    if (projectFilter === 'All') return projects
    return projects.filter((p) => p.category === projectFilter)
  }, [projectFilter, projects])

  const [projectAnimNonce, setProjectAnimNonce] = useState(0)

  const onFilterProjects = (categoryId: (typeof projectCategories)[number]['id']) => {
    // Saat filter diklik, suspend scrollspy dulu supaya state activeId tidak mengganggu render Projects.
    setSuspendScrollspy(true)
    setProjectFilter(categoryId)

    // Animasi kartu project saat data berubah (tanpa menunggu scroll)
    setProjectAnimNonce((x) => x + 1)

    window.setTimeout(() => {
      setSuspendScrollspy(false)
    }, 800)
  }








  // Biar filter projects lebih terasa “smooth” tanpa animasi layout janky saat klik cepat.
  // Nonaktifkan scrollspy selama 250ms setelah klik filter.
  const onNav = (id: SectionId) => {
    const el = document.querySelector<HTMLElement>(`section[data-section="${id}"]`)
    if (!el) return

    // Delay 1 frame supaya perubahan layout (mis. dropdown tutup) tidak bikin smooth scroll stutter.
    requestAnimationFrame(() => {
      const nav = document.querySelector<HTMLElement>('.nav')
      const navH = nav?.offsetHeight ?? 0
      const top = el.getBoundingClientRect().top + window.scrollY - navH
      window.scrollTo({ top, behavior: 'smooth' })
    })
  }


  const onSubmitContact = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const fd = new FormData(form)

    // Basic validation; actual invalid messaging is via HTML constraints
    const name = String(fd.get('name') ?? '')
    const email = String(fd.get('email') ?? '')
    const message = String(fd.get('message') ?? '')

    if (!name || !email || !message) return

    alert('Pesan terkirim (demo). Silakan sambungkan ke backend/Email service di versi final.')

    form.reset()
  }

  return (
    <div
      className="app-root"
      ref={revealRootRef}
      style={
        {
          ['--mx' as unknown as string]: `${cursor.x}px`,
          ['--my' as unknown as string]: `${cursor.y}px`,
        } as React.CSSProperties

      }
    >
      <Loader />

      <div className="bg-grid" aria-hidden="true" />
      <div className="cursor-glow" aria-hidden="true" />

      <Navbar items={items as unknown as { id: string; label: string }[]} activeId={activeId} onNav={onNav} />

      <main>
        {/* HOME */}
        <section className="section hero-section" data-section="home" id="home">
          <div className="container hero-grid">
            <div className="hero-left reveal" data-reveal>
              <div className="profile-frame" aria-hidden="true">
                <div className="profile-ring" />
                <div className="profile-shimmer" />
              </div>
              <img src={profileHomeImg} className="profile-img" alt="Mohammad Nur Huda" />
            </div>

            <div className="hero-right reveal" data-reveal>
              <div className="hero-kicker">Hello, I’m</div>
              <h1 className="hero-title">
                Mohammad Nur Huda
                <span className="hero-title-glow" aria-hidden="true" />
              </h1>

              <div className="hero-typing" aria-live="polite">
                <span className="typing-label" aria-hidden="false">
                  {typingText}
                  <span className="typing-caret" aria-hidden="true" />
                </span>
              </div>

              <p className="hero-desc">
                Pelajar berusia 15 tahun yang terobsesi di dunia teknologi
                web development,robotika, dan cybersecurity. Senang menciptakan
                project-project digital modern dan bermanfaat.

              </p>

              <div className="hero-actions">
                <a
                  className="btn btn-primary"
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault()
                    onNav('about')
                  }}
                >
                  Profile
                </a>
                <a
                  className="btn btn-ghost"
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault()
                    onNav('contact')
                  }}
                >
                  Let’s Talk
                </a>
              </div>

              <div className="social-row" aria-label="Social media">
                <a className="social-pill" href="https://github.com/" target="_blank" rel="noreferrer" aria-label="terobsesi">
                  <span className="social-pill-icon" aria-hidden="true">
                    <i className="ri-github-line" />
                  </span>
                
                </a>
                <a className="social-pill" href="https://www.instagram.com/m.nr_huda?igsh=NGp5enc3ZXN1MjFs/" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <span className="social-pill-icon" aria-hidden="true">
                    <i className="ri-instagram-line" />
                  </span>
                </a>
                <a className="social-pill" href="https://linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <span className="social-pill-icon" aria-hidden="true">
                    <i className="ri-linkedin-line" />
                  </span>
                </a>
                <a className="social-pill" href="https://dribbble.com/" target="_blank" rel="noreferrer" aria-label="Dribbble">
                  <span className="social-pill-icon" aria-hidden="true">
                    <i className="ri-dribbble-line" />
                  </span> 
                </a>
              </div>
            </div>
          </div>

          <div className="hero-bg-orb" aria-hidden="true" />
          <div className="hero-scroll-indicator" aria-hidden="true">
            <div className="scroll-dot" />
          </div>
        </section>

        {/* ABOUT */}
        <section className="section" data-section="about" id="about">
          <div className="container">
            <SectionHeader
              kicker="About"
              title="Tentang saya"
              subtitle="Pengalaman coding, robotika, dan UI/UX dalam satu ekosistem futuristic."
            />

            <div className="about-grid">
              <div className="about-left reveal" data-reveal>
                <div className="about-photo" aria-hidden="true">
                  <div className="about-photo-glow" />
                  <img src={profileImg} alt="" className="about-photo-img" />
                </div>
              </div>

              <div className="about-right reveal" data-reveal>
                <div className="about-paragraph">
                  <p>
                   “Saya adalah pelajar yang memiliki minat besar di dunia teknologi, khususnya dalam pengembangan web modern,
                   robotika, dan cybersecurity. Saat ini saya masih terus belajar dan mengembangkan kemampuan melalui berbagai
                   project dan eksplorasi teknologi terbaru. Saya senang membangun tampilan website yang interaktif, responsif, dan memiliki desain modern untuk memberikan pengalaman pengguna yang lebih menarik.
                  </p>
                  <p>
                   Di bidang desain, saya menyukai gaya visual futuristik dengan detail seperti glow, glassmorphism, gradient 
                   modern, serta animasi yang smooth. Bagi saya, tampilan yang menarik dan nyaman digunakan merupakan bagian 
                   penting dalam menciptakan sebuah website yang profesional dan berkesan.
                  </p>
                </div>

                <div className="about-cards">
                  <div className="stat-card">
                    <div className="stat-num">5+</div>
                    <div className="stat-label">UI Experiments</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-num">20+</div>
                    <div className="stat-label">Coding Sessions</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-num">3</div>
                    <div className="stat-label">Robot Prototypes</div>
                  </div>
                </div>

                <div className="about-bottom">
                  <div className="mini-card">
                    <div className="mini-title">Eduaction</div>
                    <div className="mini-list">Madrasah Aliyah Student • 15th</div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-title">Achievement</div>
                    <div className="mini-list">Neon UI • Robot Control • Responsive Systems</div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-title">Achievement</div>
                    <div className="mini-list">Neon UI • Robot Control • Responsive Systems</div>
                  </div>
                  <div className="mini-card">
                    <div className="mini-title">Experience</div>
                    <div className="mini-list">Web Developer • UI Designer • Freelance Programmer</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-pill-row">
              <span className="pill">Passion teknologi</span>
              <span className="pill">Tujuan masa depan</span>
              <span className="pill">Inovasi digital</span>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section className="section" data-section="skills" id="skills">
          <div className="container">
            <SectionHeader
              kicker="Skills"
              title="Skillset yang siap membangun"
              subtitle="Desain UI, pemrograman web, dan integrasi robotika/IoT."
            />

            <div className="skills-grid">
              {skills.map((s) => (
                <SkillCard key={s.name} name={s.name} level={s.level} icon={s.icon} />
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="section" data-section="projects" id="projects">
          <div className="container">
            <SectionHeader
              kicker="Projects"
              title="Showcase modern & futuristik"
              subtitle="Kategori project: website, robot, IoT, dan UI design."
            />

            <div
              className="project-filters"
              role="tablist"
              aria-label="Project categories"
            >
              {projectCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`filter-btn ${projectFilter === c.id ? 'is-active' : ''}`}
                  onClick={() => onFilterProjects(c.id)}
                >
                  {c.label}
                </button>
              ))}

            </div>

            <div key={projectAnimNonce} className="projects-grid projects-grid-anim">
              {filteredProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>

          </div>
        </section>

        {/* EXPERIENCE */}
        <section className="section" data-section="experience" id="experience">
          <div className="container">
            <SectionHeader
              kicker="Experience"
              title="Timeline yang terarah"
              subtitle="Perjalanan membangun produk digital dan robotika."
            />

            <div className="timeline">
              <div className="timeline-line" aria-hidden="true" />

              <ExperienceItem
                year="2024"
                title="Web Developer"
                description="Membangun website modern dengan fokus interaksi, performa, dan desain premium."
              />
              <ExperienceItem
                year="2023"
                title="Robotics Creator"
                description="Mendesain & membuat robot prototipe berbasis teknologi modern dan mikrokontroler."
              />
              <ExperienceItem
                year="2022"
                title="Freelance Programmer"
                description="Mengerjakan kebutuhan coding client dari fitur sampai UI interaktif."
              />
              <ExperienceItem
                year="2021"
                title="UI Designer"
                description="Menerapkan konsep cyberpunk neon dan glassmorphism ke desain komponen UI."
              />
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="section" data-section="contact" id="contact">
          <div className="container">
            <SectionHeader
              kicker="Contact"
              title="Bangun sesuatu yang futuristik"
              subtitle="Kirim pesan untuk kolaborasi project atau konsultasi teknologi."
            />

            <div className="contact-grid">
              <form className="contact-form reveal" data-reveal onSubmit={onSubmitContact} noValidate>
                <div className="field">
                  <label htmlFor="name">Nama</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Masukkan nama"
                    required
                    minLength={2}
                    autoComplete="name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@domain.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="field">
                  <label htmlFor="message">Pesan</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tulis pesan kamu..."
                    required
                    minLength={10}
                    rows={5}
                  />
                </div>

                <button className="btn btn-primary btn-block" type="submit">
                  Send Message
                </button>

                <div className="form-note">*Teks dapat diganti sesuai kebutuhan kamu.</div>
              </form>

              <div className="contact-side reveal" data-reveal>
                <div className="contact-card">
                  <div className="contact-card-title">Info</div>
                  <div className="contact-item">
                    <span className="contact-k">Email</span>
                    <span className="contact-v">mohammadhuda7z@gmail.com</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-k">WhatsApp</span>
                    <span className="contact-v">+62 857-0441-6106</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-k">Alamat</span>
                    <span className="contact-v">Jl. A. Yani, Nglawak, Kec. Kertosono, Kabupaten Nganjuk, Jawa Timur 64315, Indonesia</span>
                  </div>

                  <div className="contact-actions">
                    <a className="btn btn-ghost" href="#" onClick={(e) => e.preventDefault()}>
                      WhatsApp Me
                    </a>
                    <a className="btn btn-ghost" href="#" onClick={(e) => e.preventDefault()}>
                      Email Me
                    </a>
                  </div>
                </div>

                <div className="contact-glow" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container footer-inner">
            <div className="footer-left">© {new Date().getFullYear()} Mohammad Nur Huda</div>
            <div className="footer-right">
              Created by Noorva project
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

