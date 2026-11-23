import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const COLORS = {
  bajo: '#22c55e',
  medio: '#f59e0b',
  alto: '#ef4444',
}

export function severityIcon(gravedad, selected = false) {
  const color = COLORS[gravedad] || COLORS.medio

  return L.divIcon({
    className: `bache-pin${selected ? ' bache-pin--selected' : ''}`,
    html: `<span class="bache-pin__dot" style="background:${color}"></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -12],
  })
}

export const pickedIcon = L.divIcon({
  className: 'bache-pin bache-pin--picked',
  html: '<span class="bache-pin__dot"></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

export const userLocationIcon = L.divIcon({
  className: 'user-pin',
  html: '<span class="user-pin__ring"></span><span class="user-pin__dot"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -10],
})
