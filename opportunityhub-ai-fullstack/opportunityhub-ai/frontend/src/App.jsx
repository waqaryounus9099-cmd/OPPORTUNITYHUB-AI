import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Rocket, LayoutDashboard, BriefcaseBusiness, GraduationCap, Sparkles, FileText,
  MessagesSquare, ClipboardList, Bell, Bookmark, UserRound, Settings, Sun, Moon,
  Search, Menu, X, LogOut, ChevronDown, ArrowUpRight, MapPin, Clock, SlidersHorizontal,
  ExternalLink, Plus, Send, CheckCircle2, AlertCircle, TrendingUp, Globe2, ShieldCheck,
  Trash2, Eye, Briefcase, CalendarDays, Bot, CircleHelp, Crown, Filter, RefreshCw
} from "lucide-react";
import { api, setSession, clearSession, getToken, getUser } from "./api.js";

const AuthContext = createContext(null);
const ThemeContext = createContext(null);
const useAuth = () => useContext(AuthContext);
const useTheme = () => useContext(ThemeContext);

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(localStorage.getItem("oh_theme") || "light");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("oh_theme", theme);
  }, [theme]);
  return <ThemeContext.Provider value={{theme,setTheme}}>{children}</ThemeContext.Provider>;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(Boolean(getToken()));
  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api("/me").then(data => { setUser(data); localStorage.setItem("oh_user", JSON.stringify(data)); })
      .catch(() => { clearSession(); setUser(null); }).finally(() => setLoading(false));
  }, []);
  const login = async (email,password) => {
    const data = await api("/auth/login",{method:"POST",body:JSON.stringify({email,password})});
    setSession(data.token,data.user); setUser(data.user);
  };
  const register = async (name,email,password) => {
    const data = await api("/auth/register",{method:"POST",body:JSON.stringify({name,email,password})});
    setSession(data.token,data.user); setUser(data.user);
  };
  const logout = () => { clearSession(); setUser(null); };
  return <AuthContext.Provider value={{user,setUser,loading,login,register,logout}}>{children}</AuthContext.Provider>;
}

const navGroups = [
  { label:"DISCOVER", items:[
    ["Dashboard","/dashboard",LayoutDashboard],["Find Jobs","/jobs",BriefcaseBusiness],
    ["Scholarships","/scholarships",GraduationCap],["Explore","/explore",Globe2]
  ]},
  { label:"AI CAREER TOOLS", items:[
    ["AI Assistant","/ai-assistant",Sparkles],["CV & Resume Builder","/resume-builder",FileText],
    ["Scholarship Essay","/essay-assistant",GraduationCap],["Interview Prep","/interview-prep",MessagesSquare]
  ]},
  { label:"MY ACTIVITY", items:[
    ["Saved Opportunities","/saved",Bookmark],["My Applications","/applications",ClipboardList],
    ["Alerts & Notifications","/alerts",Bell]
  ]},
  { label:"ACCOUNT", items:[["My Profile","/profile",UserRound],["Settings","/settings",Settings],["Upgrade to Pro","/pricing",Crown]]}
];

function Shell({ children }) {
  const [mobileOpen,setMobileOpen] = useState(false);
  const [search,setSearch] = useState("");
  const {user,logout} = useAuth();
  const {theme,setTheme} = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const title = navGroups.flatMap(g=>g.items).find(x=>x[1]===location.pathname)?.[0] || "OpportunityHub AI";
  const doSearch = e => { e.preventDefault(); navigate(`/explore?q=${encodeURIComponent(search)}`); };
  return <div className="app-shell">
    {mobileOpen && <button className="mobile-backdrop" onClick={()=>setMobileOpen(false)} aria-label="Close menu"/>}
    <aside className={`sidebar ${mobileOpen?"sidebar-open":""}`}>
      <div className="brand"><div className="brand-mark"><Rocket size={21}/></div><div><strong>OpportunityHub <span>AI</span></strong><small>Find · Apply · Grow</small></div><button className="mobile-close" onClick={()=>setMobileOpen(false)}><X/></button></div>
      <nav className="side-nav">
        {navGroups.map(group=><div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(([label,path,Icon])=><NavLink key={path} to={path} onClick={()=>setMobileOpen(false)} className={({isActive})=>`nav-link ${isActive?"active":""}`}><Icon size={18}/><span>{label}</span>{label==="Alerts & Notifications"&&<i className="nav-dot"/>}</NavLink>)}</div>)}
      </nav>
      <div className="pro-card"><div className="pro-icon"><Crown size={21}/></div><strong>Unlock your potential</strong><p>Get more AI guidance and advanced career tools.</p><button onClick={()=>navigate("/pricing")}>Explore Pro <ArrowUpRight size={15}/></button></div>
      <div className="sidebar-user"><div className="avatar">{(user?.name||"U").slice(0,1).toUpperCase()}</div><div className="user-meta"><strong>{user?.name||"Guest"}</strong><small>{user?.plan||"FREE"} plan</small></div><button className="icon-button" onClick={logout} title="Sign out"><LogOut size={17}/></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={()=>setMobileOpen(true)}><Menu/></button>
        <div className="top-title">{title}</div>
        <form className="top-search" onSubmit={doSearch}><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs, scholarships, skills..."/><kbd>Enter</kbd></form>
        <button className="icon-button theme-toggle" onClick={()=>setTheme(theme==="light"?"dark":"light")} title="Toggle theme">{theme==="light"?<Moon size={19}/>:<Sun size={19}/>}</button>
        <button className="notification-button" onClick={()=>navigate("/alerts")}><Bell size={19}/><i/></button>
        <button className="profile-chip" onClick={()=>navigate("/profile")}><div className="avatar small">{(user?.name||"U").slice(0,1).toUpperCase()}</div><ChevronDown size={15}/></button>
      </header>
      <div className="page-content">{children}</div>
      <footer className="footer">© {new Date().getFullYear()} OpportunityHub AI <span>Discover opportunities. Build your future.</span></footer>
    </main>
  </div>;
}

