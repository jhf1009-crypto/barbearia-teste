import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Eye, EyeOff, LayoutDashboard, LockKeyhole, LogOut, Plus, Scissors, Trash2, Upload, Users } from "lucide-react";
import { adminCall, uploadAdminPhoto, type Barber, type Booking, type Service } from "./lib/supabase";

type Tab="visao"|"agenda"|"equipe"|"servicos";
type AdminData={barbers:Barber[];services:Service[];bookings:Booking[];settings:Record<string,unknown>};

export default function Admin(){
 const [authenticated,setAuthenticated]=useState(false);
 const [checking,setChecking]=useState(true);
 const [email,setEmail]=useState("admin@fernandes.com");
 const [password,setPassword]=useState("");
 const [showPassword,setShowPassword]=useState(false);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [tab,setTab]=useState<Tab>("visao");
 const [barbers,setBarbers]=useState<Barber[]>([]);
 const [services,setServices]=useState<Service[]>([]);
 const [bookings,setBookings]=useState<Booking[]>([]);
 const [newBarber,setNewBarber]=useState("");
 const [newService,setNewService]=useState("");
 const [newPrice,setNewPrice]=useState("0");
 const nav=[{id:"visao" as Tab,label:"Visão geral",icon:LayoutDashboard},{id:"agenda" as Tab,label:"Agenda",icon:CalendarDays},{id:"equipe" as Tab,label:"Equipe",icon:Users},{id:"servicos" as Tab,label:"Serviços",icon:Scissors}];
 const creds=()=>{const raw=sessionStorage.getItem("fernandes-admin");if(!raw)return{email,password};try{return JSON.parse(raw)}catch{return{email,password}}};
 const refresh=async()=>{const c=creds();const d=await adminCall<AdminData>(c.email,c.password,"list");setBarbers(d.barbers||[]);setServices(d.services||[]);setBookings(d.bookings||[])};

 useEffect(()=>{const raw=sessionStorage.getItem("fernandes-admin");if(!raw){setChecking(false);return;}try{const c=JSON.parse(raw);adminCall(c.email,c.password,"login").then(()=>{setAuthenticated(true);setEmail(c.email);setPassword(c.password);return refresh()}).catch(()=>sessionStorage.removeItem("fernandes-admin")).finally(()=>setChecking(false))}catch{setChecking(false)}},[]);
 const login=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError("");try{await adminCall(email,password,"login");sessionStorage.setItem("fernandes-admin",JSON.stringify({email:email.trim().toLowerCase(),password}));setAuthenticated(true);await refresh()}catch(err){setError(err instanceof Error?err.message:"Falha ao entrar.")}finally{setBusy(false)}};
 const call=async(action:string,payload?:unknown)=>{const c=creds();await adminCall(c.email,c.password,action,payload);await refresh()};
 const today=new Date().toISOString().slice(0,10);
 const todayBookings=bookings.filter(b=>b.booking_date===today&&b.status!=="cancelled");
 const revenue=useMemo(()=>bookings.filter(b=>b.booking_date===today&&b.status==="confirmed").reduce((sum,b)=>sum+Number(b.services?.price||0),0),[bookings,today]);

 if(checking)return <div className="adminLoading"/>;
 if(!authenticated)return <main className="loginPage"><section className="loginVisual"><img src="https://d2ol7oe51mr4n9.cloudfront.net/user_3JyBGh8WafqRsSo5ClLHRusCVG0/899d9203-a053-468d-b147-db4412b98f37.png" alt=""/><div/><p><small>Fernandes Barbearia</small>Sua operação, organizada em um só lugar.</p></section><section className="loginForm"><div><LockKeyhole size={32}/><h1>Acesso administrativo</h1><p>Entre para editar equipe, fotos, serviços e acompanhar os agendamentos salvos na nuvem.</p><form onSubmit={login}><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Senha<div className="pass"><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>{error&&<div className="error">{error}</div>}<button className="loginBtn" disabled={busy}>{busy?"Entrando...":"Entrar no painel"}</button></form></div></section></main>;

 return <main className="adminPage"><aside className="adminSide"><a href="/"><strong>Fernandes</strong><small>Administração</small></a><nav>{nav.map(({id,label,icon:Icon})=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={17}/>{label}</button>)}</nav><button className="logout" onClick={()=>{sessionStorage.removeItem("fernandes-admin");setAuthenticated(false)}}><LogOut size={17}/>Sair do painel</button></aside><section className="adminContent"><header><p>Painel na nuvem</p><h1>{nav.find(n=>n.id===tab)?.label}</h1></header>
 {tab==="visao"&&<><div className="stats"><Stat label="Agendamentos hoje" value={todayBookings.length}/><Stat label="Confirmados" value={todayBookings.filter(b=>b.status==="confirmed").length}/><Stat label="Receita confirmada" value={`R$ ${revenue.toFixed(2).replace(".",",")}`}/></div><h2>Próximos agendamentos</h2><BookingTable bookings={bookings.slice(0,8)} onStatus={(id,status)=>call("save-booking",{id,status})}/></>}
 {tab==="agenda"&&<BookingTable bookings={bookings} onStatus={(id,status)=>call("save-booking",{id,status})}/>}
 {tab==="equipe"&&<><div className="adminAdd"><input value={newBarber} onChange={e=>setNewBarber(e.target.value)} placeholder="Nome do novo barbeiro"/><button onClick={async()=>{if(!newBarber.trim())return;await call("save-barber",{name:newBarber.trim(),specialty:"Qualquer corte",whatsapp:"5561999668868",active:true,sort_order:barbers.length+1});setNewBarber("")}}><Plus size={16}/>Adicionar</button></div><div className="adminCards">{barbers.map(b=><article key={b.id}><div className="adminPhoto">{b.image_url&&<img src={b.image_url} alt={b.name}/>}</div><div className="adminCardHead"><div><strong>{b.name}</strong><span>{b.specialty}</span></div><button onClick={()=>confirm("Remover este barbeiro?")&&call("delete-barber",{id:b.id})}><Trash2 size={16}/></button></div><label className="upload"><Upload size={16}/>Trocar foto<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setBusy(true);try{const c=creds();const{url}=await uploadAdminPhoto(c.email,c.password,file);await call("save-barber",{id:b.id,image_url:url})}finally{setBusy(false)}}}/></label></article>)}</div></>}
 {tab==="servicos"&&<><div className="adminAdd serviceAdd"><input value={newService} onChange={e=>setNewService(e.target.value)} placeholder="Novo serviço"/><input type="number" min="0" value={newPrice} onChange={e=>setNewPrice(e.target.value)}/><button onClick={async()=>{if(!newService.trim())return;await call("save-service",{name:newService.trim(),detail:"Serviço da Fernandes Barbearia.",price:Number(newPrice)||0,duration_minutes:60,active:true,sort_order:services.length+1});setNewService("");setNewPrice("0")}}><Plus size={16}/>Adicionar</button></div><div className="serviceAdmin">{services.map(s=><div key={s.id}><div><strong>{s.name}</strong><span>{s.detail}</span></div><span>{s.duration_minutes} min</span><label>R$ <input type="number" defaultValue={s.price} onBlur={e=>Number(e.target.value)!==Number(s.price)&&call("save-service",{id:s.id,price:Number(e.target.value)})}/></label><button onClick={()=>confirm("Remover este serviço?")&&call("delete-service",{id:s.id})}><Trash2 size={16}/></button></div>)}</div></>}
 </section></main>
}
function Stat({label,value}:{label:string;value:string|number}){return <div><span>{label}</span><strong>{value}</strong></div>}
function BookingTable({bookings,onStatus}:{bookings:Booking[];onStatus:(id:string,status:Booking["status"])=>void}){if(!bookings.length)return <div className="empty">Nenhum agendamento salvo ainda.</div>;return <div className="bookingTable">{bookings.map(b=><div key={b.id}><strong>{new Date(b.booking_date+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</strong><strong>{b.booking_time.slice(0,5)}</strong><span>{b.client_name}</span><span>{b.barbers?.name||"—"}</span><span>{b.services?.name||"—"}</span><select value={b.status} onChange={e=>onStatus(b.id,e.target.value as Booking["status"])}><option value="pending">Pendente</option><option value="confirmed">Confirmado</option><option value="cancelled">Cancelado</option></select></div>)}</div>}
