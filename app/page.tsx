export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', gap: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '500' }}>Jobyra</h1>
      <p style={{ color: '#888' }}>Trade CRM</p>
      <a href="/login" style={{ background: '#2AA198', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>
        Get started
      </a>
    </div>
  )
}