function PageHeading({eyebrow,title,subtitle,action}) {
  return <div className="page-heading"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>;
}
function StatCard({icon:Icon,label,value,detail,tone="blue"}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={21}/></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}
function Badge({children,tone="gray"}) { return <span className={`badge ${tone}`}>{children}</span>; }
function formatDate(value) { if(!value)return "Not specified"; const d=new Date(value); return Number.isNaN(d.getTime())?"Not specified":d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); }
function matchScore(item) {
  const words=(item.tags||[]).length;
  return Math.min(97,76+words*3);
}
function OpportunityCard({item,onSave,onApply,saved=false}) {
  const scholarship=item.type==="SCHOLARSHIP";
  return <article className="opportunity-card">
    <div className="org-avatar">{scholarship?<GraduationCap size={23}/>:<BriefcaseBusiness size={23}/>}</div>
    <div className="opportunity-main">
      <div className="card-title-row"><h3>{item.title}</h3><Badge tone={item.verificationStatus==="VERIFIED"?"green":"amber"}>{item.verificationStatus==="VERIFIED"?"Verified":"Unverified"}</Badge></div>
      <div className="org-name">{item.organization}</div>
      <div className="meta-row"><span><MapPin size={14}/>{item.country||"Location not specified"}</span><span><Clock size={14}/>{item.publishedAt?formatDate(item.publishedAt):"Date unavailable"}</span><span><CalendarDays size={14}/>Deadline: {formatDate(item.deadline)}</span></div>
      <div className="tag-row">{(item.tags||[]).slice(0,4).map(t=><Badge key={t}>{t}</Badge>)}{item.isDemo&&<Badge tone="amber">Demo listing</Badge>}</div>
    </div>
    <div className="opportunity-actions"><div className="match-label"><strong>{matchScore(item)}%</strong><span>Profile fit*</span></div><button className="btn btn-primary btn-sm" onClick={()=>onApply(item)}>Track / Apply</button><button className="btn btn-ghost btn-sm" onClick={()=>window.location.assign(`/opportunities/${item.id}`)}><Eye size={14}/> Details</button><button className={`btn btn-ghost btn-sm ${saved?"saved":""}`} onClick={()=>onSave(item)}><Bookmark size={15}/>{saved?"Saved":"Save"}</button></div>
    <small className="card-disclaimer">*Illustrative keyword-based fit, not a hiring or admission prediction.</small>
  </article>;
}

