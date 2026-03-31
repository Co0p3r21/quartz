// @ts-ignore
import confettiScript from "./scripts/confetti-on-discovery.inline"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ConfettiOnDiscovery: QuartzComponent = () => null
ConfettiOnDiscovery.afterDOMLoaded = confettiScript

export default (() => ConfettiOnDiscovery) satisfies QuartzComponentConstructor
