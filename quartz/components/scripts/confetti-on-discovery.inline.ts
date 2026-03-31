function normalize(path: string) {
  return path.replace(/\/+$/, "") || "/"
}

function getVisited(): string[] {
  try {
    return JSON.parse(localStorage.getItem("graph-visited") || "[]")
  } catch {
    return []
  }
}

function getConfettiFn() {
  return (window as Window & { confetti?: (options: Record<string, unknown>) => void }).confetti
}

function loadConfettiLibrary(): Promise<void> {
  if (typeof getConfettiFn() === "function") {
    return Promise.resolve()
  }

  const existing = document.querySelector(
    'script[data-confetti-lib="true"]',
  ) as HTMLScriptElement | null

  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => resolve(), { once: true })
    })
  }

  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"
    script.defer = true
    script.dataset.confettiLib = "true"
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.head.appendChild(script)
  })
}

function triggerConfettiWhenVisible() {
  async function fire() {
    await loadConfettiLibrary()
    const confetti = getConfettiFn()

    if (typeof confetti !== "function") {
      return
    }

    confetti({
      particleCount: 100,
      spread: 65,
      startVelocity: 30,
      gravity: 0.8,
      origin: { y: 0.6 },
    })

    setTimeout(() => {
      if (typeof confetti !== "function") {
        return
      }

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      })
    }, 150)
  }

  if (document.visibilityState === "visible") {
    setTimeout(() => {
      void fire()
    }, 200)
  } else {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setTimeout(() => {
          void fire()
        }, 200)
        document.removeEventListener("visibilitychange", onVisible)
      }
    }

    document.addEventListener("visibilitychange", onVisible)
  }
}

function checkAndCelebrate() {
  const pageId = normalize(window.location.pathname)
  const before = getVisited().map(normalize)

  // Wait briefly so graph.inline can persist the current slug on "nav".
  setTimeout(() => {
    const after = getVisited().map(normalize)
    const isNewVisit = !before.includes(pageId) && after.includes(pageId)

    if (isNewVisit) {
      triggerConfettiWhenVisible()
    }
  }, 120)
}

checkAndCelebrate()
document.addEventListener("nav", () => {
  checkAndCelebrate()
})
