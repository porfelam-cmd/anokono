import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { PREF_NAMES, STATE_COLORS, TOPO_URL } from '../constants/prefectures'

export default function JapanMap({ states, onPrefClick, zoomScale = 1 }) {
  const svgRef = useRef(null)
  const onClickRef = useRef(onPrefClick)

  useEffect(() => { onClickRef.current = onPrefClick }, [onPrefClick])

  // 初期描画（マウント時のみ）
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)

    d3.json(TOPO_URL).then(topo => {
      const obj = topo.objects.japan || Object.values(topo.objects)[0]
      const features = topojson.feature(topo, obj).features

      svg.select('#map-g').remove()
      const g = svg.append('g').attr('id', 'map-g')

      const proj = d3.geoMercator()
        .fitExtent([[8, 8], [382, 592]], { type: 'FeatureCollection', features })
      const path = d3.geoPath().projection(proj)

      g.selectAll('path')
        .data(features)
        .join('path')
        .attr('class', 'pref-path')
        .attr('data-id', d => d.id || d.properties.id)
        .attr('d', path)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('paint-order', 'stroke fill')
        .attr('fill', d => {
          const id = +(d.id || d.properties.id)
          return STATE_COLORS[states[id] || 'unvisited']
        })
        .style('cursor', 'pointer')
        .on('click', function (_, d) {
          const id = +(d.id || d.properties.id)
          const name = d.properties.nam_ja || PREF_NAMES[id] || `${id}番`
          onClickRef.current(id, name)
        })
    }).catch(() => {
      svg.append('text')
        .attr('x', 195).attr('y', 300)
        .attr('font-size', 12).attr('fill', '#888').attr('text-anchor', 'middle')
        .text('地図を読み込めませんでした（ネット接続が必要です）')
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 色の更新
  useEffect(() => {
    if (!svgRef.current) return
    d3.select(svgRef.current).selectAll('.pref-path')
      .attr('fill', function () {
        const id = +d3.select(this).attr('data-id')
        return STATE_COLORS[states[id] || 'unvisited']
      })
  }, [states])

  // ズーム時の線幅調整
  useEffect(() => {
    if (!svgRef.current) return
    d3.select(svgRef.current).selectAll('.pref-path')
      .attr('stroke-width', Math.max(0.4, 2 / zoomScale))
  }, [zoomScale])

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 390 600"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