function Dashboard() {
  const [items,setItems]=useState([]);
  const [apps,setApps]=useState([]);
  const [notifications,setNotifications]=useState([]);
  const [error,setError]=useState("");
  const navigate=useNavigate();
  useEffect(()=>{Promise.all([api("/opportunities?limit=6"),api("/applications"),api("/me/notifications")]).then(([o,a,n])=>{setItems(o.items);setApps(a);setNotifications(n);}).catch(e=>setError(e.message));},[]);
  const jobs=items.filter(x=>x.type==="JOB");
  const scholarships=items.filter(x=>x.type==="SCHOLARSHIP");
  const addApplication=async item=>{try{await api("/applications",{method:"POST",body:JSON.stringify({opportunityId:item.id})});setApps(await api("/applications"));}catch(e){setError(e.message);}};
  const save=async item=>{try{await api(`/opportunities/${item.id}/save`,{method:"POST"});}catch(e){setError(e.message);}};
  return <>
    <section className="hero-panel"><div className="hero-content"><div className="eyebrow light">YOUR NEXT CHAPTER STARTS HERE</div><h1>Find opportunities.<br/><span>Shape your future.</span></h1><p>Discover worldwide jobs and scholarships, with AI-powered guidance at every step.</p><div className="hero-actions"><button className="btn btn-white" onClick={()=>navigate("/explore")}>Explore opportunities <ArrowUpRight size={16}/></button><button className="btn btn-outline-light" onClick={()=>navigate("/profile")}>Complete profile</button></div></div><div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-globe"><Globe2 size={112}/></div><div className="float-card"><Sparkles size={17}/> AI-powered matching</div></div></section>
    {error&&<div className="alert alert-error"><AlertCircle size={17}/>{error}</div>}
    <div className="stats-grid"><StatCard icon={BriefcaseBusiness} label="Available jobs" value={items.filter(x=>x.type==="JOB").length} detail="In this sample view" tone="blue"/><StatCard icon={GraduationCap} label="Scholarships" value={items.filter(x=>x.type==="SCHOLARSHIP").length} detail="In this sample view" tone="purple"/><StatCard icon={ClipboardList} label="Applications" value={apps.length} detail="Your tracked applications" tone="green"/><StatCard icon={Bell} label="Notifications" value={notifications.filter(n=>!n.readAt).length} detail="Unread messages" tone="orange"/></div>
    <div className="section-head"><div><div className="eyebrow">DISCOVER</div><h2>Recommended opportunities</h2><p>Explore sample listings while your profile matching is being configured.</p></div><button className="text-button" onClick={()=>navigate("/explore")}>View all <ArrowUpRight size={15}/></button></div>
    <div className="content-grid"><section className="main-column"><div className="mini-section-head"><h3><BriefcaseBusiness size={18}/> Jobs for you</h3><button className="text-button" onClick={()=>navigate("/jobs")}>See jobs</button></div>{jobs.slice(0,3).map(item=><OpportunityCard key={item.id} item={item} onSave={save} onApply={addApplication}/>)}
    <div className="mini-section-head top-gap"><h3><GraduationCap size={18}/> Scholarship opportunities</h3><button className="text-button" onClick={()=>navigate("/scholarships")}>See scholarships</button></div>{scholarships.slice(0,3).map(item=><OpportunityCard key={item.id} item={item} onSave={save} onApply={addApplication}/>)}</section>
    <aside className="right-column"><div className="ai-promo"><div className="ai-promo-icon"><Sparkles/></div><h3>Your AI career companion</h3><p>Get help improving your CV, preparing scholarship essays and practicing interviews.</p><button className="btn btn-primary btn-block" onClick={()=>navigate("/ai-assistant")}>Open AI assistant <ArrowUpRight size={15}/></button></div><div className="panel"><div className="panel-title"><h3>Application progress</h3><ClipboardList size={18}/></div><div className="progress-number">{apps.length}<small> tracked</small></div><p className="muted">Keep your applications organized in one place.</p><button className="btn btn-secondary btn-block" onClick={()=>navigate("/applications")}>View tracker</button></div><div className="panel"><div className="panel-title"><h3>Quick actions</h3><Sparkles size={18}/></div><button className="quick-action" onClick={()=>navigate("/resume-builder")}><FileText/> Build a resume <ArrowUpRight/></button><button className="quick-action" onClick={()=>navigate("/alerts")}><Bell/> Create an alert <ArrowUpRight/></button><button className="quick-action" onClick={()=>navigate("/interview-prep")}><MessagesSquare/> Practice interview <ArrowUpRight/></button></div></aside></div>
  </>;
}

function OpportunityList({type}) {
  const [items,setItems]=useState([]),[q,setQ]=useState(""),[country,setCountry]=useState(""),[sort,setSort]=useState("newest"),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const [saved,setSaved]=useState([]);
  const navigate=useNavigate();
  const load=()=>{setLoading(true);const typeParam=type==="ALL"?"":`&type=${type}`;api(`/opportunities?${typeParam.replace(/^&/,"")}${typeParam?"&":""}q=${encodeURIComponent(q)}&country=${encodeURIComponent(country)}&sort=${sort}`).then(d=>setItems(d.items)).catch(e=>setError(e.message)).finally(()=>setLoading(false));};
  useEffect(()=>{load();},[type]);
  const save=async item=>{try{await api(`/opportunities/${item.id}/save`,{method:"POST"});setSaved(s=>[...s,item.id]);}catch(e){setError(e.message);}};
  const apply=async item=>{try{await api("/applications",{method:"POST",body:JSON.stringify({opportunityId:item.id})});window.alert("Added to your application tracker. Open My Applications to update its status.");}catch(e){setError(e.message);}};
  const isJob=type==="JOB";
  return <><PageHeading eyebrow="OPPORTUNITY DISCOVERY" title={isJob?"Find your next job":"Find your scholarship"} subtitle={isJob?"Explore roles from around the world and discover your next career move.":"Explore funding opportunities for your education and research."} action={<Badge tone="blue"><Globe2 size={13}/> Worldwide</Badge>}/>
    <div className="filter-panel"><div className="search-field"><Search/><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} placeholder={isJob?"Job title, company or skill":"Scholarship, university or field"}/></div><div className="search-field country-field"><MapPin/><input value={country} onChange={e=>setCountry(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} placeholder="Country"/></div><select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="deadline">Closing soon</option></select><button className="btn btn-primary" onClick={load}><SlidersHorizontal size={16}/> Search</button></div>
    {error&&<div className="alert alert-error">{error}</div>}<div className="results-line"><span>{items.length} results in current page</span><span><ShieldCheck size={15}/> Check official sources before applying</span></div>
    {loading?<div className="loading">Loading opportunities…</div>:items.length?items.map(item=><OpportunityCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={save} onApply={apply}/>):<EmptyState title="No opportunities found" text="Try another keyword or clear the country filter."/>}
  </>;
}
function Explore() { return <OpportunityList type="ALL"/>; }

