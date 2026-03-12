import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const NAV_LINKS = ["Features", "Pricing", "About", "Blog"];

const FEATURES = [
  { icon:"⚡", title:"Real-time Messaging",  desc:"Sub-50ms delivery across the globe. Your words arrive before the thought fades.",        accent:"#00f5a0" },
  { icon:"🔒", title:"End-to-End Encrypted", desc:"Military-grade encryption on every byte. Zero knowledge architecture by default.",        accent:"#00d9f5" },
  { icon:"🌐", title:"Cross-Platform Sync",  desc:"Seamlessly move between phone, desktop, and web. Your flow never breaks.",               accent:"#7b2fff" },
  { icon:"🤖", title:"AI Co-Pilot",          desc:"Your built-in assistant drafts, summarises, and translates on the fly.",                  accent:"#00f5a0" },
  { icon:"🎙️", title:"Voice & Video",        desc:"Crystal clear calls with adaptive bitrate. No lag. No drop-offs.",                       accent:"#00d9f5" },
  { icon:"📁", title:"File Vaults",          desc:"Store and share up to 10 GB per conversation. Never lose a file again.",                  accent:"#7b2fff" },
];

const TESTIMONIALS = [
  { name:"Aria Chen",  role:"Product Lead @ Figma", text:"Switched our entire team to StoneChat. The speed is unreal and the UI is chef's kiss.", avatar:"AC", color:"#e91e8c" },
  { name:"Marcus Lee", role:"CTO @ Drift",          text:"Finally a chat app that doesn't make me want to throw my laptop. 10/10.",                avatar:"ML", color:"#9c27b0" },
  { name:"Priya Nair", role:"Founder @ Loops",      text:"StoneChat replaced Slack, Discord, AND WhatsApp for us. Wildly good product.",           avatar:"PN", color:"#2196f3" },
];

const MOCK_MESSAGES = [
  { from:"them", text:"hey, you seeing those new StoneChat features? 👀", delay:0    },
  { from:"me",   text:"yeah omg the AI reply drafts are insane",           delay:2000 },
  { from:"them", text:"and it's actually fast this time",                   delay:4200 },
  { from:"me",   text:"no more lag 🙏 finally",                             delay:6100 },
  { from:"them", text:"this is replacing everything lol",                   delay:8300 },
];

const STATS = [
  { value:"50K+",   label:"Teams worldwide"  },
  { value:"<50ms",  label:"Message delivery" },
  { value:"99.9%",  label:"Uptime SLA"       },
  { value:"256-bit",label:"Encryption"       },
];

