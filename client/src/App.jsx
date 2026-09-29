import { useCallback, useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Backpack, Check, ChevronDown, Clock3, Mail, MapPin, Plus, Search, ShieldCheck, Sparkles, X } from 'lucide-react';

const categories = ['All categories', 'Accessories', 'Books & Notes', 'Clothing', 'Electronics', 'ID & Cards', 'Personal items', 'Other'];
const initialForm = () => ({ type: 'lost', title: '', category: 'Electronics', description: '', location: '', date: new Date().toISOString().slice(0, 10), contactName: '', contactEmail: '' });
const prettyDate = (date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' });

export default function App() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ open: 0, reunited: 0, lost: 0, found: 0 });
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState(categories[0]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (type !== 'all') params.set('type', type);
      if (category !== categories[0]) params.set('category', category);
      const [boardResponse, statsResponse] = await Promise.all([fetch(`/api/items?${params}`), fetch('/api/items/stats')]);
      const board = await boardResponse.json();
      const totals = await statsResponse.json();
      if (!boardResponse.ok || !statsResponse.ok) throw new Error(board.message || totals.message || 'The API could not load the board.');
      setItems(board);
      setStats(totals);
      setMessage('');
    } catch (error) {
      setMessage(`${error.message} Is MongoDB running?`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [query, type, category]);

  useEffect(() => {
    const timer = setTimeout(loadBoard, 250);
    return () => clearTimeout(timer);
  }, [loadBoard]);

  const submitReport = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not publish this report.');
      setModal(false);
      setForm(initialForm());
      setMessage('Report published! It is now on the campus board.');
      await loadBoard();
    } catch (error) { setMessage(error.message); }
    finally { setSaving(false); }
  };

  const resolveReport = async (id) => {
    try {
      const response = await fetch(`/api/items/${id}/resolve`, { method: 'PATCH' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not update report.');
      setMessage('Great news — the report was marked reunited.');
      await loadBoard();
    } catch (error) { setMessage(error.message); }
  };

  const openForm = (reportType = 'lost') => { setForm({ ...initialForm(), type: reportType }); setModal(true); };

  return <div className="page" id="top">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-icon"><Backpack size={20} /></span><span><b>Integral University</b><small>Campus lost & found · Lucknow</small></span></a><nav><a href="#board">Browse board</a><a href="#steps">How it works</a><button className="btn btn-primary" onClick={() => openForm()}><Plus size={17}/> Post a report</button></nav></header>
    <main>
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><i/> INTEGRAL CAMPUS COMMUNITY</div><h1>Find it.<br/><em>Bring it home.</em></h1><p>Lost something on campus, or found something that needs its person? A few details can help it find its way home.</p><div className="hero-actions"><button className="btn btn-primary btn-big" onClick={() => openForm('lost')}>I lost something <ArrowUpRight size={17}/></button><button className="btn btn-outline btn-big" onClick={() => openForm('found')}>I found something <ArrowDownRight size={17}/></button></div><div className="location"><MapPin size={15}/> Integral University · Lucknow, Uttar Pradesh</div></div><div className="hero-visual"><div className="sun"/><div className="notice"><span className="pin"/><small>INTEGRAL CAMPUS NOTICE</small><strong>Lost a little.<br/><em>Found a lot.</em></strong><hr/><span className="notice-foot">GOOD THINGS FIND THEIR WAY <Sparkles size={21}/></span></div><div className="float-note"><span>✳</span><div><b>Seen something?</b><small>Be someone’s good news.</small></div></div></div><span className="hero-index">01 / COMMUNITY</span></section>
      <section className="stats"><div className="stat-intro"><span>✳</span> A more thoughtful<br/>kind of campus.</div><div className="stat"><b>{stats.open}</b><small>open reports</small></div><div className="stat"><b>{stats.reunited}</b><small>items reunited</small></div><div className="stat"><b>{stats.found}</b><small>waiting to be claimed</small></div><div className="stat-note"><ShieldCheck size={18}/> Made for our campus,<br/><b>by our community.</b></div></section>
      <section className="board section" id="board"><div className="section-heading"><div><div className="eyebrow muted">THE COMMUNITY BOARD <span>✳</span></div><h2>Recently <em>reported</em></h2></div><button className="link-button" onClick={() => { setType('all'); setCategory(categories[0]); setQuery(''); }}>Reset filters <ArrowRight size={16}/></button></div>
        <div className="filters"><label className="search"><Search size={17}/><input aria-label="Search reports" placeholder="Search an item, place, or detail..." value={query} onChange={(event) => setQuery(event.target.value)}/>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15}/></button>}</label><div className="toggle">{[['all','Everything'],['lost','Lost'],['found','Found']].map(([key,label])=><button key={key} onClick={() => setType(key)} className={type === key ? 'chosen' : ''}>{label}</button>)}</div><label className="select"><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((option)=><option key={option}>{option}</option>)}</select><ChevronDown size={15}/></label></div>
        {message && <div className="notice-message" role="status">{message}<button onClick={loadBoard}>Retry</button></div>}
        <div className="cards">{loading ? <div className="empty">Loading campus reports…</div> : items.length ? items.map((item) => <article className="card" key={item._id}><div className="card-meta"><span className={`badge ${item.type}`}>{item.type === 'lost' ? '● Lost item' : '● Found item'}</span><span><Clock3 size={13}/> {prettyDate(item.date)}</span></div><div className={`item-art ${item.type}`}><span>{item.category === 'Books & Notes' ? '▤' : item.category === 'Electronics' ? '⌁' : item.category === 'ID & Cards' ? '▣' : '✳'}</span><small>{item.category}</small></div><h3>{item.title}</h3><p>{item.description}</p><div className="place"><MapPin size={14}/> {item.location}</div><div className="card-bottom"><span className="avatar">{item.contactName.charAt(0).toUpperCase()}</span><span className="reporter"><small>Reported by</small><b>{item.contactName}</b></span><a className="email" href={`mailto:${item.contactEmail}?subject=${encodeURIComponent(`About: ${item.title}`)}`} aria-label={`Email ${item.contactName}`}><Mail size={17}/></a></div><button className="resolve" onClick={() => resolveReport(item._id)}><Check size={14}/> Mark as reunited</button></article>) : <div className="empty"><span><Search size={21}/></span><b>No open reports match.</b><small>Try another search or post a new report.</small><button className="btn btn-primary" onClick={() => openForm()}>Post a report</button></div>}</div>
      </section>
      <section className="steps section" id="steps"><div className="center"><div className="eyebrow muted">A SMALL ACT, A BIG DIFFERENCE</div><h2>It starts with <em>one good turn.</em></h2><p>Three simple steps to help something find its way back.</p></div><div className="steps-grid"><article><span>01</span><i><Search size={19}/></i><h3>Check the board</h3><p>Search recent reports by item, location, or category.</p></article><article><span>02</span><i><Plus size={19}/></i><h3>Post what you know</h3><p>Lost it or found it? Add details so the right person can reach you.</p></article><article><span>03</span><i><Check size={19}/></i><h3>Make the connection</h3><p>Contact the reporter and mark the item reunited when it is home.</p></article></div></section>
      <section className="cta"><Sparkles size={35}/><div><small>YOUR CAMPUS. YOUR COMMUNITY.</small><h2>Found something?<br/><em>Be the reason it gets home.</em></h2></div><button className="btn btn-light" onClick={() => openForm('found')}>Share a found item <ArrowRight size={17}/></button></section>
    </main>
    <footer><a className="brand" href="#top"><span className="brand-icon"><Backpack size={18}/></span><span><b>Integral University</b><small>Lucknow, Uttar Pradesh</small></span></a><span>A little kindness goes a long way. ✳</span><small>CAMPUS LOST & FOUND · STUDENT PROJECT</small></footer>
    {modal && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title"><div className="modal-title"><div><div className="eyebrow">HELP IT FIND ITS WAY</div><h2 id="form-title">Post a <em>report</em></h2><p>A few details can make all the difference.</p></div><button className="close" onClick={() => setModal(false)} aria-label="Close"><X size={19}/></button></div><form onSubmit={submitReport}><div className="form-toggle"><button type="button" className={form.type === 'lost' ? 'active' : ''} onClick={() => setForm({...form,type:'lost'})}>I lost something</button><button type="button" className={form.type === 'found' ? 'active' : ''} onClick={() => setForm({...form,type:'found'})}>I found something</button></div><div className="form-grid"><label className="wide">Item name<input required maxLength="100" placeholder="e.g. Blue water bottle" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/></label><label>Category<select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>{categories.slice(1).map((c)=><option key={c}>{c}</option>)}</select></label><label>Date<input type="date" required max={new Date().toISOString().slice(0,10)} value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})}/></label><label className="wide">Campus location<input required placeholder="Building, room, or landmark" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})}/></label><label className="wide">Description<textarea required maxLength="700" rows="3" placeholder="Color, identifying details, or other helpful information" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/></label><label>Your name<input required value={form.contactName} onChange={(e)=>setForm({...form,contactName:e.target.value})}/></label><label>Email<input type="email" required value={form.contactEmail} onChange={(e)=>setForm({...form,contactEmail:e.target.value})}/></label></div><p className="privacy"><ShieldCheck size={15}/> Demo project: use sample contact details, not private personal information.</p><button className="btn btn-primary publish" disabled={saving}>{saving ? 'Publishing…' : 'Publish to campus board'} <ArrowRight size={17}/></button></form></section></div>}
  </div>;
}
