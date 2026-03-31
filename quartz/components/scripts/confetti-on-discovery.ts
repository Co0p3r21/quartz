import { QuartzComponentConstructor } from "../types"

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

function triggerConfettiWhenVisible() {
  function fire() {
    // @ts-ignore
    if (window.confetti) {
      // @ts-ignore
      window.confetti({
        particleCount: 100,
        spread: 65,
        startVelocity: 30,
        gravity: 0.8,
        origin: { y: 0.6 },
      })

      setTimeout(() => {
        // @ts-ignore
        window.confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
        })
      }, 150)
    }
  }

  if (document.visibilityState === "visible") {
    setTimeout(fire, 200)
  } else {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setTimeout(fire, 200)
        document.removeEventListener("visibilitychange", onVisible)
      }
    }

    document.addEventListener("visibilitychange", onVisible)
  }
}

function checkAndCelebrate() {
  const pageId = normalize(window.location.pathname)

  const before = getVisited().map(normalize)

  setTimeout(() => {
    const after = getVisited().map(normalize)

    const isNewVisit =
      !before.includes(pageId) && after.includes(pageId)

    if (isNewVisit) {
      triggerConfettiWhenVisible()
    }
  }, 50)
}

export default (() => {
  // Only run in the browser, not during build time
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    // läuft bei initialem Laden
    checkAndCelebrate()

    // läuft bei SPA Navigation (SEHR wichtig für Quartz)
    document.addEventListener("nav", () => {
      checkAndCelebrate()
    })
  }
}) satisfies QuartzComponentConstructor