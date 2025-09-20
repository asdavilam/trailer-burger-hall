declare module '*.svg' {
  import * as React from 'react'
  const SVG: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }>
  export default SVG
}