/* ─────────────────────────────────────────────
   THREE.JS SCENE HOOK
───────────────────────────────────────────── */
function useThreeScene(mountRef) {
  useEffect(() => {
    if (!mountRef.current) return;
    const el = mountRef.current;
    const W = el.clientWidth, H = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H); renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, W/H, 0.1, 100);
    cam.position.set(0, 0, 8.5);

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const kl = new THREE.DirectionalLight(0x00f5a0, 2.2); kl.position.set(-3,4,3); scene.add(kl);
    const fl = new THREE.DirectionalLight(0x00d9f5, 1.4); fl.position.set(4,1,2); scene.add(fl);
    const rl = new THREE.PointLight(0x7b2fff, 2.5, 16); rl.position.set(0,3,-3); scene.add(rl);
    scene.add(Object.assign(new THREE.PointLight(0x00f5a0, 0.8, 10), { position: new THREE.Vector3(0,-4,2) }));

    // Phone
    const phoneG = new THREE.Group();
    const bM = new THREE.MeshPhysicalMaterial({ color:0x0a0e14, metalness:0.6, roughness:0.1, transparent:true, opacity:0.92 });
    phoneG.add(new THREE.Mesh(new THREE.BoxGeometry(1.5,3.0,0.14), bM));
    const sM = new THREE.MeshBasicMaterial({ color:0x060910, transparent:true, opacity:0.97 });
    const ps = new THREE.Mesh(new THREE.PlaneGeometry(1.26,2.6), sM); ps.position.z=0.075; phoneG.add(ps);
    phoneG.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.52,0.025,0.15), new THREE.MeshBasicMaterial({ color:0x00d9f5, transparent:true, opacity:0.8 })), { position: new THREE.Vector3(0,1.51,0) }));
    phoneG.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.52,0.025,0.15), new THREE.MeshBasicMaterial({ color:0x00f5a0, transparent:true, opacity:0.5 })), { position: new THREE.Vector3(0,-1.51,0) }));
    phoneG.position.set(-2.7,0,0); phoneG.rotation.y=0.32; phoneG.rotation.x=-0.06;
    scene.add(phoneG);

    // Desktop
    const deskG = new THREE.Group();
    const dM = new THREE.MeshPhysicalMaterial({ color:0x0a0e14, metalness:0.65, roughness:0.12, transparent:true, opacity:0.92 });
    deskG.add(new THREE.Mesh(new THREE.BoxGeometry(5.6,3.6,0.13), dM));
    const dS = new THREE.Mesh(new THREE.PlaneGeometry(5.2,3.18), new THREE.MeshBasicMaterial({ color:0x060910, transparent:true, opacity:0.97 })); dS.position.z=0.07; deskG.add(dS);
    deskG.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(5.62,0.03,0.14), new THREE.MeshBasicMaterial({ color:0x7b2fff, transparent:true, opacity:0.75 })), { position: new THREE.Vector3(0,1.82,0) }));
    deskG.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.16,1.0,0.13), dM), { position: new THREE.Vector3(0,-2.3,0) }));
    deskG.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.8,0.11,0.55), dM), { position: new THREE.Vector3(0,-2.85,0) }));
    deskG.position.set(1.5,0.25,-0.6); deskG.rotation.y=-0.2;
    scene.add(deskG);

    // Particles
    const N=160; const pPos=new Float32Array(N*3); const pVel=[];
    for(let i=0;i<N;i++){
      pPos[i*3]=(Math.random()-.5)*22; pPos[i*3+1]=(Math.random()-.5)*13; pPos[i*3+2]=(Math.random()-.5)*10;
      pVel.push({ x:(Math.random()-.5)*.007, y:(Math.random()-.5)*.005, z:(Math.random()-.5)*.004 });
    }
    const pGeo=new THREE.BufferGeometry(); pGeo.setAttribute("position",new THREE.BufferAttribute(pPos,3));
    const pts=new THREE.Points(pGeo, new THREE.PointsMaterial({ color:0x00f5a0, size:0.055, transparent:true, opacity:0.45, sizeAttenuation:true }));
    scene.add(pts);

    // Trails
    const trails=Array.from({length:8},(_,t)=>{
      const s=new THREE.Vector3(-2.3,(Math.random()-.5)*2.5,0.1);
      const e=new THREE.Vector3(0.7,(Math.random()-.5)*1.8,-0.4);
      const m=new THREE.Vector3((s.x+e.x)/2,s.y+Math.random()*1.5-.6,(s.z+e.z)/2+.7);
      const tp=Array.from({length:28},(_,i)=>{const a=i/27;return new THREE.Vector3((1-a)**2*s.x+2*(1-a)*a*m.x+a**2*e.x,(1-a)**2*s.y+2*(1-a)*a*m.y+a**2*e.y,(1-a)**2*s.z+2*(1-a)*a*m.z+a**2*e.z);});
      const mat=new THREE.LineBasicMaterial({ color:t%3===0?0x00f5a0:t%3===1?0x00d9f5:0x7b2fff, transparent:true, opacity:0 });
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(tp),mat);
      scene.add(line); return { line, mat, offset:t*1.2, speed:.6+Math.random()*.5 };
    });

    // Grid
    const grid=new THREE.GridHelper(32,32,0x00f5a0,0x0d2020);
    grid.material.transparent=true; grid.material.opacity=0.09; grid.position.y=-4.2; scene.add(grid);

    // Ring
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.6,.015,8,64), new THREE.MeshBasicMaterial({ color:0x00f5a0, transparent:true, opacity:.35 }));
    ring.position.set(-.65,0,0); ring.rotation.x=Math.PI/2; scene.add(ring);

    const clock=new THREE.Clock(); let raf;
    const tick=()=>{
      raf=requestAnimationFrame(tick);
      const t=clock.getElapsedTime();
      cam.position.x=Math.sin(t*.05)*2.2;
      cam.position.y=.6+Math.sin(t*.03)*.55;
      cam.position.z=8.5-Math.sin(t*.04)*.8;
      cam.lookAt(0,.1,0);
      phoneG.position.y=Math.sin(t*.75)*.22;
      phoneG.rotation.y=.32+Math.sin(t*.44)*.08;
      phoneG.rotation.z=Math.sin(t*.6)*.03;
      deskG.position.y=.25+Math.sin(t*.58+1.3)*.15;
      deskG.rotation.y=-.2+Math.sin(t*.38)*.05;
      const pa=pts.geometry.attributes.position.array;
      for(let i=0;i<N;i++){
        pa[i*3]+=pVel[i].x; pa[i*3+1]+=pVel[i].y; pa[i*3+2]+=pVel[i].z;
        if(Math.abs(pa[i*3])>11)pVel[i].x*=-1;
        if(Math.abs(pa[i*3+1])>6.5)pVel[i].y*=-1;
        if(Math.abs(pa[i*3+2])>5)pVel[i].z*=-1;
      }
      pts.geometry.attributes.position.needsUpdate=true;
      pts.rotation.y=t*.012;
      trails.forEach(({mat,offset,speed})=>{const p=((t*speed+offset)%4)/4;mat.opacity=p<.5?p*2*.55:(1-p)*2*.55;});
      ring.scale.setScalar(1+Math.sin(t*1.4)*.06);
      ring.material.opacity=.25+Math.sin(t*1.4)*.12;
      rl.intensity=2.5+Math.sin(t*1.1)*.6;
      kl.intensity=2.2+Math.sin(t*.7)*.4;
      renderer.render(scene,cam);
    };
    tick();

    const onResize=()=>{const nW=el.clientWidth,nH=el.clientHeight;cam.aspect=nW/nH;cam.updateProjectionMatrix();renderer.setSize(nW,nH);};
    window.addEventListener("resize",onResize);
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",onResize);renderer.dispose();if(renderer.domElement.parentNode===el)el.removeChild(renderer.domElement);};
  },[]);
}