function EmptyState({title,text}) { return <div className="empty-state"><div><Search size={25}/></div><h3>{title}</h3><p>{text}</p></div>; }


function OpportunityDetails() {
  const { id } = useParams();
  const [item,setItem] = useState(null);
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(()=>{api(`/opportunities/${id}`).then(setItem).catch(e=>setError(e.message));},[id]);
  const track = async () => {
    if (!item) return;
    setBusy(true);
    try {
      await api("/applications",{method:"POST",body:JSON.stringify({opportunityId:item.id})});
      navigate("/applications");
    } catch(e) { setError(e.message); }
    finally { setBusy(false); }
  };
  if (error) return <><PageHeading title="Opportunity details"/><div className="alert alert-error">{error}</div></>;
  if (!item) return <div className="loading">Loading opportunity details…</div>;
  return <>
    <button className="text-button back-link" onClick={()=>navigate(-1)}>← Back to opportunities</button>
    <div className="detail-hero panel">
      <div className="org-avatar large">{item.type==="JOB"?<BriefcaseBusiness size={27}/>:<GraduationCap size={27}/>}</div>
      <div className="detail-title"><Badge tone={item.verificationStatus==="VERIFIED"?"green":"amber"}>{item.verificationStatus==="VERIFIED"?"Verified":"Unverified source"}</Badge><h1>{item.title}</h1><p>{item.organization} · {item.country||"Location not specified"}</p></div>
      <button className="btn btn-primary" onClick={track} disabled={busy}>{busy?"Adding…":"Add to applications"} <ArrowUpRight size={15}/></button>
    </div>
    {item.isDemo&&<div className="info-note"><AlertCircle size={17}/> This is illustrative demo content, not a real opportunity. Do not submit personal information through its example link.</div>}
    <div className="detail-grid">
      <div className="panel detail-description"><h2>Opportunity overview</h2><p>{item.description}</p><h3>{item.type==="JOB"?"Role information":"Scholarship information"}</h3><div className="detail-facts"><div><small>Opportunity type</small><strong>{item.type}</strong></div><div><small>Location</small><strong>{item.country||"Not specified"}</strong></div><div><small>Published</small><strong>{formatDate(item.publishedAt)}</strong></div><div><small>Deadline</small><strong>{formatDate(item.deadline)}</strong></div>{item.degreeLevel&&<div><small>Degree level</small><strong>{item.degreeLevel}</strong></div>}{item.fundingType&&<div><small>Funding</small><strong>{item.fundingType.replaceAll("_"," ")}</strong></div>}</div><h3>Skills / categories</h3><div className="tag-row">{(item.tags||[]).map(t=><Badge key={t}>{t}</Badge>)}</div></div>
      <aside className="panel source-panel"><h3>Source and application</h3><p>Always review the original listing and confirm that the opportunity is still open before applying.</p><div className="source-meta"><small>Source</small><strong>{item.sourceName}</strong></div><a className="btn btn-primary btn-block" href={item.applicationUrl} target="_blank" rel="noreferrer">Open application source <ExternalLink size={15}/></a><a className="source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">View original listing</a><div className="source-meta"><small>Last checked</small><strong>{formatDate(item.lastCheckedAt)}</strong></div></aside>
    </div>
  </>;
}

function Applications() {
  const [items,setItems]=useState([]),[error,setError]=useState("");
  const load=()=>api("/applications").then(setItems).catch(e=>setError(e.message));
  useEffect(()=>{load();},[]);
  const update=async(id,status)=>{try{await api(`/applications/${id}`,{method:"PATCH",body:JSON.stringify({status})});load();}catch(e){setError(e.message);}};
  const statuses=["INTERESTED","PREPARING","APPLIED","ASSESSMENT","INTERVIEW","SHORTLISTED","ACCEPTED","REJECTED"];
  return <><PageHeading eyebrow="YOUR CAREER WORKSPACE" title="My applications" subtitle="Keep every opportunity organized, from first interest to final decision."/><div className="stats-grid compact"><StatCard icon={ClipboardList} label="Total tracked" value={items.length} detail="All opportunities" tone="blue"/><StatCard icon={Clock} label="In progress" value={items.filter(x=>!["ACCEPTED","REJECTED"].includes(x.status)).length} detail="Active applications" tone="purple"/></div>{error&&<div className="alert alert-error">{error}</div>}<div className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Opportunity</th><th>Organization</th><th>Status</th><th>Deadline</th></tr></thead><tbody>{items.map(a=><tr key={a.id}><td><strong>{a.opportunity.title}</strong><small>{a.opportunity.type}</small></td><td>{a.opportunity.organization}</td><td><select className="status-select" value={a.status} onChange={e=>update(a.id,e.target.value)}>{statuses.map(s=><option key={s} value={s}>{s.replaceAll("_"," ")}</option>)}</select></td><td>{formatDate(a.opportunity.deadline)}</td></tr>)}</tbody></table></div>{!items.length&&<EmptyState title="No applications yet" text="Save an opportunity to your tracker using the Track / Apply button."/>}</div></>;
}

