import { mkdir, stat } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const workspaceRoot = process.cwd()

const assets = [
  { input: "public/boss.png", output: "public/boss.webp", width: 896, quality: 84 },
  { input: "public/monster.png", output: "public/monster.webp", width: 896, quality: 84 },
  { input: "public/characters/estabilidad.png", output: "public/characters/estabilidad.webp", width: 640, quality: 82 },
  { input: "public/characters/kepleriano.png", output: "public/characters/kepleriano.webp", width: 640, quality: 82 },
  { input: "public/characters/hamiltoniano.png", output: "public/characters/hamiltoniano.webp", width: 640, quality: 82 },
  { input: "public/characters/lagrangiano.png", output: "public/characters/lagrangiano.webp", width: 640, quality: 82 },
  { input: "public/characters/gravitacional.png", output: "public/characters/gravitacional.webp", width: 640, quality: 82 },
  { input: "public/characters/potencial.png", output: "public/characters/potencial.webp", width: 640, quality: 82 },
]

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`

const optimizeAsset = async ({ input, output, width, quality }) => {
  const inputPath = path.join(workspaceRoot, input)
  const outputPath = path.join(workspaceRoot, output)

  await mkdir(path.dirname(outputPath), { recursive: true })

  await sharp(inputPath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, alphaQuality: 92, effort: 6 })
    .toFile(outputPath)

  const [sourceStats, outputStats] = await Promise.all([stat(inputPath), stat(outputPath)])
  const savedBytes = sourceStats.size - outputStats.size
  const savedPercentage = sourceStats.size > 0 ? ((savedBytes / sourceStats.size) * 100).toFixed(1) : "0.0"

  return {
    input,
    output,
    before: sourceStats.size,
    after: outputStats.size,
    savedBytes,
    savedPercentage,
  }
}

const results = await Promise.all(assets.map(optimizeAsset))

const totalBefore = results.reduce((sum, result) => sum + result.before, 0)
const totalAfter = results.reduce((sum, result) => sum + result.after, 0)
const totalSavedBytes = totalBefore - totalAfter
const totalSavedPercentage = totalBefore > 0 ? ((totalSavedBytes / totalBefore) * 100).toFixed(1) : "0.0"

console.log("Imagenes optimizadas:\n")

for (const result of results) {
  console.log(
    `${result.input} -> ${result.output} | ${formatKb(result.before)} -> ${formatKb(result.after)} | ahorro ${formatKb(result.savedBytes)} (${result.savedPercentage}%)`,
  )
}

console.log(`\nTotal: ${formatKb(totalBefore)} -> ${formatKb(totalAfter)} | ahorro ${formatKb(totalSavedBytes)} (${totalSavedPercentage}%)`)