/* ─────────────────────────────────────────────
   CHAT OVERLAYS
───────────────────────────────────────────── */
const PhoneOverlay=()=>{
  const [msgs,setMsgs]=useState([]);
  const [typing,setTyping]=useState(false);
  useEffect(()=>{
    const run=()=>{setMsgs([]);setTyping(false);MOCK_MESSAGES.forEach(m=>{setTimeout(()=>{setTyping(true);setTimeout(()=>{setTyping(false);setMsgs(p=>[...p,m]);},750);},m.delay);});};
    run();const id=setInterval(run,13500);return()=>clearInterval(id);
  },[]);
  return(
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",padding:"12px 9px 9px",gap:4,overflow:"hidden",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
        <div style={{width:18,height:18,borderRadius:"50%",background:"linear-gradient(135deg,#00f5a0,#00d9f5)",flexShrink:0}}/>
        <span style={{color:"#fff",fontSize:8,fontWeight:700}}>StoneChat</span>
        <motion.span animate={{opacity:[1,.3,1]}} transition={{duration:1.6,repeat:Infinity}} style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:"#00f5a0"}}/>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",gap:4,justifyContent:"flex-end"}}>
        <AnimatePresence>
          {msgs.map((m,i)=>(
            <motion.div key={i} initial={{opacity:0,y:8,scale:.93}} animate={{opacity:1,y:0,scale:1}} transition={{type:"spring",stiffness:420,damping:26}} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start"}}>
              <div style={{background:m.from==="me"?"linear-gradient(135deg,#00f5a0,#00d9f5)":"rgba(255,255,255,0.09)",color:m.from==="me"?"#000":"#fff",padding:"4px 8px",borderRadius:m.from==="me"?"11px 11px 3px 11px":"11px 11px 11px 3px",fontSize:7.5,maxWidth:"85%",fontWeight:m.from==="me"?600:400,border:m.from!=="me"?"1px solid rgba(255,255,255,0.08)":"none"}}>{m.text}</div>
            </motion.div>
          ))}
          {typing&&<motion.div key="t" initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{display:"flex",justifyContent:"flex-start"}}>
            <div style={{display:"flex",gap:3,padding:"5px 9px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"11px 11px 11px 3px",width:"fit-content"}}>
              {[0,1,2].map(i=><motion.div key={i} animate={{y:[0,-4,0]}} transition={{duration:.55,repeat:Infinity,delay:i*.16}} style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.4)"}}/>)}
            </div>
          </motion.div>}
        </AnimatePresence>
      </div>
      <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,padding:"4px 9px",display:"flex",alignItems:"center",gap:5}}>
        <span style={{color:"rgba(255,255,255,0.2)",fontSize:7,flex:1}}>Message…</span>
        <div style={{width:13,height:13,borderRadius:"50%",background:"linear-gradient(135deg,#00f5a0,#00d9f5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7}}>↑</div>
      </div>
    </div>
  );
};

