import { App } from '@modelcontextprotocol/ext-apps';
const app = new App({name:'Live QA Incognito',version:'0.1.3'},{});
const controls = [...document.querySelectorAll('button')];
const panelStatus = document.getElementById('status');
controls.forEach(button => button.disabled = true);
panelStatus.textContent = 'Connecting to Claude…';
let connected = false;
const timer = setTimeout(() => { if (!connected) panelStatus.textContent = 'Panel connection timed out. Reopen the panel in an MCP Apps compatible host.'; }, 10000);
app.onerror = () => { panelStatus.textContent = 'Panel communication failed. Reopen the panel and try again.'; };
app.onteardown = async () => { clearTimeout(timer); return {}; };
app.connect().then(() => { connected = true; clearTimeout(timer); controls.forEach(button => button.disabled = false); panelStatus.textContent = 'Connected. Ready.'; }).catch(() => { clearTimeout(timer); panelStatus.textContent = 'Could not connect to the host. Reopen the panel.'; });
async function sendFollowUp(prompt) {
 const response = await app.sendMessage({role:'user',content:[{type:'text',text:prompt}]});
 if (response.isError) throw new Error('The host rejected the follow-up message.');
}
const status=document.getElementById('status');
async function choose(choice) {
 if(!connected)return;
 controls.forEach(button=>button.disabled=true);
 status.textContent='Sending recording choice…';
 try {
  await sendFollowUp('Live QA Incognito recording choice: '+(choice==='start'?'start recording':'skip recording')+'. Continue the active Incognito QA session.');
  status.textContent='Recording choice sent to the conversation.';
 } catch { status.textContent='Could not send recording choice. Please try again.'; controls.forEach(button=>button.disabled=false); }
}
document.getElementById('start').addEventListener('click',()=>choose('start'));
document.getElementById('skip').addEventListener('click',()=>choose('skip'));