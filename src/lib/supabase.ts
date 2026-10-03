const API_BASE="https://firxhlkzzmewtzacdsli.supabase.co/functions/v1";

export type Barber={id:string;name:string;specialty:string;whatsapp:string;image_url:string|null;active:boolean;sort_order:number};
export type Service={id:string;name:string;detail:string;price:number;duration_minutes:number;active:boolean;sort_order:number};
export type Booking={id:string;barber_id:string;service_id:string;client_name:string;client_phone?:string|null;booking_date:string;booking_time:string;status:"pending"|"confirmed"|"cancelled";barbers?:{name:string}|null;services?:{name:string;price:number}|null};

async function post<T>(endpoint:string,body:unknown):Promise<T>{
  const response=await fetch(`${API_BASE}/${endpoint}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||"Erro ao acessar o servidor.");
  return data as T;
}

export async function bootstrapPublic(){
  return post<{barbers:Barber[];services:Service[]}>("public-api",{action:"bootstrap"});
}
export async function createBooking(payload:{barber_id:string;service_id:string;client_name:string;booking_date:string;booking_time:string}){
  return post<{booking:Booking}>("public-api",{action:"create-booking",payload});
}
export async function adminCall<T>(email:string,password:string,action:string,payload?:unknown){
  return post<T>("admin-api",{email,password,action,payload});
}
export async function uploadAdminPhoto(email:string,password:string,file:File){
  const form=new FormData();form.append("email",email);form.append("password",password);form.append("file",file);
  const response=await fetch(`${API_BASE}/admin-api`,{method:"POST",body:form});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||"Erro ao enviar a foto.");
  return data as {url:string};
}
