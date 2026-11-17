import vm from 'node:vm';
import assert from 'node:assert/strict';
import {recordingHtml} from './generated-ui.mjs';

async function panel(markup, {rejectTool=false,rejectMessage=false,failConnect=false}={}) {
 const elements = new Map();
 for(const match of markup.matchAll(/id="([^"]+)"/g)) elements.set(match[1],{value:'',textContent:'',disabled:false,checked:true,addEventListener(type,cb){this[type]=cb;}});
 const buttons=['start','skip'].filter(id=>elements.has(id)).map(id=>elements.get(id));
 const listeners = new Set(), calls=[];
 const parent={postMessage(message){
  calls.push(message);
  if(message.id===undefined)return;
  let result={};
  if(message.method==='ui/initialize') result={protocolVersion:'2026-01-26',hostInfo:{name:'Test host',version:'1'},hostCapabilities:{serverTools:{},message:{text:{}}},hostContext:{}};
  if(message.method==='tools/call') result=rejectTool?{isError:true,content:[{type:'text',text:'Rejected'}]}:{content:[],structuredContent:{}};
  if(message.method==='ui/message') result={isError:rejectMessage};
  queueMicrotask(()=>listeners.forEach(cb=>cb({source:parent,data:failConnect&&message.method==='ui/initialize'?{jsonrpc:'2.0',id:message.id,error:{code:-32603,message:'Unavailable'}}:{jsonrpc:'2.0',id:message.id,result}})));
 }};
 const style={};
 const document={getElementById:id=>elements.get(id),querySelectorAll:()=>buttons,documentElement:{style,getBoundingClientRect:()=>({height:500})},body:{}};
 const window={parent,innerWidth:800,addEventListener:(type,cb)=>listeners.add(cb),removeEventListener:(type,cb)=>listeners.delete(cb)};
 const context=vm.createContext({window,document,console,URL,URLSearchParams,TextEncoder,TextDecoder,AbortController,setTimeout,clearTimeout,queueMicrotask,requestAnimationFrame:cb=>setTimeout(cb,0),ResizeObserver:class{observe(){}disconnect(){}},crypto:globalThis.crypto});
 vm.runInContext(markup.match(/<script>([\s\S]*?)<\/script>/)[1],context);
 await new Promise(r=>setTimeout(r,30));
 return {elements,calls,buttons};
}

// The intake panel was removed in 0.2.0 (see assets/intake-form.html, which
// is a published Claude Artifact and is not testable in this Node vm
// harness); only the recording-choice MCP Apps panel remains here.
const markup = recordingHtml;
assert(!markup.includes('window.openai'));
let p=await panel(markup);
assert(p.calls.some(x=>x.method==='ui/initialize'));
assert(p.calls.some(x=>x.method==='ui/notifications/initialized'));
assert(p.buttons.every(x=>!x.disabled));
const bad=await panel(markup,{failConnect:true});
assert(bad.buttons.every(x=>x.disabled));
assert.match(bad.elements.get('status').textContent,/Could not connect/);

for(const choice of ['start','skip']) {
 p=await panel(recordingHtml); await p.elements.get(choice).click();
 assert(p.calls.some(x=>x.method==='ui/message'&&x.params.content[0].text.includes(choice==='start'?'start recording':'skip recording')));
}
p=await panel(recordingHtml,{rejectMessage:true}); await p.elements.get('skip').click();
assert(p.buttons.every(x=>!x.disabled));
assert.match(p.elements.get('status').textContent,/Could not send/);
console.log('PASS: real MCP Apps SDK handshake and both recording buttons in simulated host.');
