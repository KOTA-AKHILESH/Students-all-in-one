/* ============================================================
   SCHOLAR'S COURT — fully dynamic, user-driven dashboard
   Every module below reads from `profile`, which is built
   entirely from what the student enters. Nothing is hardcoded
   per-user; the only fixed data are the *catalogs* (scholarship
   list, internship list, video list) that recommendations are
   matched against.
   ============================================================ */

let profile = null;
let idCounter = 1;
function uid(){ return 'id' + (idCounter++) + '_' + Date.now(); }
function val(id){ const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function num(id){ const v = val(id); return v === '' ? '' : Number(v); }

function emptyProfile(){
  return {
    personal: {
      name:'', college:'', university:'', branch:'', year:'', semester:'',
      cgpa:'', state:'', category:'', gender:'', income:'', domain:'', careerGoal:''
    },
    scholarshipExtra: { minority:'No', disability:'No', hostel:'Day Scholar', achievements:'' },
    coding: {
      leetcode: { username:'', solved:'', rating:'', streak:'' },
      github:   { username:'', repos:'', commits:'', topLang:'' },
      hackerrank:{ username:'', stars:'', badges:'' }
    },
    skills: [],
    certificates: [],
    learning: [],
    attendance: [],
    pdf: { fileName:'', topic:'' }
  };
}

/* ---------------- CATALOGS (fixed reference data) ---------------- */

const scholarshipPool = [
  { name:"National Scholarship Portal (NSP) Merit-cum-Means", amount:"₹12,000/yr",
    category:["General","OBC","SC","ST","EWS","Other"], maxIncome:250000 },
  { name:"AICTE Pragati Scholarship (For Girls)", amount:"₹50,000/yr",
    category:["General","OBC","SC","ST","EWS","Other"], maxIncome:800000, genderOnly:"Female" },
  { name:"State Post-Matric Scholarship", amount:"Tuition waiver",
    category:["SC","ST","OBC","EWS"], maxIncome:250000 },
  { name:"Central Sector Scheme of Scholarship", amount:"₹10,000/yr",
    category:["General","OBC","EWS","Other"], maxIncome:800000 },
  { name:"Institute Merit Scholarship", amount:"25% fee waiver",
    category:["General","OBC","SC","ST","EWS","Other"], minCgpa:8.5 },
  { name:"Minority Welfare Scholarship", amount:"₹20,000/yr",
    category:["General","OBC","SC","ST","EWS","Other"], maxIncome:200000, minorityOnly:true },
  { name:"National Fellowship for Students with Disabilities", amount:"₹30,000/yr",
    category:["General","OBC","SC","ST","EWS","Other"], disabilityOnly:true },
  { name:"Hostel & Day Scholar Support Grant", amount:"₹8,000/yr",
    category:["General","OBC","SC","ST","EWS","Other"], maxIncome:300000, hostelOnly:"Hosteller" },
  { name:"Senior Year Excellence Award", amount:"₹15,000 one-time",
    category:["General","OBC","SC","ST","EWS","Other"], minYear:3, minCgpa:8 }
];

const internshipPool = [
  { role:"Machine Learning Intern", org:"DataForge Labs", domain:"Machine Learning", minCgpa:7.5, tags:["python","machine learning","pandas"] },
  { role:"Python Developer Intern", org:"Nimbus Softworks", domain:"Web Development", minCgpa:7,   tags:["python","fastapi","sql"] },
  { role:"Data Analyst Intern", org:"InsightBridge", domain:"Data Science", minCgpa:7,               tags:["sql","excel","python"] },
  { role:"Full-Stack Intern", org:"CivicTech Foundry", domain:"Web Development", minCgpa:6.5,        tags:["react","node.js","mongodb"] },
  { role:"Cloud Support Intern", org:"SkyBridge Cloud", domain:"Cloud Computing", minCgpa:6.5,        tags:["aws","linux","networking"] },
  { role:"Security Analyst Intern", org:"CipherWatch", domain:"Cybersecurity", minCgpa:7,             tags:["networking","linux","python"] },
  { role:"Mobile App Intern", org:"Pocketwave Apps", domain:"Mobile App Development", minCgpa:6.5,    tags:["flutter","java","kotlin"] }
];

const videoPool = [
  { title:"Dynamic Programming Patterns", channel:"Take U Forward", topic:"dsa" },
  { title:"Operating Systems: Deadlocks Explained", channel:"CS Dojo", topic:"os" },
  { title:"Normalization in DBMS (1NF to BCNF)", channel:"Gate Smashers", topic:"dbms" },
  { title:"TCP/IP Explained Simply", channel:"NetworkChuck", topic:"cn" },
  { title:"OOP Concepts in 20 Minutes", channel:"CodeWithHarry", topic:"oop" },
  { title:"Machine Learning Crash Course", channel:"freeCodeCamp", topic:"ml" },
  { title:"Full-Stack Web Dev Roadmap", channel:"Traversy Media", topic:"webdev" },
  { title:"System Design Basics for Interns", channel:"Tech Dummies", topic:"systemdesign" }
];

const topicLabels = {
  dsa:"Data Structures & Algorithms", os:"Operating Systems", dbms:"DBMS",
  cn:"Computer Networks", oop:"OOP Concepts", ml:"Machine Learning",
  webdev:"Web Development", systemdesign:"System Design", other:"Other"
};
const topicSummaries = {
  dsa:"Covers core data structures and algorithmic patterns — arrays, trees, graphs, and dynamic programming approaches to optimize time and space complexity.",
  os:"Covers process scheduling algorithms (FCFS, SJF, Round Robin), deadlock conditions and prevention strategies, and memory management via paging and segmentation.",
  dbms:"Covers relational database design, normalization (1NF–BCNF), transaction management, and indexing strategies for query performance.",
  cn:"Covers the OSI and TCP/IP models, routing protocols, and how data moves reliably across a network.",
  oop:"Covers encapsulation, inheritance, polymorphism, and abstraction with practical class-design examples.",
  ml:"Covers supervised and unsupervised learning, model evaluation metrics, and common algorithms like regression and decision trees.",
  webdev:"Covers front-end and back-end fundamentals, REST APIs, and how a full-stack application is structured end to end.",
  systemdesign:"Covers scalability, load balancing, caching, and how large systems are architected to handle real-world traffic.",
  other:"Custom notes uploaded — a general summary will appear here once a topic is selected."
};

/* ---------------- DERIVED / COMPUTED METRICS ---------------- */

function computeScholarships(){
  const p = profile.personal, ex = profile.scholarshipExtra;
  if(!p.category) return [];
  return scholarshipPool.filter(s=>{
    if(s.category && !s.category.includes(p.category)) return false;
    if(s.maxIncome && Number(p.income) > s.maxIncome) return false;
    if(s.minCgpa && Number(p.cgpa) < s.minCgpa) return false;
    if(s.genderOnly && s.genderOnly !== p.gender) return false;
    if(s.minorityOnly && ex.minority !== 'Yes') return false;
    if(s.disabilityOnly && ex.disability !== 'Yes') return false;
    if(s.hostelOnly && ex.hostel !== s.hostelOnly) return false;
    if(s.minYear && Number(p.year||0) < s.minYear) return false;
    return true;
  });
}

function computeCodingScore(){
  const lc = profile.coding.leetcode, gh = profile.coding.github, hr = profile.coding.hackerrank;
  let score = 0, weight = 0;
  if(lc.solved !== ''){ score += Math.min(Number(lc.solved)/500,1)*40; weight += 40; }
  if(lc.rating !== ''){ score += Math.min(Number(lc.rating)/2000,1)*20; weight += 20; }
  if(gh.commits !== ''){ score += Math.min(Number(gh.commits)/1000,1)*20; weight += 20; }
  if(hr.stars !== ''){ score += Math.min(Number(hr.stars)/6,1)*20; weight += 20; }
  return weight ? Math.round(score/weight*100) : null;
}

function computeAttendanceAvg(){
  if(!profile.attendance.length) return null;
  const total = profile.attendance.reduce((sum,a)=> sum + (Number(a.attended)/Number(a.conducted)*100), 0);
  return Math.round(total / profile.attendance.length);
}

function classesNeeded(conducted, attended, target=0.75){
  conducted = Number(conducted); attended = Number(attended);
  if(conducted === 0) return 0;
  if(attended/conducted >= target) return 0;
  return Math.ceil((target*conducted - attended) / (1-target));
}

function computeCareerReadiness(){
  const cgpa = Number(profile.personal.cgpa) || 0;
  const coding = computeCodingScore();
  const att = computeAttendanceAvg();
  const skillsCount = profile.skills.length;
  const certsCount = profile.certificates.length;
  let score = (cgpa/10)*25;
  score += (coding !== null ? coding/100 : 0) * 25;
  score += (att !== null ? att/100 : 0) * 20;
  score += Math.min(skillsCount/8,1) * 15;
  score += Math.min(certsCount/5,1) * 15;
  return Math.round(score);
}

function computeInternships(){
  const p = profile.personal;
  const userSkills = profile.skills.map(s=>s.name.toLowerCase());
  const codingScore = computeCodingScore() || 0;
  return internshipPool.map(i=>{
    const req = i.tags;
    const overlap = req.filter(t=>userSkills.includes(t)).length;
    const skillMatch = req.length ? overlap/req.length : 0;
    const domainMatch = p.domain && i.domain.toLowerCase() === p.domain.toLowerCase() ? 1 : 0;
    const cgpaOk = Number(p.cgpa) >= (i.minCgpa || 0) ? 1 : 0;
    const certBonus = Math.min(profile.certificates.length/3, 1);
    const match = skillMatch*50 + domainMatch*20 + cgpaOk*15 + certBonus*10 + (codingScore/100)*5;
    return Object.assign({}, i, { match: Math.round(match) });
  }).sort((a,b)=>b.match - a.match);
}

function computeLearningProgress(){
  if(!profile.learning.length) return null;
  const total = profile.learning.reduce((s,t)=> s + Number(t.confidence), 0);
  return Math.round(total / profile.learning.length);
}

function initials(name){
  return name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
}

/* ---------------- LOGIN ---------------- */

document.getElementById('reg-form').addEventListener('submit', function(e){
  e.preventDefault();
  const required = ['f-name','f-college','f-university','f-branch','f-year','f-semester',
                     'f-cgpa','f-state','f-category','f-gender','f-income','f-domain'];
  const missing = required.some(id => val(id) === '');
  if(missing){
    document.getElementById('error-msg').style.display = 'block';
    return;
  }
  document.getElementById('error-msg').style.display = 'none';

  profile = emptyProfile();
  Object.assign(profile.personal, {
    name: val('f-name'), college: val('f-college'), university: val('f-university'),
    branch: val('f-branch'), year: num('f-year'), semester: num('f-semester'),
    cgpa: num('f-cgpa'), state: val('f-state'), category: val('f-category'),
    gender: val('f-gender'), income: num('f-income'), domain: val('f-domain'),
    careerGoal: val('f-goal')
  });

  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  refreshChip();
  setActive('dashboard');
  renderSection('dashboard');
});

function refreshChip(){
  document.getElementById('chip-name').textContent = profile.personal.name || 'Student';
  document.getElementById('avatar-initials').textContent = profile.personal.name ? initials(profile.personal.name) : '?';
}

document.getElementById('navlist').addEventListener('click', function(e){
  const btn = e.target.closest('button[data-section]');
  if(!btn) return;
  setActive(btn.dataset.section);
  renderSection(btn.dataset.section);
});

document.getElementById('logout-btn').addEventListener('click', function(){
  if(!confirm('Log out of the court? All entered details will be cleared.')) return;
  profile = null;
  document.getElementById('reg-form').reset();
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
});

function setActive(section){
  document.querySelectorAll('.navlist button').forEach(b=>{
    b.classList.toggle('active', b.dataset.section === section);
  });
  const titles = {
    dashboard:"Dashboard", scholarships:"Scholarships", learning:"Learning",
    attendance:"Attendance", pdf:"PDF Summary", videos:"Video Suggestions",
    coding:"Coding Profiles", skills:"Skills", certificates:"Certificates",
    internships:"Internships", analytics:"Analytics", settings:"Settings"
  };
  document.getElementById('page-title').textContent = titles[section] || "Dashboard";
}

function renderSection(section){
  const c = document.getElementById('content');
  const views = {
    dashboard: viewDashboard, scholarships: viewScholarships, learning: viewLearning,
    attendance: viewAttendance, pdf: viewPdf, videos: viewVideos, coding: viewCoding,
    skills: viewSkills, certificates: viewCertificates, internships: viewInternships,
    analytics: viewAnalytics, settings: viewSettings
  };
  c.innerHTML = (views[section] || viewDashboard)();
}

/* ---------------- SHARED UI HELPERS ---------------- */

function statCard(label, value, sub){
  return `<div class="card stat-card">
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
    ${sub ? `<div class="stat-sub">${sub}</div>` : ''}
  </div>`;
}

function barRow(label, pct, right, redIfLow){
  const cls = redIfLow && pct < 50 ? 'red' : '';
  return `<div style="margin-bottom:16px;">
    <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:6px;">
      <span>${label}</span><span class="rsub">${right !== undefined ? right : pct + '%'}</span>
    </div>
    <div class="bar-track"><div class="bar-fill ${cls}" style="width:${Math.min(pct,100)}%"></div></div>
  </div>`;
}

/* ---------------- DASHBOARD ---------------- */

function viewDashboard(){
  const p = profile.personal;
  const matches = computeScholarships();
  const coding = computeCodingScore();
  const readiness = computeCareerReadiness();
  const weakTopics = profile.learning.filter(t=>Number(t.confidence) < 50)
                        .sort((a,b)=>a.confidence-b.confidence);

  return `
    <div class="grid grid-4">
      ${statCard('CGPA', p.cgpa || '—', p.branch)}
      ${statCard('Scholarships Eligible', matches.length, 'Based on your profile')}
      ${statCard('Coding Score', coding !== null ? coding + '/100' : '—', coding !== null ? 'Across entered platforms' : 'Add coding profiles')}
      ${statCard('Career Readiness', readiness + '%', profile.certificates.length + ' certificates on file')}
    </div>

    <h3 class="section-title">Welcome, ${p.name.split(' ')[0]}</h3>
    <div class="card">
      <p style="color:var(--ink-dim); font-size:0.94rem; line-height:1.6;">
        You're enrolled at <strong>${p.college}</strong> (${p.university}), studying
        <strong>${p.branch}</strong>, Year ${p.year} · Semester ${p.semester}.
        ${p.careerGoal ? `Working toward <strong>${p.careerGoal}</strong>.` : ''}
        Fill in each section from the sidebar and every module below updates automatically.
      </p>
    </div>

    <h3 class="section-title">Topics Needing Revision</h3>
    <div class="card">
      ${weakTopics.length
        ? weakTopics.map(t=>barRow(`${t.subject} — ${t.topic}`, Number(t.confidence), Number(t.confidence)+'% confidence', true)).join('')
        : `<p class="empty-note">No weak topics yet — add subjects in the <strong>Learning</strong> tab to see revision alerts here.</p>`}
    </div>
  `;
}

/* ---------------- SCHOLARSHIPS ---------------- */

function viewScholarships(){
  const p = profile.personal, ex = profile.scholarshipExtra;
  const matches = computeScholarships();
  return `
    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Additional Eligibility Details</h3>
      <p class="hint">These, along with your state, category, gender, income and CGPA from registration, refine your matches.</p>
      <form class="inline-form" onsubmit="saveScholarshipExtra(event)">
        <div class="field">
          <label>Minority Status</label>
          <select id="ex-minority">
            <option ${ex.minority==='No'?'selected':''}>No</option>
            <option ${ex.minority==='Yes'?'selected':''}>Yes</option>
          </select>
        </div>
        <div class="field">
          <label>Disability Status</label>
          <select id="ex-disability">
            <option ${ex.disability==='No'?'selected':''}>No</option>
            <option ${ex.disability==='Yes'?'selected':''}>Yes</option>
          </select>
        </div>
        <div class="field">
          <label>Hostel / Day Scholar</label>
          <select id="ex-hostel">
            <option ${ex.hostel==='Day Scholar'?'selected':''}>Day Scholar</option>
            <option ${ex.hostel==='Hosteller'?'selected':''}>Hosteller</option>
          </select>
        </div>
        <div class="field">
          <label>Achievements</label>
          <input type="text" id="ex-achievements" value="${ex.achievements}" placeholder="e.g. State-level hackathon winner">
        </div>
        <div class="submit-row"><button type="submit" class="btn-fill">Update & Find Scholarships</button></div>
      </form>
    </div>

    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Matched to Your Profile</h3>
      <p class="rsub" style="margin-bottom:10px;">
        Category: ${p.category} &middot; Income: ₹${Number(p.income).toLocaleString('en-IN')} &middot; CGPA: ${p.cgpa} &middot; Year: ${p.year}
      </p>
      ${matches.length ? matches.map(s=>`
        <div class="list-row">
          <div>
            <div class="rtitle">${s.name}</div>
            <div class="rsub">${s.amount}</div>
          </div>
          <button class="btn-fill">Apply</button>
        </div>
      `).join('') : `<p class="empty-note">No scholarships matched yet — update your eligibility details above.</p>`}
    </div>
  `;
}

function saveScholarshipExtra(e){
  e.preventDefault();
  profile.scholarshipExtra = {
    minority: val('ex-minority'), disability: val('ex-disability'),
    hostel: val('ex-hostel'), achievements: val('ex-achievements')
  };
  renderSection('scholarships');
}

/* ---------------- LEARNING (Knowledge Decay) ---------------- */

function viewLearning(){
  const topics = [...profile.learning].sort((a,b)=>Number(a.confidence)-Number(b.confidence));
  return `
    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Add a Topic</h3>
      <form class="inline-form" onsubmit="addLearningTopic(event)">
        <div class="field"><label>Subject</label><input type="text" id="lt-subject" required placeholder="e.g. DSA"></div>
        <div class="field"><label>Topic</label><input type="text" id="lt-topic" required placeholder="e.g. Trees"></div>
        <div class="field"><label>Confidence (%)</label><input type="number" id="lt-confidence" min="0" max="100" required placeholder="42"></div>
        <div class="field"><label>Last Revised</label><input type="date" id="lt-date"></div>
        <div class="submit-row"><button type="submit" class="btn-fill">Add Topic</button></div>
      </form>
    </div>
    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Your Topics</h3>
      ${topics.length ? topics.map(t=>`
        <div class="list-row">
          <div style="flex:1; min-width:200px;">
            <div class="rtitle">${t.subject} — ${t.topic}</div>
            <div class="bar-track"><div class="bar-fill ${t.confidence<50?'red':''}" style="width:${t.confidence}%"></div></div>
            <div class="rsub">${t.lastRevised ? 'Last revised ' + t.lastRevised : 'No revision date set'}</div>
          </div>
          <div class="row-actions">
            <span class="tag ${t.confidence<50?'tag-red':'tag-purple'}">${t.confidence}% confidence</span>
            <button class="btn-del" onclick="deleteLearningTopic('${t.id}')">Remove</button>
          </div>
        </div>
      `).join('') : `<p class="empty-note">No topics yet — add your subjects above to start tracking knowledge decay.</p>`}
    </div>
  `;
}

function addLearningTopic(e){
  e.preventDefault();
  const subject = val('lt-subject'), topic = val('lt-topic'), confidence = num('lt-confidence'), date = val('lt-date');
  if(!subject || !topic || confidence === '') return;
  profile.learning.push({ id: uid(), subject, topic, confidence: Math.min(100,Math.max(0,confidence)), lastRevised: date });
  renderSection('learning');
}
function deleteLearningTopic(id){
  profile.learning = profile.learning.filter(t=>t.id !== id);
  renderSection('learning');
}

/* ---------------- ATTENDANCE ---------------- */

function viewAttendance(){
  const rows = profile.attendance;
  const avg = computeAttendanceAvg();
  return `
    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Add Subject Attendance</h3>
      <form class="inline-form" onsubmit="addAttendance(event)">
        <div class="field"><label>Subject</label><input type="text" id="at-subject" required placeholder="e.g. Operating Systems"></div>
        <div class="field"><label>Classes Conducted</label><input type="number" id="at-conducted" min="1" required placeholder="40"></div>
        <div class="field"><label>Classes Attended</label><input type="number" id="at-attended" min="0" required placeholder="32"></div>
        <div class="submit-row"><button type="submit" class="btn-fill">Add Subject</button></div>
      </form>
    </div>
    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Your Attendance ${avg !== null ? `<span class="tag ${avg<75?'tag-red':'tag-green'}" style="margin-left:8px;">${avg}% overall</span>` : ''}</h3>
      ${rows.length ? rows.map(a=>{
        const pct = Math.round(Number(a.attended)/Number(a.conducted)*100);
        const need = classesNeeded(a.conducted, a.attended);
        return `<div class="list-row">
          <div style="flex:1; min-width:200px;">
            <div class="rtitle">${a.subject}</div>
            <div class="bar-track"><div class="bar-fill ${pct<75?'red':''}" style="width:${pct}%"></div></div>
            <div class="rsub">${a.attended}/${a.conducted} classes attended
              ${pct < 75 ? ` &middot; needs ${need} more consecutive classes to reach 75%` : ''}
            </div>
          </div>
          <div class="row-actions">
            <span class="tag ${pct<75?'tag-red':'tag-green'}">${pct}%</span>
            <button class="btn-del" onclick="deleteAttendance('${a.id}')">Remove</button>
          </div>
        </div>`;
      }).join('') : `<p class="empty-note">No subjects yet — add one above to start tracking attendance.</p>`}
    </div>
  `;
}

function addAttendance(e){
  e.preventDefault();
  const subject = val('at-subject'), conducted = num('at-conducted'), attended = num('at-attended');
  if(!subject || conducted === '' || attended === '' || attended > conducted) { alert('Attended classes cannot exceed classes conducted.'); return; }
  profile.attendance.push({ id: uid(), subject, conducted, attended });
  renderSection('attendance');
}
function deleteAttendance(id){
  profile.attendance = profile.attendance.filter(a=>a.id !== id);
  renderSection('attendance');
}

/* ---------------- PDF SUMMARY ---------------- */

function viewPdf(){
  const pdf = profile.pdf;
  return `
    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Upload Notes</h3>
      <form onsubmit="generateSummary(event)">
        <div class="upload-box" style="margin-bottom:16px;">
          <span class="icon">📄</span>
          <strong>Choose a PDF to summarize</strong>
          <p style="margin-top:6px; font-size:0.85rem;">
            <input type="file" id="pdf-file" accept="application/pdf" style="margin-top:10px;">
          </p>
        </div>
        <div class="field" style="max-width:320px; margin-bottom:16px;">
          <label>What subject is this?</label>
          <select id="pdf-topic" required>
            <option value="" disabled selected>Select</option>
            ${Object.keys(topicLabels).map(k=>`<option value="${k}">${topicLabels[k]}</option>`).join('')}
          </select>
        </div>
        <button type="submit" class="btn-fill">Generate Summary</button>
      </form>
    </div>
    ${pdf.topic ? `
      <h3 class="section-title">Summary — "${pdf.fileName}"</h3>
      <div class="card">
        <p style="color:var(--ink-dim); font-size:0.92rem; line-height:1.7;">${topicSummaries[pdf.topic]}</p>
        <div style="margin-top:14px;">
          <span class="tag tag-gold">${topicLabels[pdf.topic]}</span>
          <span class="tag tag-purple">Ready for video recommendations</span>
        </div>
      </div>
    ` : `<p class="empty-note">Upload a PDF and pick its subject to generate a summary.</p>`}
  `;
}

function generateSummary(e){
  e.preventDefault();
  const fileInput = document.getElementById('pdf-file');
  const topic = val('pdf-topic');
  if(!topic) return;
  const fileName = fileInput.files[0] ? fileInput.files[0].name : 'Uploaded document';
  profile.pdf = { fileName, topic };
  renderSection('pdf');
}

/* ---------------- VIDEO SUGGESTIONS ---------------- */

function viewVideos(){
  const topic = profile.pdf.topic;
  const list = topic ? videoPool.filter(v=>v.topic === topic) : videoPool;
  return `<div class="card">
    <h3 class="section-title" style="margin-top:0;">
      ${topic ? `Recommended for "${topicLabels[topic]}"` : 'Recommended Videos'}
    </h3>
    ${!topic ? `<p class="hint">Upload a PDF in the PDF Summary tab to get recommendations tailored to that topic. Showing all topics for now.</p>` : ''}
    ${list.length ? list.map(v=>`
      <div class="list-row">
        <div>
          <div class="rtitle">${v.title}</div>
          <div class="rsub">${v.channel} &middot; ${topicLabels[v.topic]}</div>
        </div>
        <button class="btn-outline">Watch</button>
      </div>
    `).join('') : `<p class="empty-note">No videos found for this topic yet.</p>`}
  </div>`;
}

/* ---------------- CODING PROFILES ---------------- */

function codingCard(title, id, fields, data, saveFn){
  return `<div class="card">
    <h4 style="font-size:0.95rem; margin-bottom:12px;">${title}</h4>
    <form onsubmit="${saveFn}(event)">
      ${fields.map(f=>`
        <div class="field" style="margin-bottom:10px;">
          <label>${f.label}</label>
          <input type="${f.type||'text'}" id="${id}-${f.key}" value="${data[f.key]}" placeholder="${f.ph||''}">
        </div>
      `).join('')}
      <button type="submit" class="btn-fill" style="width:100%; margin-top:6px;">Save ${title}</button>
    </form>
  </div>`;
}

function viewCoding(){
  const c = profile.coding;
  return `<div class="grid grid-3">
    ${codingCard('LeetCode', 'lc', [
      {key:'username', label:'Username', ph:'e.g. akhilesh_kota'},
      {key:'solved', label:'Problems Solved', type:'number', ph:'312'},
      {key:'rating', label:'Contest Rating', type:'number', ph:'1584'},
      {key:'streak', label:'Current Streak (days)', type:'number', ph:'14'}
    ], c.leetcode, 'saveLeetcode')}
    ${codingCard('GitHub', 'gh', [
      {key:'username', label:'Username', ph:'e.g. akhileshkota'},
      {key:'repos', label:'Repositories', type:'number', ph:'24'},
      {key:'commits', label:'Commits', type:'number', ph:'640'},
      {key:'topLang', label:'Top Language', ph:'Python'}
    ], c.github, 'saveGithub')}
    ${codingCard('HackerRank', 'hr', [
      {key:'username', label:'Username', ph:'e.g. akhilesh_k'},
      {key:'stars', label:'Stars (out of 6)', type:'number', ph:'5'},
      {key:'badges', label:'Badges Earned', type:'number', ph:'9'}
    ], c.hackerrank, 'saveHackerrank')}
  </div>`;
}

function saveLeetcode(e){
  e.preventDefault();
  profile.coding.leetcode = { username: val('lc-username'), solved: val('lc-solved'), rating: val('lc-rating'), streak: val('lc-streak') };
  renderSection('coding');
}
function saveGithub(e){
  e.preventDefault();
  profile.coding.github = { username: val('gh-username'), repos: val('gh-repos'), commits: val('gh-commits'), topLang: val('gh-topLang') };
  renderSection('coding');
}
function saveHackerrank(e){
  e.preventDefault();
  profile.coding.hackerrank = { username: val('hr-username'), stars: val('hr-stars'), badges: val('hr-badges') };
  renderSection('coding');
}

/* ---------------- SKILLS ---------------- */

function viewSkills(){
  const skills = [...profile.skills].sort((a,b)=>b.proficiency-a.proficiency);
  return `
    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Add a Skill</h3>
      <form class="inline-form" onsubmit="addSkill(event)">
        <div class="field"><label>Skill Name</label><input type="text" id="sk-name" required placeholder="e.g. Python"></div>
        <div class="field"><label>Proficiency (%)</label><input type="number" id="sk-prof" min="0" max="100" required placeholder="85"></div>
        <div class="field"><label>Experience</label><input type="text" id="sk-exp" placeholder="e.g. 1 yr"></div>
        <div class="submit-row"><button type="submit" class="btn-fill">Add Skill</button></div>
      </form>
    </div>
    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Your Skills</h3>
      ${skills.length ? skills.map(s=>`
        <div class="list-row">
          <div style="flex:1; min-width:200px;">
            <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:6px;">
              <span>${s.name}${s.experience ? ` <span class="rsub">(${s.experience})</span>` : ''}</span>
              <span class="rsub">${s.proficiency}%</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${s.proficiency}%"></div></div>
          </div>
          <button class="btn-del" onclick="deleteSkill('${s.id}')">Remove</button>
        </div>
      `).join('') : `<p class="empty-note">No skills added yet — this powers your internship matches too.</p>`}
    </div>
  `;
}

function addSkill(e){
  e.preventDefault();
  const name = val('sk-name'), prof = num('sk-prof'), exp = val('sk-exp');
  if(!name || prof === '') return;
  profile.skills.push({ id: uid(), name, proficiency: Math.min(100,Math.max(0,prof)), experience: exp });
  renderSection('skills');
}
function deleteSkill(id){
  profile.skills = profile.skills.filter(s=>s.id !== id);
  renderSection('skills');
}

/* ---------------- CERTIFICATES ---------------- */

function viewCertificates(){
  const certs = profile.certificates;
  return `
    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Upload a Certificate</h3>
      <form class="inline-form" onsubmit="addCertificate(event)">
        <div class="field"><label>Certificate Name</label><input type="text" id="ct-name" required placeholder="e.g. AWS Cloud Practitioner"></div>
        <div class="field"><label>Issuer</label><input type="text" id="ct-issuer" required placeholder="e.g. Amazon Web Services"></div>
        <div class="field"><label>Date</label><input type="date" id="ct-date"></div>
        <div class="field"><label>Skill Extracted</label><input type="text" id="ct-skill" placeholder="e.g. Cloud Computing"></div>
        <div class="field"><label>Credential Link</label><input type="url" id="ct-link" placeholder="https://..."></div>
        <div class="submit-row"><button type="submit" class="btn-fill">Add Certificate</button></div>
      </form>
    </div>
    <div class="card">
      <h3 class="section-title" style="margin-top:0;">Your Vault</h3>
      ${certs.length ? certs.map(c=>`
        <div class="list-row">
          <div>
            <div class="rtitle">${c.name}</div>
            <div class="rsub">${c.issuer}${c.date ? ' &middot; Issued ' + c.date : ''}${c.skill ? ' &middot; ' + c.skill : ''}</div>
            ${c.link ? `<a class="cert-link" href="${c.link}" target="_blank" rel="noopener">View credential</a>` : ''}
          </div>
          <button class="btn-del" onclick="deleteCertificate('${c.id}')">Remove</button>
        </div>
      `).join('') : `<p class="empty-note">No certificates yet — add one above.</p>`}
    </div>
  `;
}

function addCertificate(e){
  e.preventDefault();
  const name = val('ct-name'), issuer = val('ct-issuer');
  if(!name || !issuer) return;
  profile.certificates.push({
    id: uid(), name, issuer, date: val('ct-date'), skill: val('ct-skill'), link: val('ct-link')
  });
  renderSection('certificates');
}
function deleteCertificate(id){
  profile.certificates = profile.certificates.filter(c=>c.id !== id);
  renderSection('certificates');
}

/* ---------------- INTERNSHIPS ---------------- */

function viewInternships(){
  const list = computeInternships();
  return `<div class="card">
    <h3 class="section-title" style="margin-top:0;">Recommended Internships</h3>
    ${!profile.skills.length ? `<p class="hint">Add skills in the Skills tab for more accurate matches — showing baseline results for now.</p>` : ''}
    ${list.map(i=>`
      <div class="list-row">
        <div>
          <div class="rtitle">${i.role} — ${i.org}</div>
          <div class="rsub">${i.tags.join(' · ')} &middot; ${i.domain} &middot; Min CGPA ${i.minCgpa}</div>
        </div>
        <span class="tag ${i.match>=60?'tag-green':'tag-gold'}">${i.match}% match</span>
      </div>
    `).join('')}
  </div>`;
}

/* ---------------- ANALYTICS ---------------- */

function viewAnalytics(){
  const matches = computeScholarships();
  const readiness = computeCareerReadiness();
  const att = computeAttendanceAvg();
  const coding = computeCodingScore();
  const learning = computeLearningProgress();
  const internships = computeInternships();
  const topMatch = internships.length ? internships[0].match : 0;

  return `
    <div class="grid grid-4">
      ${statCard('Scholarships Eligible', matches.length)}
      ${statCard('Career Readiness', readiness + '%')}
      ${statCard('Attendance Avg', att !== null ? att + '%' : '—')}
      ${statCard('Coding Score', coding !== null ? coding + '/100' : '—')}
    </div>
    <div class="grid grid-4" style="margin-top:18px;">
      ${statCard('Certificates', profile.certificates.length)}
      ${statCard('Skills Logged', profile.skills.length)}
      ${statCard('Learning Progress', learning !== null ? learning + '%' : '—')}
      ${statCard('Best Internship Match', topMatch + '%')}
    </div>

    <h3 class="section-title">Attendance by Subject</h3>
    <div class="card">
      ${profile.attendance.length ? profile.attendance.map(a=>{
        const pct = Math.round(Number(a.attended)/Number(a.conducted)*100);
        return barRow(a.subject, pct, pct+'%', true);
      }).join('') : `<p class="empty-note">Add subjects in the Attendance tab to see this chart.</p>`}
    </div>
  `;
}

/* ---------------- SETTINGS ---------------- */

function viewSettings(){
  const p = profile.personal, ex = profile.scholarshipExtra;
  return `
    <div class="card settings-form">
      <h3 class="section-title" style="margin-top:0;">Personal & Academic Details</h3>
      <form onsubmit="saveSettings(event)">
        <div class="field-grid">
          <div class="field full"><label>Full Name</label><input type="text" id="s-name" value="${p.name}"></div>
          <div class="field"><label>College</label><input type="text" id="s-college" value="${p.college}"></div>
          <div class="field"><label>University</label><input type="text" id="s-university" value="${p.university}"></div>
          <div class="field"><label>Branch</label><input type="text" id="s-branch" value="${p.branch}"></div>
          <div class="field"><label>Year</label><input type="number" id="s-year" min="1" max="4" value="${p.year}"></div>
          <div class="field"><label>Semester</label><input type="number" id="s-semester" min="1" max="8" value="${p.semester}"></div>
          <div class="field"><label>CGPA</label><input type="number" id="s-cgpa" step="0.01" min="0" max="10" value="${p.cgpa}"></div>
          <div class="field"><label>State</label><input type="text" id="s-state" value="${p.state}"></div>
          <div class="field"><label>Category</label><input type="text" id="s-category" value="${p.category}"></div>
          <div class="field"><label>Gender</label><input type="text" id="s-gender" value="${p.gender}"></div>
          <div class="field"><label>Family Income (₹/yr)</label><input type="number" id="s-income" value="${p.income}"></div>
          <div class="field"><label>Interested Domain</label><input type="text" id="s-domain" value="${p.domain}"></div>
          <div class="field full"><label>Career Goal</label><input type="text" id="s-goal" value="${p.careerGoal}"></div>
          <div class="field"><label>Minority Status</label><input type="text" id="s-minority" value="${ex.minority}"></div>
          <div class="field"><label>Disability Status</label><input type="text" id="s-disability" value="${ex.disability}"></div>
          <div class="field"><label>Hostel / Day Scholar</label><input type="text" id="s-hostel" value="${ex.hostel}"></div>
          <div class="field full"><label>Achievements</label><input type="text" id="s-achievements" value="${ex.achievements}"></div>
        </div>
        <button type="submit" class="btn-fill" style="margin-top:16px;">Save Changes</button>
      </form>
    </div>
    <p class="empty-note">Skills, certificates, learning topics, attendance, and coding profiles are managed from their own tabs in the sidebar.</p>
  `;
}

function saveSettings(e){
  e.preventDefault();
  Object.assign(profile.personal, {
    name: val('s-name'), college: val('s-college'), university: val('s-university'),
    branch: val('s-branch'), year: num('s-year'), semester: num('s-semester'),
    cgpa: num('s-cgpa'), state: val('s-state'), category: val('s-category'),
    gender: val('s-gender'), income: num('s-income'), domain: val('s-domain'),
    careerGoal: val('s-goal')
  });
  Object.assign(profile.scholarshipExtra, {
    minority: val('s-minority'), disability: val('s-disability'),
    hostel: val('s-hostel'), achievements: val('s-achievements')
  });
  refreshChip();
  alert('Profile updated. All sections now reflect your new details.');
  renderSection('settings');
}
