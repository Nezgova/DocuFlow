import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Logo() {
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem('docuflow_logo_url') || '/docuflow_logo.png')
  const [companyName, setCompanyName] = useState(localStorage.getItem('docuflow_company_name') || 'DocuFlow')

  useEffect(() => {
    api.get('/settings').then(r => {
      if (r.data) {
        if (r.data.logoUrl) {
          setLogoUrl(r.data.logoUrl)
          localStorage.setItem('docuflow_logo_url', r.data.logoUrl)
        }
        if (r.data.companyName) {
          setCompanyName(r.data.companyName)
          localStorage.setItem('docuflow_company_name', r.data.companyName)
        }
      }
    }).catch(() => {})
  }, [])

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/10 overflow-hidden shrink-0">
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="h-full w-full object-contain" 
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.parentElement && !e.target.parentElement.querySelector('span')) {
              e.target.parentElement.className = 'grid h-9 w-9 place-items-center rounded-xl bg-moss text-sm font-extrabold text-white shadow-lg shadow-moss/25 overflow-hidden';
              const fallback = document.createElement('span');
              fallback.innerText = 'D';
              e.target.parentElement.appendChild(fallback);
            }
          }}
        />
      </div>
      <span className="text-lg font-extrabold tracking-tight text-ink">{companyName}</span>
    </div>
  )
}
