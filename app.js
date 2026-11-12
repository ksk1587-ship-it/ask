import { parse, renderSlideToSvg } from 'https://esm.sh/@web-ppt/core';

const $ = (id) => document.getElementById(id);
const fileInput = $('fileInput');
let mode = null;
let pdfDoc = null;
let pptx = null;
let page = 1;
let total = 0;
let currentFile = null;
let renderToken = 0;

function notify(text) {
  const el = $('message'); el.textContent = text; el.classList.add('show');
  clearTimeout(notify.timer); notify.timer = setTimeout(() => el.classList.remove('show'), 3000);
}
function openPicker(){ fileInput.click(); }
$('openFile').addEventListener('click', openPicker);
$('welcomeOpen').addEventListener('click', openPicker);
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0]; if (!file) return;
  await loadFile(file); fileInput.value = '';
});

async function loadFile(file){
  const name = file.name.toLowerCase();
  if (!name.endsWith('.pdf') && !name.endsWith('.pptx')) { notify('PDF 또는 PPTX 파일을 선택해 주세요.'); return; }
  $('welcome').hidden = true; $('viewer').hidden = false; $('fileName').textContent = file.name;
  $('slideContent').replaceChildren(); currentFile = file; page = 1;
  try {
    if (name.endsWith('.pdf')) {
      mode = 'pdf';
      const pdfjs = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
      const bytes = await file.arrayBuffer();
      pdfDoc = await pdfjs.getDocument({data: bytes}).promise;
      total = pdfDoc.numPages;
    } else {
      mode = 'pptx';
      const bytes = await file.arrayBuffer();
      pptx = await parse(bytes);
      total = pptx.slides.length;
      if (!total) throw new Error('슬라이드를 찾을 수 없습니다.');
    }
    $('totalPages').textContent = total;
    $('pageInput').max = total;
    await renderPage();
  } catch (err) {
    console.error(err); $('viewer').hidden = true; $('welcome').hidden = false;
    notify('파일을 여는 중 오류가 발생했습니다: ' + (err?.message || '알 수 없는 오류'));
  }
}

async function renderPage(){
  if (!total) return;
  page = Math.min(total, Math.max(1, page));
  $('pageInput').value = page;
  $('prev').disabled = page <= 1; $('next').disabled = page >= total;
  const token = ++renderToken;
  const stage = $('slideContent'); stage.replaceChildren();
  if (mode === 'pdf') {
    const pdfPage = await pdfDoc.getPage(page);
    const base = pdfPage.getViewport({scale:1});
    const box = $('slideStage');
    const scale = Math.min((box.clientWidth - 20) / base.width, (box.clientHeight - 20) / base.height, 2.5);
    const viewport = pdfPage.getViewport({scale: Math.max(.1, scale)});
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {alpha:false});
    canvas.width = Math.floor(viewport.width * devicePixelRatio);
    canvas.height = Math.floor(viewport.height * devicePixelRatio);
    canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
    await pdfPage.render({canvasContext:ctx, viewport:pdfPage.getViewport({scale:Math.max(.1,scale)*devicePixelRatio})}).promise;
    if (token === renderToken) stage.append(canvas);
  } else if (mode === 'pptx') {
    const svgText = renderSlideToSvg(pptx, pptx.slides[page - 1]);
    if (token === renderToken) stage.innerHTML = svgText;
  }
}
function go(delta){ page += delta; renderPage(); }
$('prev').addEventListener('click',()=>go(-1));
$('next').addEventListener('click',()=>go(1));
$('pageInput').addEventListener('change',()=>{ const n=Number($('pageInput').value); if(Number.isFinite(n)) {page=n; renderPage();} });
$('closeFile').addEventListener('click',()=>{
  pdfDoc?.destroy?.(); pdfDoc=null; pptx=null; total=0; mode=null; currentFile=null;
  $('viewer').hidden=true; $('welcome').hidden=false; $('slideContent').replaceChildren();
});
$('fullscreen').addEventListener('click',async()=>{
  try { if (!document.fullscreenElement) await $('viewer').requestFullscreen(); else await document.exitFullscreen(); }
  catch { notify('Safari에서는 전체 화면 전환이 제한될 수 있습니다.'); }
});
document.addEventListener('keydown',(e)=>{
  if ($('viewer').hidden) return;
  if (e.key==='ArrowRight' || e.key==='PageDown' || e.key===' '){e.preventDefault();go(1)}
  if (e.key==='ArrowLeft' || e.key==='PageUp'){e.preventDefault();go(-1)}
});
let touchX=0;
$('slideStage').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX},{passive:true});
$('slideStage').addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>55)go(dx<0?1:-1)},{passive:true});
window.addEventListener('resize',()=>{if(mode==='pdf' && ! $('viewer').hidden) renderPage();});
if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
