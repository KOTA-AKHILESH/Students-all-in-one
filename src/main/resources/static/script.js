  let student = null;
  const scholarshipPool = [
    { name:"National Scholarship Portal (NSP) Merit-cum-Means", amount:"₹12,000/yr", for:["General","OBC","SC","ST","EWS","Other"], maxIncome: 250000 },
    { name:"AICTE Pragati Scholarship (For Girls)", amount:"₹50,000/yr", for:["General","OBC","SC","ST","EWS","Other"], maxIncome: 800000, genderOnly:"Female" },
    { name:"State Post-Matric Scholarship", amount:"Tuition waiver", for:["SC","ST","OBC","EWS"], maxIncome: 250000 },
    { name:"Central Sector Scheme of Scholarship", amount:"₹10,000/yr", for:["General","OBC","EWS","Other"], maxIncome: 800000 },
    { name:"Institute Merit Scholarship", amount:"25% fee waiver", for:["General","OBC","SC","ST","EWS","Other"], minCgpa: 8.5 },
    { name:"Minority Welfare Scholarship", amount:"₹20,000/yr", for:["Other"], maxIncome: 200000 }
  ];

  const internshipPool = [
    { role:"Machine Learning Intern", org:"DataForge Labs", match:92, tags:["Python","ML","Pandas"] },
    { role:"Python Developer Intern", org:"Nimbus Softworks", match:87, tags:["Python","FastAPI","SQL"] },
    { role:"Data Analyst Intern", org:"InsightBridge", match:81, tags:["SQL","Excel","Visualization"] },
    { role:"Full-Stack Intern", org:"CivicTech Foundry", match:74, tags:["React","Node.js","MongoDB"] }
  ];

  const videoPool = [
    { title:"Operating Systems: Deadlocks Explained", channel:"CS Dojo", topic:"Operating Systems" },
    { title:"Dynamic Programming Patterns", channel:"Take U Forward", topic:"DSA" },
    { title:"Normalization in DBMS (1NF to BCNF)", channel:"Gate Smashers", topic:"DBMS" },
    { title:"System Design Basics for Interns", channel:"Tech Dummies", topic:"System Design" }
  ];

  function initials(name){
    return name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
  }

  document.getElementById('reg-form').addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const college = document.getElementById('f-college').value.trim();
    const age = document.getElementById('f-age').value;
    const gender = document.getElementById('f-gender').value;
    const dept = document.getElementById('f-dept').value;
    const cgpa = document.getElementById('f-cgpa').value;
    const income = document.getElementById('f-income').value;
    const category = document.getElementById('f-category').value;

    if(!name || !college || !age || !gender || !dept || !cgpa || !income || !category){
      document.getElementById('error-msg').style.display = 'block';
      return;
    }
    document.getElementById('error-msg').style.display = 'none';

    student = { name, college, age:Number(age), gender, dept, cgpa:Number(cgpa), income:Number(income), category };

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    document.getElementById('chip-name').textContent = name;
    document.getElementById('avatar-initials').textContent = initials(name);
    setActive('dashboard');
    renderSection('dashboard');
  });

  document.getElementById('navlist').addEventListener('click', function(e){
    const btn = e.target.closest('button[data-section]');
    if(!btn) return;
    setActive(btn.dataset.section);
    renderSection(btn.dataset.section);
  });

  document.getElementById('logout-btn').addEventListener('click', function(){
    if(!confirm('Log out of the court? Your entered details will be cleared.')) return;
    student = null;
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
      pdf:"PDF Summary", videos:"Video Suggestions", coding:"Coding Profiles",
      skills:"Skills", certificates:"Certificates", internships:"Internships",
      analytics:"Analytics", settings:"Settings"
    };
    document.getElementById('page-title').textContent = titles[section] || "Dashboard";
  }

  function matchedScholarships(){
    return scholarshipPool.filter(s=>{
      if(!s.for.includes(student.category)) return false;
      if(s.maxIncome && student.income > s.maxIncome) return false;
      if(s.minCgpa && student.cgpa < s.minCgpa) return false;
      if(s.genderOnly && s.genderOnly !== student.gender) return false;
      return true;
    });
  }

  function renderSection(section){
    const c = document.getElementById('content');
    if(section === 'dashboard') c.innerHTML = viewDashboard();
    else if(section === 'scholarships') c.innerHTML = viewScholarships();
    else if(section === 'learning') c.innerHTML = viewLearning();
    else if(section === 'pdf') c.innerHTML = viewPdf();
    else if(section === 'videos') c.innerHTML = viewVideos();
    else if(section === 'coding') c.innerHTML = viewCoding();
    else if(section === 'skills') c.innerHTML = viewSkills();
    else if(section === 'certificates') c.innerHTML = viewCertificates();
    else if(section === 'internships') c.innerHTML = viewInternships();
    else if(section === 'analytics') c.innerHTML = viewAnalytics();
    else if(section === 'settings') c.innerHTML = viewSettings();
  }

  function viewDashboard(){
    const matches = matchedScholarships();
    return `
      <div class="grid grid-4">
        <div class="card stat-card">
          <div class="stat-label">CGPA</div>
          <div class="stat-value">${student.cgpa.toFixed(2)}</div>
          <div class="stat-sub">${student.dept}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">Scholarships Matched</div>
          <div class="stat-value">${matches.length}</div>
          <div class="stat-sub">Based on your profile</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">Coding Score</div>
          <div class="stat-value">742</div>
          <div class="stat-sub">Across 3 platforms</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">Career Readiness</div>
          <div class="stat-value">76%</div>
          <div class="stat-sub">4 internships recommended</div>
        </div>
      </div>

      <h3 class="section-title">Welcome, ${student.name.split(' ')[0]}</h3>
      <div class="card">
        <p style="color:var(--ink-dim); font-size:0.94rem; line-height:1.6;">
          You're enrolled from <strong>${student.college}</strong>, studying <strong>${student.dept}</strong>.
          Your dashboard tracks scholarships, coding growth, learning decay, and career matches in one place.
          Use the sidebar to explore each area.
        </p>
      </div>

      <h3 class="section-title">Topics Needing Revision</h3>
      <div class="card">
        ${revisionRow("Dynamic Programming", 38)}
        ${revisionRow("Operating Systems: Deadlocks", 45)}
        ${revisionRow("DBMS Normalization", 61)}
      </div>
    `;
  }

  function revisionRow(topic, confidence){
    return `<div class="list-row">
      <div style="flex:1; min-width:200px;">
        <div class="rtitle">${topic}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${confidence}%"></div></div>
      </div>
      <span class="tag ${confidence < 50 ? 'tag-gold' : 'tag-purple'}">${confidence}% confidence</span>
    </div>`;
  }

  function viewScholarships(){
    const matches = matchedScholarships();
    const rows = matches.length ? matches.map(s=>`
      <div class="list-row">
        <div>
          <div class="rtitle">${s.name}</div>
          <div class="rsub">${s.amount} &middot; Category: ${student.category}</div>
        </div>
        <button class="btn-fill">Apply</button>
      </div>
    `).join('') : `<p class="empty-note">No scholarships matched your current profile — check back as new schemes are added.</p>`;

    return `
      <div class="card">
        <h3 class="section-title" style="margin-top:0;">Matched to Your Profile</h3>
        <p class="rsub" style="margin-bottom:10px;">Filtered using category (${student.category}), family income (₹${student.income.toLocaleString('en-IN')}), and CGPA (${student.cgpa}).</p>
        ${rows}
      </div>
    `;
  }

  function viewLearning(){
    return `
      <div class="card">
        <h3 class="section-title" style="margin-top:0;">Knowledge Decay Tracker</h3>
        ${revisionRow("Dynamic Programming", 38)}
        ${revisionRow("Operating Systems: Deadlocks", 45)}
        ${revisionRow("DBMS Normalization", 61)}
        ${revisionRow("Computer Networks: TCP/IP", 72)}
        ${revisionRow("OOP Concepts", 88)}
      </div>
      <p class="empty-note">Confidence drops the longer a topic goes unpracticed. Revise anything below 50% first.</p>
    `;
  }

  function viewPdf(){
    return `
      <div class="card">
        <div class="upload-box">
          <span class="icon">📄</span>
          <strong>Drop a PDF here or click to upload</strong>
          <p style="margin-top:6px; font-size:0.85rem;">Notes, textbooks, or slides — we'll summarize them for you.</p>
        </div>
      </div>
      <h3 class="section-title">Sample Summary — "Operating Systems Unit 3"</h3>
      <div class="card">
        <p style="color:var(--ink-dim); font-size:0.92rem; line-height:1.7;">
          Covers process scheduling algorithms (FCFS, SJF, Round Robin), deadlock conditions
          and prevention strategies, and memory management via paging and segmentation.
          Key formulas include average waiting time and turnaround time calculations.
        </p>
        <div style="margin-top:14px;">
          <span class="tag tag-gold">3 key formulas</span>
          <span class="tag tag-purple">12 concepts</span>
          <span class="tag tag-green">6 interview questions generated</span>
        </div>
      </div>
    `;
  }

  function viewVideos(){
    return `<div class="card">
      <h3 class="section-title" style="margin-top:0;">Recommended For You</h3>
      ${videoPool.map(v=>`
        <div class="list-row">
          <div>
            <div class="rtitle">${v.title}</div>
            <div class="rsub">${v.channel} &middot; ${v.topic}</div>
          </div>
          <button class="btn-outline">Watch</button>
        </div>
      `).join('')}
    </div>`;
  }

  function viewCoding(){
    return `
      <div class="grid grid-3">
        <div class="card">
          <h4 style="font-size:0.95rem;">LeetCode</h4>
          <div class="stat-value" style="font-size:1.5rem; margin:8px 0;">312 solved</div>
          <p class="rsub">198 Easy &middot; 96 Medium &middot; 18 Hard</p>
          <span class="tag tag-gold">Contest rating: 1584</span>
        </div>
        <div class="card">
          <h4 style="font-size:0.95rem;">GitHub</h4>
          <div class="stat-value" style="font-size:1.5rem; margin:8px 0;">24 repos</div>
          <p class="rsub">640 commits &middot; 12 pull requests</p>
          <span class="tag tag-purple">Top language: Python</span>
        </div>
        <div class="card">
          <h4 style="font-size:0.95rem;">HackerRank</h4>
          <div class="stat-value" style="font-size:1.5rem; margin:8px 0;">5-star</div>
          <p class="rsub">Problem Solving &middot; SQL &middot; Python</p>
          <span class="tag tag-green">4 certifications</span>
        </div>
      </div>
    `;
  }

  function viewSkills(){
    const skills = [["Python",90],["Machine Learning",78],["SQL",70],["React",55],["Data Structures",82]];
    return `<div class="card">
      <h3 class="section-title" style="margin-top:0;">Skill Proficiency</h3>
      ${skills.map(s=>`
        <div style="margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; font-size:0.88rem; margin-bottom:6px;">
            <span>${s[0]}</span><span class="rsub">${s[1]}%</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${s[1]}%"></div></div>
        </div>
      `).join('')}
    </div>`;
  }

  function viewCertificates(){
    return `
      <div class="card">
        <div class="upload-box">
          <span class="icon">📂</span>
          <strong>Upload a certificate</strong>
          <p style="margin-top:6px; font-size:0.85rem;">PDF or image — skills are extracted automatically.</p>
        </div>
      </div>
      <h3 class="section-title">Your Vault</h3>
      <div class="card">
        <div class="list-row"><div><div class="rtitle">AWS Cloud Practitioner</div><div class="rsub">Issued Mar 2026</div></div><span class="tag tag-green">Verified</span></div>
        <div class="list-row"><div><div class="rtitle">Python for Data Science — NPTEL</div><div class="rsub">Issued Dec 2025</div></div><span class="tag tag-green">Verified</span></div>
        <div class="list-row"><div><div class="rtitle">HackerRank SQL (Advanced)</div><div class="rsub">Issued Jan 2026</div></div><span class="tag tag-gold">Pending review</span></div>
      </div>
    `;
  }

  function viewInternships(){
    return `<div class="card">
      <h3 class="section-title" style="margin-top:0;">Recommended Internships</h3>
      ${internshipPool.map(i=>`
        <div class="list-row">
          <div>
            <div class="rtitle">${i.role} — ${i.org}</div>
            <div class="rsub">${i.tags.join(' · ')}</div>
          </div>
          <span class="tag tag-gold">${i.match}% match</span>
        </div>
      `).join('')}
    </div>`;
  }

  function viewAnalytics(){
    return `
      <div class="grid grid-2">
        <div class="card">
          <h4 style="font-size:0.95rem; margin-bottom:12px;">Attendance Trend</h4>
          ${["Aug","Sep","Oct","Nov","Dec"].map((m,i)=>{
            const v = [88,84,91,79,86][i];
            return `<div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
              <span class="rsub" style="width:36px;">${m}</span>
              <div class="bar-track" style="flex:1;"><div class="bar-fill" style="width:${v}%"></div></div>
              <span class="rsub" style="width:34px;">${v}%</span>
            </div>`;
          }).join('')}
        </div>
        <div class="card">
          <h4 style="font-size:0.95rem; margin-bottom:12px;">Career Readiness Score</h4>
          <div class="stat-value" style="font-size:2.2rem;">76%</div>
          <p class="rsub" style="margin-top:6px;">Based on coding activity, certificates, and CGPA.</p>
        </div>
      </div>
    `;
  }

  function viewSettings(){
    return `
      <div class="card settings-form">
        <div class="field"><label>Full Name</label><input type="text" value="${student.name}" id="s-name"></div>
        <div class="field"><label>College</label><input type="text" value="${student.college}" id="s-college"></div>
        <div class="field"><label>Department</label><input type="text" value="${student.dept}" id="s-dept"></div>
        <div class="field"><label>CGPA</label><input type="number" step="0.01" value="${student.cgpa}" id="s-cgpa"></div>
        <button class="btn-fill" id="save-settings" style="margin-top:8px;">Save Changes</button>
      </div>
    `;
  }

  document.addEventListener('click', function(e){
    if(e.target.id === 'save-settings'){
      student.name = document.getElementById('s-name').value || student.name;
      student.college = document.getElementById('s-college').value || student.college;
      student.dept = document.getElementById('s-dept').value || student.dept;
      student.cgpa = Number(document.getElementById('s-cgpa').value) || student.cgpa;
      document.getElementById('chip-name').textContent = student.name;
      document.getElementById('avatar-initials').textContent = initials(student.name);
      alert('Profile updated.');
    }
  });