const DesktopOverlay=()=>{
  const [msgs,setMsgs]=useState([]);
  const [typing,setTyping]=useState(false);
  useEffect(()=>{
    const run=()=>{setMsgs([]);setTyping(false);MOCK_MESSAGES.forEach(m=>{setTimeout(()=>{setTyping(true);setTimeout(()=>{setTyping(false);setMsgs(p=>[...p,m]);},700);},m.delay+700);});};
    run();const id=setInterval(run,13500);return()=>clearInterval(id);
  },[]);
  return(
    <div style={{position:"absolute",inset:0,display:"flex",fontFamily:"'DM Sans',sans-serif",overflow:"hidden"}}>
      <div style={{width:90,background:"rgba(255,255,255,0.02)",borderRight:"1px solid rgba(255,255,255,0.05)",padding:"9px 6px",display:"flex",flexDirection:"column",gap:5}}>
        <div style={{fontSize:9,fontWeight:800,fontFamily:"'Syne',sans-serif",background:"linear-gradient(90deg,#00f5a0,#00d9f5)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:5}}>StoneChat</div>
        {["Aria C.","Marcus L.","Priya N.","Dev Team"].map((n,i)=>(
          <div key={n} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 5px",borderRadius:5,background:i===0?"rgba(0,245,160,0.08)":"transparent",borderLeft:i===0?"2px solid #00f5a0":"2px solid transparent"}}>
            <div style={{width:15,height:15,borderRadius:"50%",flexShrink:0,background:["#e91e8c","#9c27b0","#2196f3","#ff9800"][i]}}/>
            <span style={{fontSize:7,color:i===0?"#fff":"rgba(255,255,255,0.35)",whiteSpace:"nowrap"}}>{n}</span>
          </div>
        ))}
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"7px 9px"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,paddingBottom:5,marginBottom:6,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{width:16,height:16,borderRadius:"50%",background:"#e91e8c"}}/>
          <span style={{color:"#fff",fontSize:8.5,fontWeight:600}}>Aria Chen</span>
          <motion.div animate={{opacity:[1,.3,1]}} transition={{duration:1.8,repeat:Infinity}} style={{width:5,height:5,borderRadius:"50%",background:"#00f5a0",marginLeft:2}}/>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",gap:4,justifyContent:"flex-end"}}>
          <AnimatePresence>
            {msgs.map((m,i)=>(
              <motion.div key={i} initial={{opacity:0,x:m.from==="me"?14:-14}} animate={{opacity:1,x:0}} transition={{type:"spring",stiffness:380,damping:28}} style={{display:"flex",justifyContent:m.from==="me"?"flex-end":"flex-start"}}>
                <div style={{background:m.from==="me"?"linear-gradient(135deg,#00f5a0,#00d9f5)":"rgba(255,255,255,0.07)",color:m.from==="me"?"#000":"#fff",padding:"4px 8px",borderRadius:m.from==="me"?"10px 10px 2px 10px":"10px 10px 10px 2px",fontSize:7.5,maxWidth:"76%",fontWeight:m.from==="me"?600:400,border:m.from!=="me"?"1px solid rgba(255,255,255,0.07)":"none",boxShadow:m.from==="me"?"0 2px 10px rgba(0,245,160,0.22)":"none"}}>{m.text}</div>
              </motion.div>
            ))}
            {typing&&<motion.div key="dt" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div style={{display:"flex",gap:3,padding:"5px 9px",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px 10px 10px 2px",width:"fit-content"}}>
                {[0,1,2].map(i=><motion.div key={i} animate={{y:[0,-4,0]}} transition={{duration:.55,repeat:Infinity,delay:i*.16}} style={{width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.4)"}}/>)}
              </div>
            </motion.div>}
          </AnimatePresence>
        </div>
        <div style={{marginTop:5,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"4px 10px",display:"flex",alignItems:"center",gap:6}}>
          <span style={{color:"rgba(255,255,255,0.18)",fontSize:7,flex:1}}>Type a message…</span>
          <div style={{width:13,height:13,borderRadius:"50%",background:"linear-gradient(135deg,#00f5a0,#00d9f5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7}}>↑</div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   HERO 3D
───────────────────────────────────────────── */
const Hero3D=()=>{
  const mountRef=useRef(null);
  useThreeScene(mountRef);
  return(
    <div style={{position:"relative",width:"100%",height:520}}>
      <div ref={mountRef} style={{position:"absolute",inset:0}}/>
      {/* Phone screen */}
      <div style={{position:"absolute",left:"19.2%",top:"13%",width:"9.8%",height:"57%",overflow:"hidden",borderRadius:"5px",pointerEvents:"none",zIndex:5}}>
        <PhoneOverlay/>
      </div>
      {/* Desktop screen */}
      <div style={{position:"absolute",left:"40.2%",top:"9.5%",width:"33.5%",height:"47.5%",overflow:"hidden",borderRadius:"3px",pointerEvents:"none",zIndex:5}}>
        <DesktopOverlay/>
      </div>
      {/* Feature badges */}
      {[
        {icon:"🔒",label:"E2E Encrypted", style:{bottom:"18%",left:"5%"},  delay:1   },
        {icon:"⚡",label:"<50ms",         style:{top:"12%",  left:"2%"},  delay:3.5 },
        {icon:"🤖",label:"AI Co-Pilot",   style:{top:"10%",  right:"4%"}, delay:6.5 },
        {icon:"🗂️",label:"File Vaults",   style:{bottom:"16%",right:"4%"},delay:9.5 },
      ].map(({icon,label,style,delay})=>(
        <motion.div key={label} initial={{opacity:0,scale:.75,y:12}} animate={{opacity:[0,1,1,1,0],scale:[.75,1,1,1,.88],y:[12,0,0,-2,-8]}} transition={{duration:4,delay,repeat:Infinity,repeatDelay:10,ease:[.16,1,.3,1]}} style={{position:"absolute",display:"flex",alignItems:"center",gap:8,background:"rgba(7,10,15,0.86)",border:"1px solid rgba(0,245,160,0.2)",borderRadius:30,padding:"7px 14px",backdropFilter:"blur(18px)",boxShadow:"0 8px 32px rgba(0,0,0,0.55)",fontFamily:"'DM Sans',sans-serif",pointerEvents:"none",zIndex:20,...style}}>
          <span style={{fontSize:15}}>{icon}</span>
          <span style={{color:"#fff",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>
        </motion.div>
      ))}
      {/* Live pill */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{delay:1,duration:.5}} style={{position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:7,background:"rgba(0,245,160,0.08)",border:"1px solid rgba(0,245,160,0.2)",borderRadius:30,padding:"6px 16px",zIndex:30,fontFamily:"'DM Sans',sans-serif"}}>
        <motion.div animate={{scale:[1,1.5,1],opacity:[1,.4,1]}} transition={{duration:1.5,repeat:Infinity}} style={{width:6,height:6,borderRadius:"50%",background:"#00f5a0"}}/>
        <span style={{color:"#00f5a0",fontSize:12,fontWeight:600}}>Live demo — real-time messaging</span>
      </motion.div>
      {/* Vignette */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:8,background:"radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(7,10,15,0.65) 100%)"}}/>
      {/* Bottom fade */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:140,pointerEvents:"none",zIndex:9,background:"linear-gradient(transparent,#070a0f)"}}/>
    </div>
  );
};

/* ─────────────────────────────────────────────
   FEATURE CARD
───────────────────────────────────────────── */
const FeatureCard=({icon,title,desc,accent,index})=>{
  const [hov,setHov]=useState(false);
  return(
    <motion.div initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.5,delay:index*.07}} onHoverStart={()=>setHov(true)} onHoverEnd={()=>setHov(false)} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${hov?accent+"30":"rgba(255,255,255,0.07)"}`,borderRadius:22,padding:"28px 24px",cursor:"default",position:"relative",overflow:"hidden",transition:"border-color 0.3s"}}>
      <motion.div animate={{opacity:hov?1:0}} transition={{duration:.3}} style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 30% 30%, ${accent}0a, transparent 65%)`,pointerEvents:"none"}}/>
      <motion.div animate={{scaleX:hov?1:0}} transition={{duration:.3,ease:"easeOut"}} style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${accent},transparent)`,transformOrigin:"left"}}/>
      <div style={{fontSize:32,marginBottom:16}}>{icon}</div>
      <div style={{color:"#fff",fontWeight:700,fontSize:16,marginBottom:8,fontFamily:"'Syne',sans-serif",letterSpacing:"-0.3px"}}>{title}</div>
      <div style={{color:"rgba(255,255,255,0.45)",fontSize:14,lineHeight:1.75}}>{desc}</div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   TESTIMONIAL CARD
───────────────────────────────────────────── */
const TestimonialCard=({name,role,text,avatar,color,index})=>(
  <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.5,delay:index*.1}} whileHover={{y:-4}} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:22,padding:"28px 26px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:16,right:20,fontFamily:"Georgia,serif",fontSize:72,lineHeight:1,color:"rgba(255,255,255,0.04)",fontWeight:900,pointerEvents:"none"}}>"</div>
    <div style={{color:"rgba(255,255,255,0.72)",fontSize:14,lineHeight:1.85,marginBottom:24,position:"relative"}}>{text}</div>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:42,height:42,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>{avatar}</div>
      <div>
        <div style={{color:"#fff",fontWeight:600,fontSize:14}}>{name}</div>
        <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,marginTop:1}}>{role}</div>
      </div>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
const StatCard=({value,label,index})=>(
  <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.5,delay:index*.1}} style={{textAlign:"center"}}>
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:800,background:"linear-gradient(135deg,#00f5a0,#00d9f5)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-1px"}}>{value}</div>
    <div style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginTop:4}}>{label}</div>
  </motion.div>
);

/* ─────────────────────────────────────────────
   SHIMMER BUTTON
───────────────────────────────────────────── */
const ShimmerBtn=({children,onClick,style={}})=>(
  <motion.button onClick={onClick} whileHover={{scale:1.05,boxShadow:"0 0 44px rgba(0,245,160,0.45)"}} whileTap={{scale:.97}} style={{background:"linear-gradient(135deg,#00f5a0,#00d9f5)",color:"#000",border:"none",borderRadius:50,padding:"16px 38px",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden",boxShadow:"0 4px 20px rgba(0,245,160,0.25)",...style}}>
    <motion.div animate={{x:["-120%","160%"]}} transition={{duration:2.2,repeat:Infinity,ease:"linear",repeatDelay:1.5}} style={{position:"absolute",inset:0,width:"45%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)",pointerEvents:"none"}}/>
    <span style={{position:"relative",zIndex:1}}>{children}</span>
  </motion.button>
);

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const ChatLanding=()=>{
  const {scrollY}=useScroll();
  const navBg=useTransform(scrollY,[0,80],["rgba(7,10,15,0)","rgba(7,10,15,0.94)"]);
  const heroY=useTransform(scrollY,[0,500],[0,-100]);

  // Cursor glow
  const cx=useMotionValue(-200),cy=useMotionValue(-200);
  const sx=useSpring(cx,{stiffness:90,damping:22}),sy=useSpring(cy,{stiffness:90,damping:22});
  useEffect(()=>{
    const mv=(e)=>{cx.set(e.clientX-200);cy.set(e.clientY-200);};
    window.addEventListener("mousemove",mv);
    return()=>window.removeEventListener("mousemove",mv);
  },[]);

  return(
    <div style={{background:"#070a0f",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",color:"#fff",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:#070a0f;}
        ::-webkit-scrollbar-thumb{background:rgba(0,245,160,0.4);border-radius:3px;}
        html{scroll-behavior:smooth;}
        ::selection{background:rgba(0,245,160,0.22);color:#fff;}
      `}</style>

      {/* Cursor glow */}
      <motion.div style={{position:"fixed",left:sx,top:sy,width:400,height:400,borderRadius:"50%",background:"radial-gradient(ellipse,rgba(0,245,160,0.05) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>

      {/* Ambient orbs */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        {[{x:"8%",y:"12%",s:500,c:"#00f5a0",d:0},{x:"62%",y:"4%",s:400,c:"#00d9f5",d:1.5},{x:"78%",y:"58%",s:350,c:"#7b2fff",d:3},{x:"18%",y:"68%",s:300,c:"#00f5a0",d:2}].map((o,i)=>(
          <motion.div key={i} animate={{y:[0,-28,0],scale:[1,1.08,1]}} transition={{duration:7+o.d,repeat:Infinity,ease:"easeInOut",delay:o.d}} style={{position:"absolute",left:o.x,top:o.y,width:o.s,height:o.s,borderRadius:"50%",background:o.c,filter:"blur(100px)",opacity:.09,pointerEvents:"none"}}/>
        ))}
      </div>

      {/* Fine grid */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,backgroundImage:"linear-gradient(rgba(0,245,160,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,160,0.022) 1px,transparent 1px)",backgroundSize:"52px 52px",maskImage:"radial-gradient(ellipse at 50% 30%,black 20%,transparent 70%)"}}/>

      {/* ── NAV ── */}
      <motion.nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:navBg,backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 28px",height:66,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:.5}} style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,background:"linear-gradient(90deg,#00f5a0,#00d9f5)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-0.5px"}}>
            StoneChat
          </motion.div>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.2}} style={{display:"flex",gap:32,alignItems:"center"}}>
            {NAV_LINKS.map(link=>(
              <motion.a key={link} href="#" whileHover={{color:"#fff",y:-1}} style={{color:"rgba(255,255,255,0.5)",textDecoration:"none",fontSize:14,fontWeight:500,transition:"color 0.2s"}}>{link}</motion.a>
            ))}
            <ShimmerBtn style={{padding:"10px 24px",fontSize:14}}>Get Started</ShimmerBtn>
          </motion.div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <motion.section style={{position:"relative",zIndex:1,paddingTop:80,y:heroY}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"60px 28px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:28}}>

          {/* Badge */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}} style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,245,160,0.08)",border:"1px solid rgba(0,245,160,0.22)",borderRadius:50,padding:"6px 18px",fontSize:13,color:"#00f5a0",fontWeight:500}}>
            <motion.span animate={{scale:[1,1.4,1]}} transition={{duration:1.5,repeat:Infinity}} style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"#00f5a0"}}/>
            v2.0 is live — faster, smarter, better
          </motion.div>

          {/* Headline */}
          <div style={{textAlign:"center"}}>
            {["Talk faster.","Think together."].map((line,i)=>(
              <motion.div key={line} initial={{opacity:0,y:48}} animate={{opacity:1,y:0}} transition={{duration:.8,delay:.1+i*.14,ease:[.16,1,.3,1]}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(56px,8.5vw,108px)",fontWeight:800,letterSpacing:"-4px",lineHeight:1,display:"block",background:i===1?"linear-gradient(90deg,#00f5a0,#00d9f5)":"#fff",WebkitBackgroundClip:i===1?"text":undefined,WebkitTextFillColor:i===1?"transparent":undefined}}>{line}</span>
              </motion.div>
            ))}
          </div>

          {/* Subtext */}
          <motion.p initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.45,duration:.6}} style={{textAlign:"center",color:"rgba(255,255,255,0.45)",fontSize:"clamp(15px,1.8vw,19px)",maxWidth:540,lineHeight:1.75}}>
            The chat platform built for teams that move at the speed of thought. Encrypted, instant, and intelligently designed.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.6,duration:.6}} style={{display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center"}}>
            <ShimmerBtn>Start for free →</ShimmerBtn>
            <motion.button whileHover={{scale:1.05,background:"rgba(255,255,255,0.08)",borderColor:"rgba(255,255,255,0.25)"}} whileTap={{scale:.97}} style={{background:"rgba(255,255,255,0.04)",color:"#fff",border:"1px solid rgba(255,255,255,0.14)",borderRadius:50,padding:"16px 38px",fontSize:16,fontWeight:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}>
              Watch demo
            </motion.button>
          </motion.div>
        </div>

        {/* 3D scene */}
        <motion.div initial={{opacity:0,y:60}} animate={{opacity:1,y:0}} transition={{duration:1,delay:.75,ease:[.16,1,.3,1]}}>
          <Hero3D/>
        </motion.div>

        {/* Social proof */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}} style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",justifyContent:"center",padding:"0 24px 80px"}}>
          <div style={{display:"flex"}}>
            {["#e91e8c","#9c27b0","#2196f3","#4caf50","#ff9800"].map((c,i)=>(
              <div key={c} style={{width:32,height:32,borderRadius:"50%",background:c,border:"2px solid #070a0f",marginLeft:i===0?0:-10,zIndex:5-i,position:"relative"}}/>
            ))}
          </div>
          <span style={{color:"rgba(255,255,255,0.45)",fontSize:14}}>Trusted by <strong style={{color:"#fff"}}>50,000+</strong> teams worldwide</span>
        </motion.div>
      </motion.section>

      {/* ── STATS BAR ── */}
      <section style={{position:"relative",zIndex:1,borderTop:"1px solid rgba(255,255,255,0.05)",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.02)"}}>
        <div style={{maxWidth:1000,margin:"0 auto",padding:"44px 28px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:32}}>
          {STATS.map((s,i)=><StatCard key={s.label} {...s} index={i}/>)}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{position:"relative",zIndex:1,padding:"120px 28px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.6}} style={{textAlign:"center",marginBottom:72}}>
            <div style={{display:"inline-block",color:"#00f5a0",fontSize:12,fontWeight:600,letterSpacing:3,textTransform:"uppercase",marginBottom:18}}>Everything you need</div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(36px,5vw,62px)",fontWeight:800,letterSpacing:"-2px",lineHeight:1.1}}>
              Built for the way<br/>
              <span style={{background:"linear-gradient(90deg,#00f5a0,#00d9f5)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>real teams work.</span>
            </h2>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:20}}>
            {FEATURES.map((f,i)=><FeatureCard key={f.title} {...f} index={i}/>)}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{position:"relative",zIndex:1,padding:"80px 28px 120px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.6}} style={{textAlign:"center",marginBottom:64}}>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(32px,4.5vw,56px)",fontWeight:800,letterSpacing:"-2px"}}>
              People <span style={{background:"linear-gradient(90deg,#00f5a0,#00d9f5)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>love</span> StoneChat.
            </h2>
          </motion.div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:20}}>
            {TESTIMONIALS.map((t,i)=><TestimonialCard key={t.name} {...t} index={i}/>)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{position:"relative",zIndex:1,padding:"0 28px 140px"}}>
        <motion.div initial={{opacity:0,scale:.94}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{duration:.7}} style={{maxWidth:840,margin:"0 auto",background:"rgba(0,245,160,0.04)",border:"1px solid rgba(0,245,160,0.14)",borderRadius:36,padding:"80px 44px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-60,left:-60,width:200,height:200,borderRadius:"50%",background:"#00f5a0",filter:"blur(80px)",opacity:.08,pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-60,right:-60,width:200,height:200,borderRadius:"50%",background:"#00d9f5",filter:"blur(80px)",opacity:.08,pointerEvents:"none"}}/>
          <motion.div animate={{x:["-100%","100%"]}} transition={{duration:3.5,repeat:Infinity,ease:"linear",repeatDelay:2.5}} style={{position:"absolute",top:0,left:0,width:"40%",height:"100%",background:"linear-gradient(90deg,transparent,rgba(0,245,160,0.05),transparent)",pointerEvents:"none"}}/>
          <h2 style={{fontFamily:"'Syne',sans-serif",fontSize:"clamp(36px,5vw,62px)",fontWeight:800,letterSpacing:"-2px",marginBottom:20}}>
            Start chatting.<br/>
            <span style={{background:"linear-gradient(90deg,#00f5a0,#00d9f5)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Free forever.</span>
          </h2>
          <p style={{color:"rgba(255,255,255,0.45)",fontSize:18,marginBottom:44,lineHeight:1.75}}>No credit card required. Set up your team in under 60 seconds.</p>
          <ShimmerBtn style={{padding:"18px 52px",fontSize:18,boxShadow:"0 8px 32px rgba(0,245,160,0.25)"}}>Create your workspace →</ShimmerBtn>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{position:"relative",zIndex:1,borderTop:"1px solid rgba(255,255,255,0.05)",padding:"48px 28px 36px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,background:"linear-gradient(90deg,#00f5a0,#00d9f5)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>StoneChat</div>
          <div style={{display:"flex",gap:28}}>
            {NAV_LINKS.map(link=>(
              <motion.a key={link} href="#" whileHover={{color:"rgba(255,255,255,0.8)"}} style={{color:"rgba(255,255,255,0.3)",textDecoration:"none",fontSize:13}}>{link}</motion.a>
            ))}
          </div>
          <div style={{height:1,width:"100%",background:"rgba(255,255,255,0.05)"}}/>
          <div style={{color:"rgba(255,255,255,0.2)",fontSize:12}}>© 2026 StoneChat Inc. Built with ♥ for fast teams.</div>
        </div>
      </footer>
    </div>
  );
};

export default ChatLanding;
