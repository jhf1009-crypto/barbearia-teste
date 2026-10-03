const SUPABASE_URL="https://firxhlkzzmewtzacdsli.supabase.co";
const SUPABASE_KEY="sb_publishable__olgWddFeGtuGPy2LKncZQ_yKgB2xvN";
const headers={apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json"};

export type Barber={id:string;name:string;specialty:string;whatsapp:string;image_url:string|null;active:boolean;sort_order:number};
export type Service={id:string;name:string;detail:string;price:number;duration_minutes:number;active:boolean;sort_order:number};
export type Booking={id:string;barber_id:string;service_id:string;client_name:string;client_phone?:string|null;booking_date:string;booking_time:string;status:"pending"|"confirmed"|"cancelled";barbers?:{name:string}|null;services?:{name:string;price:number}|null};

async function request<T>(path:string,init?:RequestInit):Promise<T>{
  const response=await fetch(`${SUPABASE_URL}${path}`,{...init,headers:{...headers,...(init?.headers||{})}});
  if(!response.ok)throw new Error(await response.text());
  const text=await response.text();
  return (text?JSON.parse(text):null) as T;
}
export const getPublicBarbers=()=>request<Barber[]>("/rest/v1/barbers?active=eq.true&select=*&order=sort_order.asc");
export const getPublicServices=()=>request<Service[]>("/rest/v1/services?active=eq.true&select=*&order=sort_order.asc");
export const createBooking=(payload:Omit<Booking,"id"|"status">)=>request<Booking[]>("/rest/v1/bookings",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({...payload,status:"pending"})});
export async function adminCall<T>(email:string,password:string,action:string,payload?:unknown){const response=await fetch(`${SUPABASE_URL}/functions/v1/admin-api`,{method:"POST",headers,body:JSON.stringify({email,password,action,payload})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Erro no painel administrativo.");return data as T}
export async function uploadAdminPhoto(email:string,password:string,file:File){const form=new FormData();form.append("email",email);form.append("password",password);form.append("file",file);const response=await fetch(`${SUPABASE_URL}/functions/v1/admin-api`,{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`},body:form});const data=await response.json();if(!response.ok)throw new Error(data.error||"Erro ao enviar a foto.");return data as {url:string}}
