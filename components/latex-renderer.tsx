"use client"

import { useEffect, useRef } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

interface LaTeXRendererProps {
  content: string
  className?: string
  inline?: boolean
}

export function LaTeXRenderer({ content, className = "", inline = false }: LaTeXRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Since our backend returns text interspersed with math blocks ($...$ and $$...$$),
    // we need to split it, render math with KaTeX, and keep HTML text.
    const renderContent = (text: string) => {
      // Small trick to simplify regex matching: we combine display and inline match handling
      let htmlOutput = text;
      
      // Let's protect HTML tags temporarily if we need to, but our text from page.tsx 
      // doesn't have much HTML other than plain text and LaTeX.
      
      // First convert $$ ... $$ to display math
      const blocksResult = [];
      let lastIndex = 0;
      
      // We will parse out $$ ... $$ and $ ... $ tokens
      const pattern = /(\$\$)([\s\S]+?)\$\$|\$([\s\S]+?)\$/g;
      
      let match;
      let resultStr = "";
      
      while ((match = pattern.exec(text)) !== null) {
        // Add the preceding text
        let beforeText = text.substring(lastIndex, match.index);
        // Transform newlines to <br> in text outside math
        beforeText = beforeText.replace(/\n\n/g, "</p><p>");
        beforeText = beforeText.replace(/\n/g, "<br>");
        resultStr += beforeText;
        
        lastIndex = match.index + match[0].length;
        
        try {
          if (match[1] === "$$") {
            // Display math
            const latexText = match[2].trim();
            resultStr += katex.renderToString(latexText, { displayMode: true, throwOnError: false });
          } else {
            // Inline math (match[3])
            const latexText = match[3].trim();
            resultStr += katex.renderToString(latexText, { displayMode: false, throwOnError: false });
          }
        } catch (e) {
          console.error("KaTeX rendering error:", e);
          resultStr += match[0]; // fallback to raw string
        }
      }
      
      // Add the remaining text
      let afterText = text.substring(lastIndex);
      afterText = afterText.replace(/\n\n/g, "</p><p>");
      afterText = afterText.replace(/\n/g, "<br>");
      resultStr += afterText;
      
      if (!resultStr.startsWith("<p>") && !resultStr.startsWith("<div") && !resultStr.startsWith("<h")) {
        resultStr = `<p>${resultStr}</p>`;
      }

      containerRef.current!.innerHTML = resultStr;
    }

    renderContent(content)
  }, [content])

  return (
    <div 
      className={`latex-content text-inherit ${inline ? "inline" : "block"} ${className}`}
      style={{ display: inline ? "inline" : "block" }}
      ref={containerRef}
    />
  )
}
