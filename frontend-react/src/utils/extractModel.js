import { GPU_BENCHMARKS } from '../data/gpuBenchmarks'
import { CPU_BENCHMARKS } from '../data/cpuBenchmarks'
import { SMARTPHONE_BENCHMARKS } from '../data/smartphoneBenchmarks'

/**
 * Extract a known GPU model from a listing title.
 */
export function extractGpuModel(title) {
  const t = title.toUpperCase()

  // NVIDIA: RTX/GTX + 4 digits + optional suffix
  const nvidiaMatch = t.match(/\b(RTX|GTX)\s*(\d{4})\s*(TI\s*SUPER|TI|SUPER)?\b/)
  if (nvidiaMatch) {
    const prefix = nvidiaMatch[1]
    const num = nvidiaMatch[2]
    let suffix = (nvidiaMatch[3] || '').trim()
    if (suffix === 'TI SUPER') suffix = 'Ti Super'
    else if (suffix === 'TI') suffix = 'Ti'
    else if (suffix === 'SUPER') suffix = 'Super'
    const key = suffix ? `${prefix} ${num} ${suffix}` : `${prefix} ${num}`
    if (GPU_BENCHMARKS[key] !== undefined) return key
  }

  // AMD: RX + 3-4 digits + optional suffix
  const amdMatch = t.match(/\bRX\s*(\d{3,4})\s*(XTX|XT|GRE)?\b/)
  if (amdMatch) {
    const num = amdMatch[1]
    const suffix = (amdMatch[2] || '').trim()
    const key = suffix ? `RX ${num} ${suffix}` : `RX ${num}`
    if (GPU_BENCHMARKS[key] !== undefined) return key
  }

  // Intel Arc (A-series and B-series)
  const arcMatch = t.match(/\bARC\s*([AB]\d{3})\b/)
  if (arcMatch) {
    const key = `Arc ${arcMatch[1]}`
    if (GPU_BENCHMARKS[key] !== undefined) return key
  }

  return null
}

/**
 * Extract a known CPU model from a listing title.
 */
export function extractCpuModel(title) {
  const t = title

  // Intel Core Ultra: "Core Ultra 9 285K", "Core Ultra 7 265K"
  const ultraMatch = t.match(/Core\s*Ultra\s*([579])\s*(\d{3})(K|KF|F|)/i)
  if (ultraMatch) {
    const tier = ultraMatch[1]
    const num = ultraMatch[2]
    const suffix = (ultraMatch[3] || '').toUpperCase()
    const key = suffix ? `Core Ultra ${tier} ${num}${suffix}` : `Core Ultra ${tier} ${num}`
    if (CPU_BENCHMARKS[key] !== undefined) return key
  }

  // AMD Ryzen: "Ryzen 9 7950X3D", "Ryzen 5 5600X", "Ryzen 7 5700G"
  const ryzenMatch = t.match(/Ryzen\s*([3579])\s*(\d{4})(X3D|XT|X|G|F|)/i)
  if (ryzenMatch) {
    const tier = ryzenMatch[1]
    const num = ryzenMatch[2]
    const suffix = ryzenMatch[3] || ''
    const key = `Ryzen ${tier} ${num}${suffix}`
    if (CPU_BENCHMARKS[key] !== undefined) return key
    // Try without suffix
    const keyBase = `Ryzen ${tier} ${num}`
    if (CPU_BENCHMARKS[keyBase] !== undefined) return keyBase
  }

  // Intel: "i9-14900K", "i5 13600KF", "Core i7 12700K"
  const intelMatch = t.match(/i([3579])[\s-]*(\d{4,5})\s*([A-Z]{0,3})/i)
  if (intelMatch) {
    const tier = intelMatch[1]
    const num = intelMatch[2]
    const suffix = (intelMatch[3] || '').toUpperCase()
    // Try with full suffix, then common variants, then without
    for (const s of [suffix, suffix.replace(/[^KFS]/g, ''), '']) {
      const key = s ? `i${tier}-${num}${s}` : `i${tier}-${num}`
      if (CPU_BENCHMARKS[key] !== undefined) return key
    }
  }

  return null
}

