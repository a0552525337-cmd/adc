
const http=require('http'),fs=require('fs'),crypto=require('crypto'),path=require('path');
const PORT=process.env.PORT||3000, STORE=process.env.DATA_DIR||'/tmp';
const PASSFILE=path.join(STORE,'almoghani-password.json');
const SECRET=process.env.SESSION_SECRET||crypto.randomBytes(32).toString('hex');
let attempts=new Map();
const hash=p=>crypto.scryptSync(p,'almoghani-private-v1',64).toString('hex');
let passHash=process.env.SITE_PASSWORD_HASH||hash(process.env.SITE_PASSWORD||'100100');
try{if(fs.existsSync(PASSFILE))passHash=JSON.parse(fs.readFileSync(PASSFILE)).hash}catch{}
function equal(a,b){return a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b))}
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=').slice(0,2)))}
function sign(t){return crypto.createHmac('sha256',SECRET).update(t).digest('hex')}
function auth(req){let v=cookies(req).almoghani||'',i=v.lastIndexOf('.');if(i<0)return false;let t=v.slice(0,i),s=v.slice(i+1);return equal(sign(t),s)&&Number(t)>Date.now()}
function send(res,code,body,type='text/html; charset=utf-8',headers={}){res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY',...headers});res.end(body)}
function json(res,code,obj,headers){send(res,code,JSON.stringify(obj),'application/json; charset=utf-8',headers)}
function read(req){return new Promise((ok,bad)=>{let b='';req.on('data',x=>{b+=x;if(b.length>12000){bad(Error('too large'));req.destroy()}});req.on('end',()=>{try{ok(JSON.parse(b))}catch{bad(Error('bad json'))}});req.on('error',bad)})}
const login=`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>دخول ALMOGHANI LIVE</title><style>body{margin:0;background:#080d0b;color:white;font-family:Tahoma;min-height:100vh;display:grid;place-items:center}main{width:min(92vw,390px);padding:32px;background:#15201a;border:1px solid #315b42;border-radius:20px;box-sizing:border-box}h1{color:#4fe48b}input,button{box-sizing:border-box;width:100%;padding:15px;margin-top:15px;border-radius:10px;font:inherit}input{background:#09120d;color:white;border:1px solid #58715f}button{background:#32c873;border:0;font-weight:bold;cursor:pointer}p{color:#ff9a9a}</style><main><h1>ALMOGHANI LIVE 🔒</h1><div>موقع خاص — أدخل كلمة المرور</div><form id="f"><input id="p" type="password" autocomplete="current-password" required placeholder="كلمة المرور"><button>دخول</button></form><p id="msg"></p></main><script>f.onsubmit=async e=>{e.preventDefault();let r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:p.value})});if(r.ok)location.href='/';else msg.textContent='كلمة المرور غير صحيحة أو تجاوزت المحاولات المسموحة'}</script></html>`;
http.createServer(async(req,res)=>{
let pathname=new URL(req.url,'http://localhost').pathname;
if(pathname==='/health')return send(res,200,'ok','text/plain');
if(pathname==='/login'&&req.method==='GET')return auth(req)?(res.writeHead(302,{Location:'/'}),res.end()):send(res,200,login);
if(pathname==='/api/login'&&req.method==='POST'){
let ip=req.socket.remoteAddress||'unknown',entry=attempts.get(ip)||{n:0,until:0};
if(entry.n>=8&&entry.until>Date.now())return json(res,429,{message:'حاول لاحقاً'});
try{let x=await read(req);if(!equal(hash(String(x.password||'')),passHash)){entry.n++;entry.until=Date.now()+15*60*1000;attempts.set(ip,entry);return json(res,401,{message:'خطأ'})}
attempts.delete(ip);let t=String(Date.now()+12*60*60*1000);return json(res,200,{ok:true},{'Set-Cookie':`almoghani=${t}.${sign(t)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200`})}catch{return json(res,400,{message:'بيانات غير صالحة'})}}
if(!auth(req)){if(pathname.startsWith('/api/'))return json(res,401,{message:'يلزم الدخول'});res.writeHead(302,{Location:'/login'});return res.end()}
if(pathname==='/api/logout'&&req.method==='POST')return json(res,200,{ok:true},{'Set-Cookie':'almoghani=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
if(pathname==='/api/password'&&req.method==='POST'){try{let x=await read(req);if(!equal(hash(String(x.oldPassword||'')),passHash))return json(res,403,{message:'كلمة المرور الحالية غير صحيحة'});if(typeof x.newPassword!=='string'||x.newPassword.length<12)return json(res,400,{message:'اختر 12 حرفاً على الأقل'});passHash=hash(x.newPassword);fs.mkdirSync(STORE,{recursive:true});fs.writeFileSync(PASSFILE,JSON.stringify({hash:passHash}),{mode:0o600});return json(res,200,{message:'تم التغيير. ملاحظة: يلزم تخزين دائم على الاستضافة للاحتفاظ بالتغيير بعد إعادة التشغيل'})}catch{return json(res,500,{message:'تعذر الحفظ'})}}
if(pathname==='/'||pathname==='/index.html')return send(res,200,fs.readFileSync(path.join(__dirname,'public/index.html')));
return send(res,404,'غير موجود','text/plain');
}).listen(PORT,'0.0.0.0',()=>console.log('Listening on '+PORT));
