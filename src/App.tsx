import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock3, Instagram, MapPin, MessageCircle } from "lucide-react";
import { bootstrapPublic, createBooking, type Barber, type Service } from "./lib/supabase";

const logo="https://d2ol7oe51mr4n9.cloudfront.net/user_3JyBGh8WafqRsSo5ClLHRusCVG0/fe1d6701-5665-4651-91c3-b92ef55f5f12.jpg";
const hero="https://d2ol7oe51mr4n9.cloudfront.net/user_3JyBGh8WafqRsSo5ClLHRusCVG0/899d9203-a053-468d-b147-db4412b98f37.png";

const fallbackServices:Service[]=[
{id:"s1",name:"Corte",detail:"Corte masculino com acabamento e finalização.",price:35,duration_minutes:60,active:true,sort_order:1},
{id:"s2",name:"Barba",detail:"Desenho, alinhamento e acabamento da barba.",price:25,duration_minutes:60,active:true,sort_order:2},
{id:"s3",name:"Corte + Barba",detail:"Corte e barba em um atendimento completo.",price:55,duration_minutes:60,active:true,sort_order:3},
{id:"s4",name:"Corte na Tesoura",detail:"Corte feito predominantemente na tesoura, com acabamento personalizado.",price:45,duration_minutes:60,active:true,sort_order:4},
{id:"s5",name:"Hidratação Capilar",detail:"Tratamento para hidratar, alinhar e melhorar o aspecto dos fios.",price:30,duration_minutes:60,active:true,sort_order:5},
{id:"s6",name:"Progressiva",detail:"Procedimento para redução de volume e alinhamento dos fios.",price:80,duration_minutes:60,active:true,sort_order:6},
{id:"s7",name:"Acabamento",detail:"Pezinho, contornos e pequenos ajustes para manter o corte alinhado.",price:15,duration_minutes:30,active:true,sort_order:7}
];

const fallbackBarbers:Barber[]=[
{id:"b1",name:"Guga Fernandes",specialty:"Qualquer corte",whatsapp:"5561999668868",image_url:"https://d2ol7oe51mr4n9.cloudfront.net/user_3JyBGh8WafqRsSo5ClLHRusCVG0/b2e4b21c-b1b7-4ba0-adef-a8d6f6d8cd5c.png",active:true,sort_order:1},
{id:"b2",name:"Matheus Ferreira",specialty:"Qualquer corte",whatsapp:"5561999668868",image_url:"https://d2ol7oe51mr4n9.cloudfront.net/user_3JyBGh8WafqRsSo5ClLHRusCVG0/d0db1c70-3e12-44a6-b5cc-dca5e99744d9.jpg",active:true,sort_order:2},
{id:"b3",name:"Luizinho",specialty:"Qualquer corte",whatsapp:"5561999668868",image_url:"https://d2ol7oe51mr4n9.cloudfront.net/user_3JyBGh8WafqRsSo5ClLHRusCVG0/58d9d92b-c1f5-4dd3-bd73-cdb6c4b423be.png",active:true,sort_order:3}
];