/**
 * Extract a known smartphone model from a listing title.
 */
export function extractSmartphoneModel(title) {
  const t = title

  // iPhone: "iPhone 16 Pro Max", "iPhone 15", "iPhone SE 2022"
  const iphoneMatch = t.match(/iPhone\s*(SE\s*\d{4}|\d{1,2})\s*(Pro\s*Max|Pro|Plus|Mini)?/i)
  if (iphoneMatch) {
    let model = iphoneMatch[1].trim()
    const suffix = (iphoneMatch[2] || '').trim()
    // Normalize "SE 2022" etc.
    if (model.toUpperCase().startsWith('SE')) {
      const key = `iPhone ${model}`
      if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
    } else {
      // Capitalize suffix properly
      let normalSuffix = ''
      if (/pro\s*max/i.test(suffix)) normalSuffix = 'Pro Max'
      else if (/pro/i.test(suffix)) normalSuffix = 'Pro'
      else if (/plus/i.test(suffix)) normalSuffix = 'Plus'
      else if (/mini/i.test(suffix)) normalSuffix = 'Mini'
      const key = normalSuffix ? `iPhone ${model} ${normalSuffix}` : `iPhone ${model}`
      if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
    }
  }

  // Samsung Galaxy S: "Galaxy S25 Ultra", "S24+", "Samsung S23 FE"
  const galaxySMatch = t.match(/(?:Galaxy\s*)?S(\d{2})\s*(Ultra|FE|\+|Plus)?/i)
  if (galaxySMatch) {
    const num = galaxySMatch[1]
    let suffix = (galaxySMatch[2] || '').trim()
    if (suffix === '+') suffix = '+'
    else if (/plus/i.test(suffix)) suffix = '+'
    else if (/ultra/i.test(suffix)) suffix = 'Ultra'
    else if (/fe/i.test(suffix)) suffix = 'FE'
    const key = suffix ? `Galaxy S${num} ${suffix}` : `Galaxy S${num}`
    if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
  }

  // Samsung Galaxy A: "Galaxy A55", "Samsung A54"
  const galaxyAMatch = t.match(/(?:Galaxy\s*)?A(\d{2})\b/i)
  if (galaxyAMatch) {
    const key = `Galaxy A${galaxyAMatch[1]}`
    if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
  }

  // Samsung Galaxy Z: "Galaxy Z Fold 6", "Z Flip 5"
  const galaxyZMatch = t.match(/(?:Galaxy\s*)?Z\s*(Fold|Flip)\s*(\d)/i)
  if (galaxyZMatch) {
    const type = galaxyZMatch[1].charAt(0).toUpperCase() + galaxyZMatch[1].slice(1).toLowerCase()
    const key = `Galaxy Z ${type} ${galaxyZMatch[2]}`
    if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
  }

  // Google Pixel: "Pixel 9 Pro XL", "Pixel 8a"
  const pixelMatch = t.match(/Pixel\s*(\d)\s*(Pro\s*XL|Pro|a)?/i)
  if (pixelMatch) {
    const num = pixelMatch[1]
    let suffix = (pixelMatch[2] || '').trim()
    if (/pro\s*xl/i.test(suffix)) suffix = 'Pro XL'
    else if (/pro/i.test(suffix)) suffix = 'Pro'
    else if (/a/i.test(suffix)) suffix = 'a'
    const key = suffix ? `Pixel ${num} ${suffix}` : `Pixel ${num}`
    if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
  }

  // Xiaomi numbered: "Xiaomi 14 Ultra", "Xiaomi 13 Pro"
  const xiaomiMatch = t.match(/Xiaomi\s*(\d{2})\s*(Ultra|Pro|T\s*Pro|T)?/i)
  if (xiaomiMatch) {
    const num = xiaomiMatch[1]
    let suffix = (xiaomiMatch[2] || '').trim()
    if (/t\s*pro/i.test(suffix)) suffix = 'T Pro'
    else if (/ultra/i.test(suffix)) suffix = 'Ultra'
    else if (/pro/i.test(suffix)) suffix = 'Pro'
    else if (/^t$/i.test(suffix)) suffix = 'T'
    const key = suffix ? `Xiaomi ${num} ${suffix}` : `Xiaomi ${num}`
    if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
  }

  // Redmi Note: "Redmi Note 13 Pro+"
  const redmiMatch = t.match(/Redmi\s*Note\s*(\d{2})\s*(Pro\+|Pro|\+)?/i)
  if (redmiMatch) {
    const num = redmiMatch[1]
    let suffix = (redmiMatch[2] || '').trim()
    if (suffix === 'Pro+' || suffix === 'Pro +') suffix = 'Pro+'
    const key = suffix ? `Redmi Note ${num} ${suffix}` : `Redmi Note ${num}`
    if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
  }

  // Poco: "Poco F6 Pro", "Poco X6"
  const pocoMatch = t.match(/Poco\s*([FX]\d)\s*(Pro)?/i)
  if (pocoMatch) {
    const model = pocoMatch[1].toUpperCase()
    const suffix = pocoMatch[2] ? 'Pro' : ''
    const key = suffix ? `Poco ${model} ${suffix}` : `Poco ${model}`
    if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
  }

  // OnePlus: "OnePlus 13", "OnePlus Nord 4"
  const oneplusMatch = t.match(/OnePlus\s*(Nord\s*\d|\d{1,2})/i)
  if (oneplusMatch) {
    const model = oneplusMatch[1].trim()
    const key = `OnePlus ${model}`
    if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
  }

  // Nothing Phone
  const nothingMatch = t.match(/Nothing\s*Phone\s*(\d)/i)
  if (nothingMatch) {
    const key = `Nothing Phone ${nothingMatch[1]}`
    if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
  }

  // Sony Xperia
  const xperiaMatch = t.match(/Xperia\s*(\d)\s*(VI|V|IV|III|II)?/i)
  if (xperiaMatch) {
    const num = xperiaMatch[1]
    const gen = (xperiaMatch[2] || '').toUpperCase()
    const key = gen ? `Xperia ${num} ${gen}` : `Xperia ${num}`
    if (SMARTPHONE_BENCHMARKS[key] !== undefined) return key
  }

  return null
}

