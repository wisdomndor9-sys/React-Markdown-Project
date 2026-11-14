import { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const placeholder = 
`
# Welcome to MarkdownEditor

Type on the left and see the result here on the right in real time.

`

const TOOLBAR = [
  { group: 'Headings', items: [
    { label: 'H1', title: 'Heading 1', prefix: '# ', block: true },
    { label: 'H2', title: 'Heading 2', prefix: '## ', block: true },
    { label: 'H3', title: 'Heading 3', prefix: '### ', block: true },
  ]},

  { group: 'Format', items: [
    { label: 'B', title: 'Bold', wrap: '**', bold: true },
    { label: 'I', title: 'Italic', wrap: '*', italic: true },
    { label: 'B+I', title: 'Bold Italic', wrap: '***', bold: true, italic: true },
    { label: '<>', title: 'Inline Code', wrap: '`' },
  ]},

  { group: 'Blocks', items: [
    { label: '• List', title: 'Bullet List', prefix: '- ', block: true },
    { label: '1. List', title: 'Numbered List', prefix: '1. ', block: true },
    { label: '" Quote', title: 'Blockquote', prefix: '> ', block: true },
    { label: '— Line', title: 'Divider', insert: '\n\n---\n\n' },
  ]},

  { group: 'Insert', items: [
    { label: '🔗 Link', title: 'Link', insertAround: { before: '[', after: '](url)' } },
  ]},
]

export default function App() {
  const [markdown, setMarkdown] = useState(placeholder)
  const [wordCount, setWordCount] = useState(() => countWords(placeholder))
  const textareaRef = useRef(null)

  function countWords(text) {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  }

  function handleChange(e) {
    setMarkdown(e.target.value)
    setWordCount(countWords(e.target.value))
  }

  function applyFormat(tool) {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = markdown.slice(start, end)
    const before = markdown.slice(0, start)
    const after = markdown.slice(end)

    let newText = markdown
    let cursorStart = start
    let cursorEnd = end

    if (tool.insert) {
      newText = before + tool.insert + after
      cursorStart = cursorEnd = start + tool.insert.length
    } else if (tool.wrap) {
      const w = tool.wrap
      const word = selected || 'text'

      newText = before + w + word + w + after
      cursorStart = start + w.length
      cursorEnd = cursorStart + word.length
    } else if (tool.insertAround) {
      const { before: b, after: a } = tool.insertAround
      const word = selected || 'link text'

      newText = before + b + word + a + after
      cursorStart = start + b.length
      cursorEnd = cursorStart + word.length
    } else if (tool.prefix) {
      const lineStart = before.lastIndexOf('\n') + 1
      const word = selected || 'text'

      newText = markdown.slice(0, lineStart) + tool.prefix + word + after
      cursorStart = lineStart + tool.prefix.length
      cursorEnd = cursorStart + word.length
    }

    setMarkdown(newText)
    setWordCount(countWords(newText))

    setTimeout(() => {
      el.focus()
      el.setSelectionRange(cursorStart, cursorEnd)
    }, 0)
  }

  const lineCount = markdown.split('\n').length
  const charCount = markdown.length

  return (
    <div style={styles.app}>

      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <div style={styles.logo}>📝 MarkdownEditor</div>
        </div>

        <div style={styles.topbarRight}>
          <span style={styles.stat}>{wordCount} words</span>
          <span style={styles.stat}>{charCount} chars</span>
          <span style={styles.stat}>{lineCount} lines</span>

          <button
            style={styles.clearBtn}
            onClick={() => {
              setMarkdown('')
              setWordCount(0)
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={styles.toolbar}>
        {TOOLBAR.map((group, gi) => (
          <div key={gi} style={styles.toolGroup}>
            {group.items.map(tool => (
              <button
                key={tool.label}
                title={tool.title}
                style={{
                  ...styles.toolBtn,
                  fontWeight: tool.bold ? '700' : '400',
                  fontStyle: tool.italic ? 'italic' : 'normal',
                }}
                onClick={() => applyFormat(tool)}
              >
                {tool.label}
              </button>
            ))}

            {gi < TOOLBAR.length - 1 && (
              <div style={styles.toolDivider} />
            )}
          </div>
        ))}
      </div>

      <div style={styles.body}>

        <div style={styles.editorPane}>
          <div style={styles.paneHeader}>
            <span style={styles.paneLabel}>EDITOR</span>
          </div>

          <textarea
            ref={textareaRef}
            style={styles.textarea}
            value={markdown}
            onChange={handleChange}
            placeholder="Start writing markdown..."
            spellCheck={false}
          />
        </div>

        <div style={styles.splitter} />

        <div style={styles.previewPane}>
          <div style={styles.paneHeader}>
            <span style={styles.paneLabel}>PREVIEW</span>
          </div>

          <div style={styles.previewScroll}>
            {markdown.trim() === '' ? (
              <p style={styles.emptyMsg}>
                Nothing to preview yet.
              </p>
            ) : (
              <div style={styles.prose}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, children, ...props }) => (
                      <h1 style={styles.mdH1} {...props}>
                        {children}
                      </h1>
                    ),

                    h2: ({ node, children, ...props }) => (
                      <h2 style={styles.mdH2} {...props}>
                        {children}
                      </h2>
                    ),

                    h3: ({ node, children, ...props }) => (
                      <h3 style={styles.mdH3} {...props}>
                        {children}
                      </h3>
                    ),

                    p: ({ node, children, ...props }) => (
                      <p style={styles.mdP} {...props}>
                        {children}
                      </p>
                    ),

                    ul: ({ node, children, ...props }) => (
                      <ul style={styles.mdUl} {...props}>
                        {children}
                      </ul>
                    ),

                    ol: ({ node, children, ...props }) => (
                      <ol style={styles.mdOl} {...props}>
                        {children}
                      </ol>
                    ),

                    li: ({ node, children, ...props }) => (
                      <li style={styles.mdLi} {...props}>
                        {children}
                      </li>
                    ),

                    hr: ({ node, ...props }) => (
                      <hr style={styles.mdHr} {...props} />
                    ),

                    a: ({ node, children, ...props }) => (
                      <a
                        style={styles.mdA}
                        target="_blank"
                        rel="noreferrer"
                        {...props}
                      >
                        {children}
                      </a>
                    ),

                    blockquote: ({ node, children, ...props }) => (
                      <blockquote
                        style={styles.mdBlockquote}
                        {...props}
                      >
                        {children}
                      </blockquote>
                    ),

                    strong: ({ node, children, ...props }) => (
                      <strong style={styles.mdStrong} {...props}>
                        {children}
                      </strong>
                    ),

                    em: ({ node, children, ...props }) => (
                      <em style={styles.mdEm} {...props}>
                        {children}
                      </em>
                    ),

                    code: ({ node, children, ...props }) => (
                      <code style={styles.mdCode} {...props}>
                        {children}
                      </code>
                    ),
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

      </div>

      <div style={styles.footer}>
        {[
          ['# H1', 'Heading 1'],
          ['## H2', 'Heading 2'],
          ['**text**', 'Bold'],
          ['*text*', 'Italic'],
          ['- item', 'Bullet'],
          ['1. item', 'Numbered'],
          ['> text', 'Quote'],
          ['`code`', 'Code'],
          ['[text](url)', 'Link'],
          ['---', 'Divider'],
        ].map(([syntax, desc]) => (
          <div key={syntax} style={styles.footerItem}>
            <code style={styles.footerCode}>
              {syntax}
            </code>

            <span style={styles.footerDesc}>
              {desc}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#1e1e2e',
    fontFamily: "'Segoe UI', sans-serif",
    color: '#cdd6f4',
  },

  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    height: '48px',
    background: '#181825',
    borderBottom: '1px solid #313244',
    flexShrink: 0,
  },

  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  topbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },

  logo: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#cba6f7',
    letterSpacing: '0.3px',
  },

  stat: {
    fontSize: '12px',
    color: '#6c7086',
  },

  clearBtn: {
    background: 'transparent',
    border: '1px solid #313244',
    color: '#6c7086',
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif",
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 16px',
    background: '#181825',
    borderBottom: '1px solid #313244',
    flexShrink: 0,
    flexWrap: 'wrap',
  },

  toolGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },

  toolDivider: {
    width: '1px',
    height: '20px',
    background: '#313244',
    margin: '0 6px',
  },

  toolBtn: {
    background: 'transparent',
    border: '1px solid transparent',
    color: '#cdd6f4',
    borderRadius: '5px',
    padding: '4px 9px',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'Segoe UI', sans-serif",
    whiteSpace: 'nowrap',
    transition: 'background 0.1s, border-color 0.1s',
  },

  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  },

  editorPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },

  paneHeader: {
    padding: '8px 20px',
    background: '#181825',
    borderBottom: '1px solid #313244',
  },

  paneLabel: {
    fontSize: '11px',
    color: '#6c7086',
    letterSpacing: '1.5px',
    fontWeight: '600',
  },

  textarea: {
    flex: 1,
    width: '100%',
    background: '#1e1e2e',
    border: 'none',
    outline: 'none',
    resize: 'none',
    padding: '24px',
    color: '#cdd6f4',
    fontSize: '14px',
    fontFamily: "'Courier New', monospace",
    lineHeight: '1.9',
    boxSizing: 'border-box',
    minHeight: '70vh',
  },

  splitter: {
    width: '1px',
    background: '#313244',
    flexShrink: 0,
  },

  previewPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    background: '#181825',
  },

  previewScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px',
  },

  emptyMsg: {
    color: '#45475a',
    fontSize: '14px',
    textAlign: 'center',
    marginTop: '60px',
  },

  prose: {},

  footer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 20px',
    padding: '10px 20px',
    background: '#181825',
    borderTop: '1px solid #313244',
    flexShrink: 0,
  },

  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  footerCode: {
    fontSize: '11px',
    color: '#f38ba8',
    background: '#313244',
    padding: '1px 5px',
    borderRadius: '3px',
    fontFamily: "'Courier New', monospace",
  },

  footerDesc: {
    fontSize: '11px',
    color: '#6c7086',
  },

  mdH1: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#cdd6f4',
    borderBottom: '1px solid #313244',
    paddingBottom: '8px',
    marginBottom: '16px',
    marginTop: '8px',
  },

  mdH2: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#cdd6f4',
    borderBottom: '1px solid #313244',
    paddingBottom: '6px',
    marginBottom: '12px',
    marginTop: '28px',
  },

  mdH3: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#cba6f7',
    marginBottom: '8px',
    marginTop: '20px',
  },

  mdP: {
    color: '#bac2de',
    lineHeight: '1.8',
    marginBottom: '14px',
    fontSize: '15px',
  },

  mdUl: {
    paddingLeft: '22px',
    marginBottom: '14px',
  },

  mdOl: {
    paddingLeft: '22px',
    marginBottom: '14px',
  },

  mdLi: {
    color: '#bac2de',
    marginBottom: '6px',
    lineHeight: '1.7',
    fontSize: '15px',
  },

  mdHr: {
    border: 'none',
    borderTop: '1px solid #313244',
    margin: '24px 0',
  },

  mdA: {
    color: '#89b4fa',
    textDecoration: 'underline',
  },

  mdBlockquote: {
    borderLeft: '3px solid #cba6f7',
    margin: '16px 0',
    padding: '10px 16px',
    background: '#1e1e2e',
    borderRadius: '0 6px 6px 0',
    color: '#a6adc8',
    fontStyle: 'italic',
  },

  mdStrong: {
    color: '#cdd6f4',
    fontWeight: '700',
  },

  mdEm: {
    color: '#f5c2e7',
    fontStyle: 'italic',
  },

  mdCode: {
    background: '#313244',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#f38ba8',
    fontFamily: "'Courier New', monospace",
  },
}
