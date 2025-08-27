
const $  = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];
const LS_KEY = "cherry_resume_builder_v1";

document.addEventListener("DOMContentLoaded", () => {
  const form = $("#resumeForm");
  const templateSelect = $("#templateSelect"); 
  const resumeEl = $("#resume");

  // map form [data-bind] -> preview targets
  const binds = {
    name:       "#r-name",
    role:       "#r-headline",  
    email:      "#r-email",
    phone:      "#r-phone",
    location:   "#r-location",
    website:    "#r-website",
    summary:    "#r-summary",
    education:  "#r-education",   
    experience: "#r-experience",  
    projects:   "#r-projects",    
    skills:     "#r-skills"       
  };

  // load from localStorage
  function loadState(){
    const saved = localStorage.getItem(LS_KEY);
    if(!saved) return;
    const data = JSON.parse(saved);
    for (const [k,v] of Object.entries(data)){
      const input = form?.querySelector?.(`[data-bind="${k}"]`);
      if(input){ input.value = v; }
    }
    applyAll();
  }

  // save to localStorage 
  let t;
  function persist(){
    clearTimeout(t);
    t = setTimeout(() => {
      const data = {};
      $$("[data-bind]").forEach(el => data[el.getAttribute("data-bind")] = el.value || "");
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    }, 200);
  }

  // helpers to render lists
  function linesToList(targetSel, str){
    const ul = $(targetSel);
    if(!ul) return;
    ul.innerHTML = "";
    const items = (str || "")
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean);
    for(const it of items){
      const li = document.createElement("li");
      li.textContent = it;
      ul.appendChild(li);
    }
  }
  function skillsToPills(targetSel, str){
    // currently renders as simple list; keep same styling if you want pills
    linesToList(targetSel, (str || "").split(/,|\n/).map(s => s.trim()).filter(Boolean).join("\n"));
  }

  // apply single field into preview
  function applyField(key, value){
    const target = binds[key];
    if(!target) return;
    if(["education","experience","projects"].includes(key)){
      linesToList(target, value);
    } else if(key === "skills"){
      skillsToPills(target, value);
    } else {
      const node = $(target);
      if(node) node.textContent = value || defaultValueFor(key);
    }
  }
  function defaultValueFor(key){
    const defaults = {
      name: "Your Name",
      role: "Role",                       
      email: "you@example.com",
      phone: "+91-XXXXXXXXXX",
      location: "City, Country",
      website: "yourwebsite.com",
      summary: "(Your summary)"
    };
    return defaults[key] || "";
  }

  // apply all fields
  function applyAll(){
    $$("[data-bind]").forEach(el => applyField(el.getAttribute("data-bind"), el.value));
  }

  // events: typing -> update + save
  if (form) {
    form.addEventListener("input", () => { applyAll(); persist(); });
  }

  // template switch (guarded; your HTML doesn't have this select yet)
  if (templateSelect && resumeEl) {
    templateSelect.addEventListener("change", e => {
      resumeEl.classList.remove("template--classic","template--modern");
      const val = e.target.value === "modern" ? "template--modern" : "template--classic";
      resumeEl.classList.add(val);
      persist();
    });
  }

  // download to PDF 
  const dlBtn = $("#downloadPdfBtn");
  if (dlBtn) {
    dlBtn.addEventListener("click", () => {
      if (typeof html2pdf !== "function" && typeof html2pdf === "undefined") {
        alert("PDF library missing. Include html2pdf.bundle.min.js in your HTML.");
        return;
      }
      const opt = {
        margin:       [10, 10, 10, 10],
        filename:     `${($("#r-name")?.textContent.trim() || "resume")}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from($("#resume")).save();
    });
  }

  // clear
  const clearBtn = $("#clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if(!confirm("Clear all fields and local saved data?")) return;
      $$("[data-bind]").forEach(el => el.value = "");
      localStorage.removeItem(LS_KEY);
      applyAll();
    });
  }

  // init
  loadState();
  applyAll();
});