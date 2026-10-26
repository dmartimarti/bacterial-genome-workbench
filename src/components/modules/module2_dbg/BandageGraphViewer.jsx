import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import { Network, Eye, Sparkles, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Move } from 'lucide-react';
import { useLabState } from '../../../context/LabStateContext';

export default function BandageGraphViewer({
  kSize,
  hasError,
  cleaned,
  activeKmer,
  cytoscapeElements = []
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [viewMode, setViewMode] = useState('cytoscape'); // Default to interactive Cytoscape
  const [graphHeight, setGraphHeight] = useState(450);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme } = useLabState();

  const isDark = theme === 'dark';

  // Zoom and fit helpers
  const handleFit = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.resize();
      cyRef.current.fit(undefined, 35);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 1.25,
        renderedPosition: {
          x: cyRef.current.width() / 2,
          y: cyRef.current.height() / 2
        }
      });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 0.8,
        renderedPosition: {
          x: cyRef.current.width() / 2,
          y: cyRef.current.height() / 2
        }
      });
    }
  }, []);

  const handleResetLayout = useCallback(() => {
    if (cyRef.current) {
      const layout = cyRef.current.layout({
        name: 'cose',
        animate: true,
        animationDuration: 400,
        padding: 40,
        nodeOverlap: 30,
        idealEdgeLength: 85
      });
      layout.run();
    }
  }, []);

  // Initialize and update Cytoscape graph when elements change
  useEffect(() => {
    if (viewMode !== 'cytoscape' || !containerRef.current) return;

    if (cyRef.current) {
      cyRef.current.destroy();
    }

    const nodeBg = isDark ? '#0f172a' : '#ffffff';
    const nodeBorder = isDark ? '#10b981' : '#059669';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const edgeColor = isDark ? '#10b981' : '#059669';
    const textBgColor = isDark ? '#020617' : '#f8fafc';

    try {
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements: cytoscapeElements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': nodeBg,
              'border-width': 2.5,
              'border-color': nodeBorder,
              'label': 'data(label)',
              'color': textColor,
              'font-size': '11px',
              'font-family': 'monospace',
              'font-weight': '600',
              'text-valign': 'center',
              'text-halign': 'center',
              'text-wrap': 'wrap',
              'width': 'label',
              'height': 'label',
              'padding': '14px',
              'shape': 'round-rectangle'
            }
          },
          {
            selector: 'node[type = "repeat"]',
            style: {
              'border-color': '#f59e0b',
              'background-color': isDark ? '#451a03' : '#fef3c7',
              'color': isDark ? '#fde68a' : '#92400e',
              'border-width': 3.5
            }
          },
          {
            selector: 'node[type = "error"]',
            style: {
              'border-color': '#f43f5e',
              'background-color': isDark ? '#4c0519' : '#ffe4e6',
              'color': isDark ? '#fecdd3' : '#9f1239',
              'line-style': 'dashed'
            }
          },
          {
            selector: 'node[type = "tip"]',
            style: {
              'border-color': '#f59e0b',
              'background-color': isDark ? '#451a03' : '#fef3c7',
              'color': isDark ? '#fde68a' : '#92400e',
              'line-style': 'dashed'
            }
          },
          {
            selector: 'node[type = "start"]',
            style: {
              'border-color': '#06b6d4',
              'border-width': 3
            }
          },
          {
            selector: 'node[type = "end"]',
            style: {
              'border-color': '#a855f7',
              'border-width': 3
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2.5,
              'line-color': edgeColor,
              'target-arrow-color': edgeColor,
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '10px',
              'font-family': 'monospace',
              'font-weight': 'bold',
              'color': isDark ? '#cbd5e1' : '#334155',
              'text-background-opacity': 0.95,
              'text-background-color': textBgColor,
              'text-background-padding': '3px',
              'text-background-shape': 'roundrectangle'
            }
          },
          {
            selector: 'edge[?isError]',
            style: {
              'line-color': '#f43f5e',
              'target-arrow-color': '#f43f5e',
              'line-style': 'dashed',
              'color': '#f43f5e'
            }
          }
        ],
        layout: {
          name: 'cose',
          animate: false,
          padding: 35,
          nodeOverlap: 30,
          idealEdgeLength: 85
        }
      });
    } catch (e) {
      console.warn('Cytoscape layout error', e);
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [cytoscapeElements, viewMode, isDark]);

  // ResizeObserver to automatically resize Cytoscape when user drags resize handle or changes height
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (cyRef.current) {
        cyRef.current.resize();
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 transition-colors ${
      isFullscreen ? 'fixed inset-4 z-50 overflow-auto shadow-2xl flex flex-col justify-between' : ''
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Resulting De Bruijn Graph Topology (k = {kSize}, Node Overlap = {kSize - 1} bp)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            {kSize <= 4 &&
              'COLLAPSED REPEAT: When k is smaller than or equal to the repeat length, repeat occurrences merge into shared central nodes, causing ambiguity.'}
            {kSize > 4 && kSize < 8 &&
              'RESOLVED LINEAR PATH: When k is larger than the repeat length, k-mers span into unique flanking DNA, keeping repeat copies completely separate!'}
            {kSize >= 8 &&
              'POTENTIAL FRAGMENTATION: When k approaches read length or depth drops, consecutive reads fail to share a full (k-1) overlap.'}
          </p>
        </div>

        {/* View mode toggle & size options */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Height Presets */}
          {!isFullscreen && viewMode === 'cytoscape' && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[10px] text-slate-500 px-1 font-medium">Height:</span>
              {[
                { label: '350px', val: 350 },
                { label: '500px', val: 500 },
                { label: '650px', val: 650 }
              ].map((h) => (
                <button
                  key={h.val}
                  onClick={() => setGraphHeight(h.val)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    graphHeight === h.val
                      ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('cytoscape')}
              className={`px-3 py-1 rounded-md transition font-medium flex items-center gap-1.5 ${
                viewMode === 'cytoscape'
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-600 dark:border-emerald-500/40 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Dynamic Cytoscape.js
            </button>
            <button
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-1 rounded-md transition font-medium flex items-center gap-1.5 ${
                viewMode === 'diagram'
                  ? 'bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-600 dark:border-emerald-500/40 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Curated SVG
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => {
              setIsFullscreen(!isFullscreen);
              setTimeout(handleFit, 100);
            }}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Graph Inspector'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Assembly Status Badge & Cytoscape Toolbar */}
      <div className="flex flex-wrap items-center justify-between text-xs gap-2">
        <span className={`font-mono px-3 py-1 rounded-full border ${
          kSize >= 5 && (!hasError || cleaned)
            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
        }`}>
          {kSize <= 4 && 'Output: Repeat Node Collapsed (Bifurcating paths)'}
          {kSize >= 5 && (!hasError || cleaned) && 'Output: Linear Eulerian Path Resolved'}
          {kSize >= 5 && hasError && !cleaned && 'Output: Assembly Broken by Error Bubble / Tip'}
        </span>

        {viewMode === 'cytoscape' && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="px-2 py-0.5 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded transition font-medium text-[11px]"
              title="Fit Graph in View"
            >
              Fit
            </button>
            <button
              onClick={handleResetLayout}
              className="px-2 py-0.5 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded transition font-medium text-[11px] flex items-center gap-1"
              title="Re-run Force Layout (COSE)"
            >
              <RotateCcw className="w-3 h-3" /> Re-layout
            </button>
          </div>
        )}
      </div>

      {/* Main Graph Viewport with Resizable Handle */}
      {viewMode === 'cytoscape' ? (
        <div
          style={{ height: isFullscreen ? 'calc(100vh - 180px)' : `${graphHeight}px` }}
          className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-2 relative overflow-hidden transition-all resize-y min-h-[300px] max-h-[850px] group shadow-inner"
        >
          <div ref={containerRef} className="w-full h-full" />
          
          {/* Resize handle icon hint in bottom right */}
          <div className="absolute bottom-1.5 right-1.5 pointer-events-none text-slate-400 opacity-60 group-hover:opacity-100 transition">
            <Move className="w-3.5 h-3.5 rotate-45" />
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-colors">
          <svg viewBox="0 0 760 265" className="w-full h-auto select-none">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
              </marker>
              <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>
            </defs>

            {/* Case: Small k <= 4 (Collapsed Repeat Loop) */}
            {kSize <= 4 && (
              <g>
                <line x1="135" y1="135" x2="245" y2="135" stroke="#06b6d4" strokeWidth="3" markerEnd="url(#arrow)" />
                <text x="155" y="125" fill="#0891b2" fontSize="10" fontFamily="monospace">ATG→TGG</text>

                <path d="M 335 108 C 300 20, 460 20, 425 108" fill="none" stroke="#f59e0b" strokeWidth="3.5" markerEnd="url(#arrow)" />
                <text x="315" y="34" fill="#b45309" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  Spacer Loop: TAC → ACC → CCG → CGC (30x)
                </text>

                <line x1="505" y1="135" x2="610" y2="135" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <text x="522" y="125" fill="#7e22ce" fontSize="10" fontFamily="monospace">TAT→ATT</text>

                <rect x="25" y="112" width="110" height="46" rx="8" fill={isDark ? '#0f172a' : '#ffffff'} stroke="#06b6d4" strokeWidth="2.5" />
                <text x="42" y="135" fill="#0891b2" fontSize="12" fontFamily="monospace" fontWeight="bold">AT → TG</text>
                <text x="42" y="150" fill="#64748b" fontSize="9.5">5&apos; Start (30x)</text>

                <rect x="250" y="108" width="255" height="56" rx="10" fill={isDark ? '#451a03' : '#fef3c7'} stroke="#f59e0b" strokeWidth="3" />
                <text x="270" y="133" fill="#b45309" fontSize="13" fontFamily="monospace" fontWeight="bold">
                  GC ──(GCT)──► CT ──(CTA)──► TA
                </text>
                <text x="270" y="152" fill="#d97706" fontSize="10">
                  Collapsed Repeat Node! (60x Depth = 2 Copies Merged)
                </text>

                <rect x="615" y="112" width="115" height="46" rx="8" fill={isDark ? '#0f172a' : '#ffffff'} stroke="#a855f7" strokeWidth="2.5" />
                <text x="632" y="135" fill="#7e22ce" fontSize="12" fontFamily="monospace" fontWeight="bold">TT → TA</text>
                <text x="632" y="150" fill="#64748b" fontSize="9.5">3&apos; End (30x)</text>
              </g>
            )}

            {/* Case: k = 5 (Resolved Linear Path) */}
            {kSize >= 5 && (
              <g>
                <line x1="140" y1="145" x2="215" y2="145" stroke="#10b981" strokeWidth="3.5" markerEnd="url(#arrow-emerald)" />
                <text x="150" y="136" fill="#059669" fontSize="9.5" fontFamily="monospace">GGCTA</text>

                <line x1="340" y1="145" x2="415" y2="145" stroke="#10b981" strokeWidth="3.5" markerEnd="url(#arrow-emerald)" />
                <text x="350" y="136" fill="#059669" fontSize="9.5" fontFamily="monospace">TACCG</text>

                <line x1="545" y1="145" x2="615" y2="145" stroke="#10b981" strokeWidth="3.5" markerEnd="url(#arrow-emerald)" />
                <text x="555" y="136" fill="#059669" fontSize="9.5" fontFamily="monospace">CTATT</text>

                <rect
                  x="20"
                  y="118"
                  width="120"
                  height="54"
                  rx="8"
                  fill={isDark ? '#0f172a' : '#ffffff'}
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
                <text x="32" y="140" fill="#059669" fontSize="11.5" fontFamily="monospace" fontWeight="bold">ATGG → GCTA</text>
                <text x="32" y="156" fill="#d97706" fontSize="9.5">Repeat Copy #1 (30x)</text>

                <rect
                  x="220"
                  y="118"
                  width="120"
                  height="54"
                  rx="8"
                  fill={isDark ? '#0f172a' : '#ffffff'}
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
                <text x="232" y="140" fill="#059669" fontSize="11.5" fontFamily="monospace" fontWeight="bold">CTAC → ACCG</text>
                <text x="232" y="156" fill="#64748b" fontSize="9.5">Unique Bridge (30x)</text>

                <rect
                  x="420"
                  y="118"
                  width="125"
                  height="54"
                  rx="8"
                  fill={isDark ? '#0f172a' : '#ffffff'}
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
                <text x="432" y="140" fill="#059669" fontSize="11.5" fontFamily="monospace" fontWeight="bold">CCGC → GCTA</text>
                <text x="432" y="156" fill="#d97706" fontSize="9.5">Repeat Copy #2 (30x)</text>

                <rect
                  x="620"
                  y="118"
                  width="120"
                  height="54"
                  rx="8"
                  fill={isDark ? '#0f172a' : '#ffffff'}
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
                <text x="632" y="140" fill="#059669" fontSize="11.5" fontFamily="monospace" fontWeight="bold">TATT → ATTA</text>
                <text x="632" y="156" fill="#64748b" fontSize="9.5">3&apos; Terminus (30x)</text>
              </g>
            )}

            {/* Error Overlay */}
            {hasError && (
              <g opacity={cleaned ? 0.2 : 1}>
                <path d="M 280 118 Q 360 30, 465 118" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5,3" markerEnd="url(#arrow-rose)" />
                <rect x="300" y="20" width="165" height="42" rx="6" fill={isDark ? '#4c0519' : '#ffe4e6'} stroke="#f43f5e" strokeWidth="2" />
                <text x="312" y="39" fill="#e11d48" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  SNP Bubble: T(A→G)CCG
                </text>
                <text x="312" y="53" fill="#be123c" fontSize="9.5">
                  {cleaned ? 'Popped (1x depth)!' : '1x depth false detour'}
                </text>

                <line x1="530" y1="172" x2="605" y2="230" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4,3" markerEnd="url(#arrow)" />
                <rect x="605" y="210" width="135" height="40" rx="6" fill={isDark ? '#451a03' : '#fef3c7'} stroke="#f59e0b" strokeWidth="2" />
                <text x="615" y="228" fill="#b45309" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  3&apos; Tip: GCTAT(G)
                </text>
                <text x="615" y="242" fill="#d97706" fontSize="9.5">
                  {cleaned ? 'Clipped dead-end!' : '1x dead-end branch'}
                </text>
              </g>
            )}
          </svg>
        </div>
      )}

      {/* Real-World SPAdes Multi-k Note */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3.5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-white">How SPAdes solves this k-mer trade-off in practice:</strong> Rather than forcing you to guess one <code className="text-emerald-700 dark:text-emerald-300 font-mono">k</code>, <strong>SPAdes</strong> builds a <em>multi-k</em> De Bruijn graph—starting at <code className="text-emerald-700 dark:text-emerald-300 font-mono">k=21</code> (where long overlaps aren&apos;t required, bridging low-coverage dropouts) and iteratively feeding those contigs into <code className="text-emerald-700 dark:text-emerald-300 font-mono">k=33, 55, 77, 99, 127</code> to resolve repeats up to the 150 bp read length!
        </div>
      </div>
    </div>
  );
}
