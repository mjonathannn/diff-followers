import "./App.css"

import type { ChangeEvent, DragEvent } from "react"
import { useState } from "react"

type Key = "old" | "new"

interface FileState {
  name: string
  usernames: Set<string>
}

interface CompareResult {
  unfollowed: string[]
  newFollowers: string[]
  totalOld: number
  totalNew: number
}

function extractUsernames(htmlText: string): Set<string> {
  const doc = new DOMParser().parseFromString(htmlText, "text/html")
  const links = doc.querySelectorAll('a[href*="instagram.com/"]')
  const usernames = new Set<string>()
  links.forEach((a) => {
    const href = a.getAttribute("href")
    if (!href) return
    try {
      const url = new URL(href, "https://instagram.com")
      const parts = url.pathname.split("/").filter(Boolean)
      if (parts.length === 1) {
        usernames.add(parts[0])
      }
    } catch {
      // ignore malformed hrefs
    }
  })
  return usernames
}

interface DropzoneProps {
  label: string
  hint: string
  fileState: FileState | null
  dragOver: boolean
  onFile: (file: File) => void
  onDragOver: (e: DragEvent<HTMLLabelElement>) => void
  onDragLeave: () => void
  onDrop: (e: DragEvent<HTMLLabelElement>) => void
}

function Dropzone({ label, hint, fileState, dragOver, onFile, onDragOver, onDragLeave, onDrop }: DropzoneProps) {
  const classes = ["dropzone", dragOver && "drag", fileState && "filled"].filter(Boolean).join(" ")

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <label className={classes} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <input type="file" accept=".html,.htm" onChange={handleChange} />
      <span className="dz-label">{label}</span>
      <span className="dz-filename">
        {fileState
          ? `${fileState.name} — ${fileState.usernames.size} contas encontradas`
          : "Clique ou arraste o arquivo"}
      </span>
      <span className="dz-hint">{hint}</span>
    </label>
  )
}

function DiffList({ items, sign }: { items: string[]; sign: "+" | "−" }) {
  if (items.length === 0) {
    return <div className="empty-row">nenhuma alteração</div>
  }
  return (
    <>
      {items.map((username) => (
        <div key={username} className={`diff-row ${sign === "+" ? "plus" : "minus"}`}>
          <span className="sign">{sign}</span>
          <span>{username}</span>
        </div>
      ))}
    </>
  )
}

function App() {
  const [files, setFiles] = useState<Record<Key, FileState | null>>({
    old: null,
    new: null,
  })
  const [dragOver, setDragOver] = useState<Record<Key, boolean>>({
    old: false,
    new: false,
  })
  const [status, setStatus] = useState<{ message: string; error: boolean }>({
    message: "",
    error: false,
  })
  const [results, setResults] = useState<CompareResult | null>(null)

  function handleFile(file: File, key: Key) {
    const reader = new FileReader()
    reader.onload = () => {
      const usernames = extractUsernames(reader.result as string)
      setFiles((prev) => ({ ...prev, [key]: { name: file.name, usernames } }))
    }
    reader.onerror = () => {
      setStatus({ message: "Não foi possível ler o arquivo.", error: true })
    }
    reader.readAsText(file)
  }

  function makeDragHandlers(key: Key) {
    return {
      onDragOver: (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        setDragOver((prev) => ({ ...prev, [key]: true }))
      },
      onDragLeave: () => setDragOver((prev) => ({ ...prev, [key]: false })),
      onDrop: (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        setDragOver((prev) => ({ ...prev, [key]: false }))
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file, key)
      },
    }
  }

  function handleCompare() {
    if (!files.old || !files.new) return
    const oldSet = files.old.usernames
    const newSet = files.new.usernames
    const unfollowed = [...oldSet].filter((u) => !newSet.has(u)).sort()
    const newFollowers = [...newSet].filter((u) => !oldSet.has(u)).sort()

    setResults({
      unfollowed,
      newFollowers,
      totalOld: oldSet.size,
      totalNew: newSet.size,
    })
    setStatus({
      message: `Comparação concluída — ${oldSet.size} → ${newSet.size} seguidores.`,
      error: false,
    })
  }

  const ready = Boolean(files.old && files.new)

  return (
    <div className="wrap">
      <header>
        <div className="eyebrow">DIFF-FOLLOWERS</div>
        <h1>Quem deixou de te seguir</h1>
        <p>
          Envie dois arquivos <strong>followers_1.html</strong> exportados do Instagram (Configurações → Sua atividade →
          Baixar suas informações) em datas diferentes. Tudo é processado aqui no navegador — nenhum dado sai da sua
          máquina.
        </p>
      </header>

      <div className="drop-grid">
        <Dropzone
          label="Exportação anterior"
          hint="followers_1.html (mais antigo)"
          fileState={files.old}
          dragOver={dragOver.old}
          onFile={(file) => handleFile(file, "old")}
          {...makeDragHandlers("old")}
        />
        <Dropzone
          label="Exportação atual"
          hint="followers_1.html (mais recente)"
          fileState={files.new}
          dragOver={dragOver.new}
          onFile={(file) => handleFile(file, "new")}
          {...makeDragHandlers("new")}
        />
      </div>

      <div className="actions">
        <button type="button" className="run" disabled={!ready} onClick={handleCompare}>
          Comparar
        </button>
        <span className={`status${status.error ? " error" : ""}`}>{status.message}</span>
      </div>

      {results && (
        <div id="results">
          <div className="summary">
            <div className="stat minus">
              <div className="num">{results.unfollowed.length}</div>
              <div className="label">deixaram de seguir</div>
            </div>
            <div className="stat plus">
              <div className="num">{results.newFollowers.length}</div>
              <div className="label">novos seguidores</div>
            </div>
            <div className="stat">
              <div className="num">{results.totalNew}</div>
              <div className="label">total atual</div>
            </div>
          </div>

          <div className="diff-panel">
            <div className="diff-head minus">− deixaram de te seguir</div>
            <div className="diff-list">
              <DiffList items={results.unfollowed} sign="−" />
            </div>
          </div>

          <div className="diff-panel">
            <div className="diff-head plus">+ novos seguidores</div>
            <div className="diff-list">
              <DiffList items={results.newFollowers} sign="+" />
            </div>
          </div>
        </div>
      )}

      <footer>
        Dica: guarde cada exportação com a data no nome do arquivo (ex: <strong>followers_2026-07.html</strong>) para
        comparar sempre com a mais recente da próxima vez.
      </footer>
    </div>
  )
}

export default App
