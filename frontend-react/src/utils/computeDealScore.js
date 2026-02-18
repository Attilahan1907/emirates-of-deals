import { GPU_BENCHMARKS } from '../data/gpuBenchmarks'
import { CPU_BENCHMARKS } from '../data/cpuBenchmarks'
import { SMARTPHONE_BENCHMARKS } from '../data/smartphoneBenchmarks'
import { extractGpuModel, extractCpuModel, extractSmartphoneModel, extractRamInfo } from './extractModel'

/**
 * Compute deal scores for all results.
 * Returns array of { score, model, benchmark, pricePerGB?, ramType? } or null entries.
 */
export function computeDealScores(results, benchmarkType = null) {
  if (results.length === 0) return []

  if (benchmarkType === 'gpu' || benchmarkType === 'cpu' || benchmarkType === 'smartphone') {
    return computeBenchmarkScores(results, benchmarkType)
  }

  if (benchmarkType === 'ram') {
    return computeRamScores(results)
  }

  return computeRelativeScores(results)
}

function computeBenchmarkScores(results, type) {
  const config = {
    gpu: { db: GPU_BENCHMARKS, extract: extractGpuModel },
    cpu: { db: CPU_BENCHMARKS, extract: extractCpuModel },
    smartphone: { db: SMARTPHONE_BENCHMARKS, extract: extractSmartphoneModel },
  }
  const { db, extract } = config[type]

  const scored = results.map((item) => {
    const model = extract(item.title)
    const benchmark = model ? db[model] : null
    const pricePerf = benchmark && item.price > 0 ? benchmark / item.price : null
    return { model, benchmark, pricePerf }
  })

  const validPPs = scored.filter((s) => s.pricePerf !== null).map((s) => s.pricePerf)

  if (validPPs.length === 0) {
    return computeRelativeScores(results)
  }

  const minPP = Math.min(...validPPs)
  const maxPP = Math.max(...validPPs)
  const range = maxPP - minPP

  return scored.map((s) => {
    if (s.pricePerf === null) {
      return { score: null, model: null, benchmark: null }
    }
    const score = range === 0 ? 50 : Math.round(((s.pricePerf - minPP) / range) * 100)
    return { score, model: s.model, benchmark: s.benchmark }
  })
}

function computeRamScores(results) {
  const scored = results.map((item) => {
    const ramInfo = extractRamInfo(item.title)
    if (!ramInfo || item.price <= 0) {
      return { score: null, model: null, benchmark: null, pricePerGB: null, ramType: null, capacityGB: null }
    }
    const pricePerGB = item.price / ramInfo.capacityGB
    return {
      model: `${ramInfo.capacityGB}GB${ramInfo.type ? ' ' + ramInfo.type : ''}`,
      benchmark: ramInfo.capacityGB,
      pricePerGB,
      ramType: ramInfo.type,
      capacityGB: ramInfo.capacityGB,
    }
  })

  // Lower price per GB = better score
  const validPPGs = scored.filter((s) => s.pricePerGB !== null).map((s) => s.pricePerGB)

  if (validPPGs.length === 0) {
    return computeRelativeScores(results)
  }

  const minPPG = Math.min(...validPPGs)
  const maxPPG = Math.max(...validPPGs)
  const range = maxPPG - minPPG

  return scored.map((s) => {
    if (s.pricePerGB === null) {
      return { score: null, model: null, benchmark: null }
    }
    // Invert: lower price/GB = higher score
    const score = range === 0 ? 50 : Math.round(((maxPPG - s.pricePerGB) / range) * 100)
    return {
      score,
      model: s.model,
      benchmark: s.capacityGB,
      pricePerGB: s.pricePerGB,
      ramType: s.ramType,
    }
  })
}

function computeRelativeScores(results) {
  const prices = results.map((r) => r.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice

  return results.map((item) => {
    const score = range === 0 ? 50 : Math.round(((maxPrice - item.price) / range) * 100)
    return { score, model: null, benchmark: null }
  })
}