const times=["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

export default function App(){
 const reduced=useReducedMotion();
 const [barbers,setBarbers]=useState(fallbackBarbers);
 const [services,setServices]=useState(fallbackServices);
 const [selectedBarber,setSelectedBarber]=useState(fallbackBarbers[0]);
 const [service,setService]=useState(fallbackServices[0].name);
 const [date,setDate]=useState("");
 const [time,setTime]=useState("");
 const [name,setName]=useState("");

 useEffect(()=>{bootstrapPublic().then(({barbers:b,services:s})=>{if(b?.length){setBarbers(b);setSelectedBarber(b[0])}if(s?.length){setServices(s);setService(s[0].name)}}).catch(()=>{})},[]);
 const selectedService=useMemo(()=>services.find(s=>s.name===service),[services,service]);

 const sendWhatsApp=async()=>{
  if(!date||!time||!name.trim()||!selectedService)return;
  try{await createBooking({barber_id:selectedBarber.id,service_id:selectedService.id,client_name:name.trim(),booking_date:date,booking_time:time})}
  catch(e){if(e instanceof Error&&e.message==="slot_taken"){alert("Esse horário já foi reservado para esse barbeiro. Escolha outro.");return}}
  const formattedDate=new Date(date+"T12:00:00").toLocaleDateString("pt-BR");
  const message=`Olá, marquei horário com o barbeiro ${selectedBarber.name} para o dia ${formattedDate}, às ${time}. O serviço escolhido foi ${service}, no valor de R$ ${selectedService.price}. Meu nome é ${name.trim()}. Pode confirmar o agendamento para mim?`;
  window.open(`https://wa.me/${selectedBarber.whatsapp}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
 };

 return <main>
  <header className="topbar">
   <a href="#inicio" className="brand"><img src={logo} alt="Logo Fernandes Barbearia"/><span className="brandText"><strong>Fernandes</strong><small><i/>Barbearia</small></span></a>
   <nav><a href="#servicos">Serviços</a><a href="#equipe">Equipe</a><a href="#agendar">Agendar</a></nav>
   <a href="#agendar" className="pill dark">Agendar <ArrowRight size={16}/></a>
  </header>

  <section id="inicio" className="hero">
   <motion.div className="heroCopy" initial={{opacity:0,y:reduced?0:22}} animate={{opacity:1,y:0}} transition={{duration:.75}}>
    <p className="eyebrow"><span/>Posse, Goiás, Brasil · Seg—Sáb</p>
    <div><h1>Mais que um corte. Uma assinatura.</h1><div className="heroBottom"><p>Do primeiro traço ao acabamento: cortes pensados para o seu rosto, sua rotina e o jeito que você quer chegar.</p><a href="#agendar" className="pill copper">Escolher horário <ArrowRight size={16}/></a></div></div>
    <div className="heroMeta"><span><Clock3 size={16}/>08h—11h · 13h—19h</span><span>Com hora marcada</span><span>Resposta pelo WhatsApp</span></div>
   </motion.div>
   <motion.div className="heroImage" initial={{clipPath:reduced?"inset(0)":"inset(0 0 100% 0)"}} animate={{clipPath:"inset(0)"}} transition={{duration:1.1}}>
    <img src={hero} alt="Barbeiro realizando corte masculino"/><div className="shade"/><span className="heroTag">Fernandes</span>
   </motion.div>
  </section>

  <section id="servicos" className="section darkSection"><div className="splitHeading"><h2>Feito para ficar bem de perto.</h2><div className="serviceList">{services.map(s=><motion.article key={s.id} whileHover={{x:6}} className="serviceRow"><h3>{s.name}</h3><p>{s.detail}</p><strong>R$ {Number(s.price).toFixed(0)}</strong></motion.article>)}</div></div></section>

  <section id="equipe" className="section"><div className="sectionHead"><h2>Escolha quem vai cuidar do seu corte.</h2><p>Todos os profissionais atendem qualquer estilo. Escolha quem você prefere e continue o agendamento.</p></div><div className="teamGrid">{barbers.map(b=><motion.button key={b.id} whileHover={{y:-6}} className="barberCard" onClick={()=>{setSelectedBarber(b);document.getElementById("agendar")?.scrollIntoView({behavior:"smooth"})}}><img src={b.image_url||""} alt={b.name}/><div className="cardShade"/><div className="cardInfo"><div><h3>{b.name}</h3><p>{b.specialty}</p></div><span><ArrowRight size={17}/></span></div></motion.button>)}</div></section>

  <section id="agendar" className="bookingSection"><div><h2>Agende sem complicação.</h2><p>Escolha profissional, serviço, data e horário. O pedido fica salvo e o WhatsApp abre com a mensagem pronta.</p></div><div className="bookingBox">
   <Field title="Barbeiro"><div className="choiceGrid">{barbers.map(b=><button className={selectedBarber.id===b.id?"selected":""} key={b.id} onClick={()=>setSelectedBarber(b)}>{b.name}</button>)}</div></Field>
   <Field title="Serviço"><div className="choiceGrid services">{services.map(s=><button className={service===s.name?"selected copperSel":""} key={s.id} onClick={()=>setService(s.name)}>{s.name} · R$ {Number(s.price).toFixed(0)}</button>)}</div></Field>
   <div className="twoCols"><label><b>Data</b><input type="date" value={date} min={new Date().toISOString().split("T")[0]} onChange={e=>setDate(e.target.value)}/></label><label><b>Seu nome</b><input value={name} onChange={e=>setName(e.target.value)} placeholder="Como podemos te chamar?"/></label></div>
   <Field title="Horário desejado"><div className="timeGrid">{times.map(t=><button key={t} className={time===t?"selected":""} onClick={()=>setTime(t)}>{t}</button>)}</div></Field>
   <button className="whatsappBtn" disabled={!date||!time||!name.trim()} onClick={sendWhatsApp}><MessageCircle size={19}/>Continuar no WhatsApp</button>
  </div></section>

  <section className="contact"><div><MapPin size={19}/><p><strong>Fernandes Barbearia</strong><span>Avenida JK, em frente à Zelo · Posse, GO</span></p></div><div><Clock3 size={19}/><p><strong>Segunda a sábado</strong><span>08h às 11h · 13h às 19h</span></p></div><div><Instagram size={19}/><p><strong>@fernandesbarbearia</strong><span>Instagram</span></p></div></section>
  <footer>© 2026 Fernandes Barbearia <span>Posse · Goiás · Brasil</span></footer>
 </main>
}
function Field({title,children}:{title:string;children:React.ReactNode}){return <div className="field"><b>{title}</b>{children}</div>}