/**
 * Extract RAM capacity in GB from a listing title.
 * Returns { capacityGB, type } or null.
 */
export function extractRamInfo(title) {
  const t = title.toUpperCase()

  // Match patterns: "32GB", "32 GB", "2x16GB", "2x 16 GB", "Kit 64GB"
  // First try kit patterns
  const kitMatch = t.match(/(\d)\s*[Xx]\s*(\d{1,3})\s*GB/)
  if (kitMatch) {
    const sticks = parseInt(kitMatch[1])
    const perStick = parseInt(kitMatch[2])
    const totalGB = sticks * perStick
    if (totalGB >= 4 && totalGB <= 256) {
      const type = extractDdrType(t)
      return { capacityGB: totalGB, type }
    }
  }

  // Then try simple capacity
  const simpleMatch = t.match(/(\d{1,3})\s*GB/)
  if (simpleMatch) {
    const gb = parseInt(simpleMatch[1])
    if (gb >= 4 && gb <= 256) {
      const type = extractDdrType(t)
      return { capacityGB: gb, type }
    }
  }

  return null
}

function extractDdrType(t) {
  if (t.includes('DDR5')) return 'DDR5'
  if (t.includes('DDR4')) return 'DDR4'
  if (t.includes('DDR3')) return 'DDR3'
  return null
}