function Saved() {
  const [items,setItems]=useState([]),[error,setError]=useState("");
  useEffect(()=>{api("/me/saved").then(setItems).catch(e=>setError(e.message));},[]);
  return <><PageHeading title="Saved opportunities" subtitle="Your shortlist of opportunities to revisit."/><div className="stack-list">{items.map(s=><OpportunityCard key={s.id} item={s.opportunity} saved onSave={()=>{}} onApply={async item=>api("/applications",{method:"POST",body:JSON.stringify({opportunityId:item.id})})}/>)}</div>{error&&<div className="alert alert-error">{error}</div>}{!items.length&&!error&&<EmptyState title="Nothing saved yet" text="Save jobs and scholarships to build your shortlist."/>}</>;
}

function Alerts() {
  const [items,setItems]=useState([]),[name,setName]=useState("My opportunity alert"),[keywords,setKeywords]=useState(""),[type,setType]=useState("ALL"),[country,setCountry]=useState(""),[error,setError]=useState("");
  const load=()=>api("/alerts").then(setItems).catch(e=>setError(e.message));
  useEffect(()=>{load();},[]);
  const create=async e=>{e.preventDefault();try{await api("/alerts",{method:"POST",body:JSON.stringify({name,keywords,type,country,minMatch:70,frequency:"DAILY",emailEnabled:true,browserEnabled:false})});setKeywords("");load();}catch(e){setError(e.message);}};
  const remove=async id=>{await api(`/alerts/${id}`,{method:"DELETE"});load();};
  return <><PageHeading title="Alerts & notifications" subtitle="Create saved searches and manage how you want to hear about new matches."/><div className="two-col"><form className="panel form-panel" onSubmit={create}><h3><Plus size={18}/> Create an alert</h3><label>Alert name<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>Keywords<input value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder="e.g. product design, data science"/></label><label>Opportunity type<select value={type} onChange={e=>setType(e.target.value)}><option value="ALL">Jobs and scholarships</option><option value="JOB">Jobs only</option><option value="SCHOLARSHIP">Scholarships only</option></select></label><label>Country<input value={country} onChange={e=>setCountry(e.target.value)} placeholder="Any country"/></label><button className="btn btn-primary">Save alert</button></form><div className="panel"><h3>Your alerts</h3>{items.map(a=><div className="alert-row" key={a.id}><div><strong>{a.name}</strong><p>{a.keywords||"All keywords"} · {a.type} · {a.country||"Worldwide"}</p><Badge tone={a.active?"green":"gray"}>{a.active?"Active":"Paused"}</Badge></div><button className="icon-button danger-text" onClick={()=>remove(a.id)}><Trash2 size={17}/></button></div>)}{!items.length&&<p className="muted">No alerts created yet.</p>}</div></div>{error&&<div className="alert alert-error">{error}</div>}<div className="info-note"><Bell size={17}/> Alert rules are saved in your account. Automated email and browser delivery must be configured on the server before notifications are sent.</div></>;
}

function AIWorkspace({mode="chat"}) {
  const [message,setMessage]=useState(""),[reply,setReply]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const [resume,setResume]=useState(""),[role,setRole]=useState(""),[prompt,setPrompt]=useState(""),[background,setBackground]=useState("");
  const send=async e=>{e.preventDefault();setBusy(true);setError("");setReply("");try{let data;if(mode==="chat")data=await api("/ai/chat",{method:"POST",body:JSON.stringify({message})});else if(mode==="resume")data=await api("/ai/resume-review",{method:"POST",body:JSON.stringify({resumeText:resume,targetRole:role})});else data=await api("/ai/essay-outline",{method:"POST",body:JSON.stringify({prompt,background,wordLimit:800})});setReply(data.reply);}catch(e){setError(e.message);}finally{setBusy(false);}};
  const chat=mode==="chat";
  return <><PageHeading eyebrow="AI CAREER TOOLS" title={chat?"AI career assistant":mode==="resume"?"CV & resume builder":"Scholarship essay assistant"} subtitle={chat?"Ask for help with career planning, job applications and scholarship research.":mode==="resume"?"Get structured feedback on your resume and improve it with truthful, role-specific suggestions.":"Develop a strong essay outline using your real experiences and goals."}/><div className="ai-layout"><div className="panel ai-main"><div className="ai-heading"><div className="ai-avatar"><Sparkles/></div><div><strong>OpportunityHub AI</strong><small> {import.meta.env.VITE_AI_LABEL||"AI provider configured on server"}</small></div><Badge tone="green">Ready</Badge></div>{chat?<><div className="chat-intro"><h2>How can I help you today?</h2><p>Get practical, honest guidance for your next opportunity.</p><div className="prompt-chips">{["Improve my CV for entry-level roles","How do I prepare a scholarship application?","Give me common interview questions"].map(p=><button key={p} onClick={()=>setMessage(p)}>{p}</button>)}</div></div><form onSubmit={send} className="chat-form"><textarea required minLength={2} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Ask OpportunityHub AI anything…"/><button className="btn btn-primary" disabled={busy}><Send size={16}/>{busy?"Thinking…":"Send"}</button></form></>:mode==="resume"?<form className="form-panel" onSubmit={send}><label>Target role<input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Junior Data Analyst"/></label><label>Paste your resume text<textarea required minLength={30} rows={9} value={resume} onChange={e=>setResume(e.target.value)} placeholder="Paste your current CV or resume text here…"/></label><button className="btn btn-primary" disabled={busy}>{busy?"Reviewing…":"Review my resume"}</button></form>:<form className="form-panel" onSubmit={send}><label>Essay question<textarea required minLength={10} rows={3} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Why do you want to study this program?"/></label><label>Your real background and experiences<textarea required minLength={10} rows={6} value={background} onChange={e=>setBackground(e.target.value)} placeholder="Share your education, goals, experiences and motivations…"/></label><button className="btn btn-primary" disabled={busy}>{busy?"Preparing…":"Create essay outline"}</button></form>}{error&&<div className="alert alert-error">{error}</div>}{reply&&<div className="ai-reply"><div className="reply-title"><Sparkles size={17}/> AI guidance</div><p>{reply}</p><button className="btn btn-secondary btn-sm" onClick={()=>navigator.clipboard?.writeText(reply)}>Copy response</button></div>}</div><aside className="panel ai-side"><h3><ShieldCheck size={18}/> Use AI responsibly</h3><p>AI suggestions are starting points, not official advice or guarantees.</p><ul><li>Use your real experience and achievements.</li><li>Verify every requirement on the official source.</li><li>Review and edit generated content before applying.</li><li>Do not share passwords or sensitive identity data.</li></ul></aside></div></>;
}

function InterviewPrep() {
  const questions=["Tell me about yourself and the experience most relevant to this role.","Describe a challenging problem you solved. What did you learn?","Why are you interested in this organization and position?","Tell me about a time you worked with a team under pressure.","What skill are you currently working to improve?"];
  const [role,setRole]=useState("");const [index,setIndex]=useState(0);const [answer,setAnswer]=useState("");
  return <><PageHeading title="AI interview preparation" subtitle="Practice structured answers and build confidence before your next interview."/><div className="interview-grid"><div className="panel interview-card"><div className="eyebrow">PRACTICE SESSION · QUESTION {index+1} OF {questions.length}</div><h2>{questions[index]}</h2><label>Target role<input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Product Designer"/></label><label>Your practice answer<textarea rows={7} value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Write your answer using a specific example…"/></label><div className="button-row"><button className="btn btn-secondary" onClick={()=>{setIndex((index+questions.length-1)%questions.length);setAnswer("");}}>Previous</button><button className="btn btn-primary" onClick={()=>{setIndex((index+1)%questions.length);setAnswer("");}}>Next question <ArrowUpRight size={15}/></button></div><div className="info-note">Practice questions are sample prompts. AI feedback integration can be enabled through the assistant service.</div></div><div className="panel"><h3>Answer framework</h3><div className="framework-step"><b>S</b><div><strong>Situation</strong><p>Set the context briefly.</p></div></div><div className="framework-step"><b>T</b><div><strong>Task</strong><p>Explain your responsibility.</p></div></div><div className="framework-step"><b>A</b><div><strong>Action</strong><p>Describe what you personally did.</p></div></div><div className="framework-step"><b>R</b><div><strong>Result</strong><p>Share the outcome and learning.</p></div></div></div></div></>;
}

function Profile() {
  const {user,setUser}=useAuth();const p=user?.profile||{};
  const [form,setForm]=useState({name:user?.name||"",country:p.country||"",headline:p.headline||"",educationLevel:p.educationLevel||"",degree:p.degree||"",fieldOfStudy:p.fieldOfStudy||"",gpa:p.gpa||"",experienceYears:p.experienceYears||0,skills:(p.skills||[]).join(", "),preferredCountries:(p.preferredCountries||[]).join(", "),interests:(p.interests||[]).join(", ")});
  const [message,setMessage]=useState("");
  const change=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=async e=>{e.preventDefault();try{const data=await api("/me/profile",{method:"PATCH",body:JSON.stringify({...form,experienceYears:Number(form.experienceYears),skills:form.skills.split(",").map(x=>x.trim()).filter(Boolean),preferredCountries:form.preferredCountries.split(",").map(x=>x.trim()).filter(Boolean),interests:form.interests.split(",").map(x=>x.trim()).filter(Boolean)})});setUser(data);localStorage.setItem("oh_user",JSON.stringify(data));setMessage("Profile saved successfully.");}catch(e){setMessage(e.message);}};
  return <><PageHeading title="My profile" subtitle="Keep your background and preferences up to date for more relevant recommendations."/><form className="panel form-panel profile-form" onSubmit={save}><h3>Personal information</h3><div className="form-grid"><label>Full name<input value={form.name} onChange={e=>change("name",e.target.value)}/></label><label>Country<input value={form.country} onChange={e=>change("country",e.target.value)}/></label><label className="span-two">Professional headline<input value={form.headline} onChange={e=>change("headline",e.target.value)} placeholder="e.g. Computer science graduate"/></label><label>Education level<input value={form.educationLevel} onChange={e=>change("educationLevel",e.target.value)}/></label><label>Degree<input value={form.degree} onChange={e=>change("degree",e.target.value)}/></label><label>Field of study<input value={form.fieldOfStudy} onChange={e=>change("fieldOfStudy",e.target.value)}/></label><label>GPA / grade<input value={form.gpa} onChange={e=>change("gpa",e.target.value)}/></label><label>Years of experience<input type="number" min="0" max="60" value={form.experienceYears} onChange={e=>change("experienceYears",e.target.value)}/></label><label className="span-two">Skills (comma separated)<input value={form.skills} onChange={e=>change("skills",e.target.value)}/></label><label className="span-two">Preferred countries (comma separated)<input value={form.preferredCountries} onChange={e=>change("preferredCountries",e.target.value)}/></label><label className="span-two">Career interests (comma separated)<input value={form.interests} onChange={e=>change("interests",e.target.value)}/></label></div><button className="btn btn-primary">Save profile</button>{message&&<div className="info-note">{message}</div>}</form></>;
}

function SettingsPage() {
  const {theme,setTheme}=useTheme();
  return <><PageHeading title="Settings" subtitle="Customize your OpportunityHub experience."/><div className="panel settings-row"><div><strong>Appearance</strong><p>Choose the theme that feels comfortable for you.</p></div><div className="segmented"><button className={theme==="light"?"selected":""} onClick={()=>setTheme("light")}><Sun size={16}/> Light</button><button className={theme==="dark"?"selected":""} onClick={()=>setTheme("dark")}><Moon size={16}/> Dark</button></div></div><div className="panel settings-row"><div><strong>Account security</strong><p>Use a unique password and keep your sign-in details private.</p></div><Badge tone="green">JWT session</Badge></div></>;
}

function Pricing() {
  return <><PageHeading eyebrow="SIMPLE, TRANSPARENT PLANS" title="Choose how you grow" subtitle="Start free. Upgrade when you need more personalized AI support."/><div className="pricing-grid"><div className="price-card"><Badge>START HERE</Badge><h2>Free</h2><div className="price">$0 <small>/ forever</small></div><p>Explore opportunities and organize your search.</p><ul><li>Worldwide opportunity discovery</li><li>Basic search and filters</li><li>Saved opportunities</li><li>Application tracker</li><li>Basic profile matching</li></ul><button className="btn btn-secondary btn-block">Current starter plan</button></div><div className="price-card featured"><Badge tone="purple">MORE AI POWER</Badge><h2>Pro</h2><div className="price">Coming soon</div><p>More support for ambitious applications.</p><ul><li>Expanded AI assistant usage</li><li>Advanced resume tools</li><li>Scholarship essay assistance</li><li>Interview coaching</li><li>Advanced matching and alerts</li></ul><button className="btn btn-primary btn-block" onClick={()=>window.alert("Pro billing will be connected after the MVP.")}>Join the waitlist</button></div></div></>;
}

function Admin() {
  const [data,setData]=useState(null),[items,setItems]=useState([]),[error,setError]=useState("");
  useEffect(()=>{Promise.all([api("/admin/overview"),api("/admin/opportunities")]).then(([d,i])=>{setData(d);setItems(i);}).catch(e=>setError(e.message));},[]);
  const verify=async(id,status)=>{try{await api(`/admin/opportunities/${id}/verification`,{method:"PATCH",body:JSON.stringify({status})});setItems(await api("/admin/opportunities"));}catch(e){setError(e.message);}};
  return <><PageHeading eyebrow="RESTRICTED WORKSPACE" title="Admin dashboard" subtitle="Monitor platform activity and review opportunity records." action={<Badge tone="purple"><ShieldCheck size={13}/> Administrator</Badge>}/>{error&&<div className="alert alert-error">{error}</div>}{data&&<div className="stats-grid"><StatCard icon={UserRound} label="Users" value={data.users} detail="Registered accounts"/><StatCard icon={BriefcaseBusiness} label="Jobs" value={data.jobs} detail="Opportunity records" tone="blue"/><StatCard icon={GraduationCap} label="Scholarships" value={data.scholarships} detail="Opportunity records" tone="purple"/><StatCard icon={ShieldCheck} label="Unverified" value={data.unverified} detail="Need review" tone="orange"/></div>}<div className="panel table-panel"><h3>Opportunity review queue</h3><div className="table-scroll"><table><thead><tr><th>Title</th><th>Source</th><th>Type</th><th>Verification</th><th>Action</th></tr></thead><tbody>{items.map(i=><tr key={i.id}><td><strong>{i.title}</strong><small>{i.organization}</small></td><td>{i.sourceName}</td><td>{i.type}</td><td>{i.verificationStatus}</td><td><select className="status-select" value={i.verificationStatus} onChange={e=>verify(i.id,e.target.value)}><option>UNVERIFIED</option><option>PENDING</option><option>VERIFIED</option><option>EXPIRED</option><option>REJECTED</option></select></td></tr>)}</tbody></table></div></div><div className="info-note"><AlertCircle size={17}/> Admin access is restricted by the API role. The seeded demo user is a normal user; promote a trusted account to ADMIN manually in the database for testing.</div></>;
}

function AuthPage({mode}) {
  const {login,register,user}=useAuth();const [name,setName]=useState("");const [email,setEmail]=useState("demo@opportunityhub.ai");const [password,setPassword]=useState("Opportunity123!");const [error,setError]=useState("");const [busy,setBusy]=useState(false);const navigate=useNavigate();
  useEffect(()=>{if(user)navigate("/dashboard");},[user]);
  const submit=async e=>{e.preventDefault();setBusy(true);setError("");try{if(mode==="login")await login(email,password);else await register(name,email,password);navigate("/dashboard");}catch(e){setError(e.message);}finally{setBusy(false);}};
  return <div className="auth-screen"><div className="auth-brand"><div className="brand-mark"><Rocket/></div><strong>OpportunityHub <span>AI</span></strong></div><form className="auth-card" onSubmit={submit}><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h1>{mode==="login"?"Welcome back":"Create your account"}</h1><p>{mode==="login"?"Sign in to continue discovering opportunities.":"Start finding opportunities around the world."}</p>{mode==="register"&&<label>Full name<input required minLength="2" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label>}<label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Password<input required minLength={mode==="register"?10:1} type="password" value={password} onChange={e=>setPassword(e.target.value)}/>{mode==="register"&&<small>Use at least 10 characters.</small>}</label>{error&&<div className="alert alert-error">{error}</div>}<button className="btn btn-primary btn-block" disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in":"Create account"}</button><div className="auth-switch">{mode==="login"?"New to OpportunityHub?":"Already have an account?"} <a href={mode==="login"?"/register":"/login"}>{mode==="login"?"Create account":"Sign in"}</a></div>{mode==="login"&&<div className="demo-hint">Demo: demo@opportunityhub.ai · Opportunity123!</div>}</form><small className="auth-foot">By continuing, you agree to use official sources and provide truthful application information.</small></div>;
}

function Protected({children}) { const {user,loading}=useAuth();if(loading)return <div className="loading full">Loading your workspace…</div>;return user?children:<Navigate to="/login" replace/>; }
function LayoutRoute({children}) { return <Protected><Shell>{children}</Shell></Protected>; }

export default function App() {
  return <ThemeProvider><AuthProvider><Routes>
    <Route path="/login" element={<AuthPage mode="login"/>}/><Route path="/register" element={<AuthPage mode="register"/>}/>
    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
    <Route path="/dashboard" element={<LayoutRoute><Dashboard/></LayoutRoute>}/>
    <Route path="/jobs" element={<LayoutRoute><OpportunityList type="JOB"/></LayoutRoute>}/>
    <Route path="/scholarships" element={<LayoutRoute><OpportunityList type="SCHOLARSHIP"/></LayoutRoute>}/>
    <Route path="/explore" element={<LayoutRoute><OpportunityList type="ALL"/></LayoutRoute>}/>
    <Route path="/opportunities/:id" element={<LayoutRoute><OpportunityDetails/></LayoutRoute>}/>
    <Route path="/applications" element={<LayoutRoute><Applications/></LayoutRoute>}/>
    <Route path="/saved" element={<LayoutRoute><Saved/></LayoutRoute>}/>
    <Route path="/alerts" element={<LayoutRoute><Alerts/></LayoutRoute>}/>
    <Route path="/ai-assistant" element={<LayoutRoute><AIWorkspace/></LayoutRoute>}/>
    <Route path="/resume-builder" element={<LayoutRoute><AIWorkspace mode="resume"/></LayoutRoute>}/>
    <Route path="/essay-assistant" element={<LayoutRoute><AIWorkspace mode="essay"/></LayoutRoute>}/>
    <Route path="/interview-prep" element={<LayoutRoute><InterviewPrep/></LayoutRoute>}/>
    <Route path="/profile" element={<LayoutRoute><Profile/></LayoutRoute>}/>
    <Route path="/settings" element={<LayoutRoute><SettingsPage/></LayoutRoute>}/>
    <Route path="/pricing" element={<LayoutRoute><Pricing/></LayoutRoute>}/>
    <Route path="/admin" element={<LayoutRoute><Admin/></LayoutRoute>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></AuthProvider></ThemeProvider>;
}
