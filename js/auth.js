// ============================================================
// Auth helpers — shared across all pages (logo + persistent menu)
// ============================================================
function setLastProject(id){ try{localStorage.setItem("tm_last_project",id);}catch(e){} }
function getLastProject(){ try{return localStorage.getItem("tm_last_project")||"";}catch(e){return "";} }

async function getCurrentUser(){
  const {data,error}=await sb.auth.getUser();
  if(error||!data?.user)return null;
  return data.user;
}
async function requireAuth(){
  const user=await getCurrentUser();
  if(!user){ window.location.href="index.html"; return null; }
  const {data:profile}=await sb.from("profiles").select("*").eq("id",user.id).single();
  return { id:user.id, email:user.email, display_name:profile?.display_name||user.email };
}
async function signUp(email,password,displayName){
  return await sb.auth.signUp({ email, password, options:{ data:{ display_name:displayName } } });
}
async function signIn(email,password){ return await sb.auth.signInWithPassword({ email, password }); }
async function signOut(){ await sb.auth.signOut(); window.location.href="index.html"; }

async function renderTopbar(activePage,currentUser){
  const container=document.getElementById("topbar-container");
  if(!container)return;
  const urlProject=getParam("project");
  if(urlProject)setLastProject(urlProject);
  const projectId=urlProject||getLastProject();
  const q=projectId?`?project=${projectId}`:"";
  const links=[
    {key:"project",label:"Project",href:`project.html${q}`},
    {key:"templates",label:"Templates",href:`templates.html${q}`},
    {key:"tracker",label:"Tracker",href:`tracker.html${q}`},
    {key:"reports",label:"Reports",href:`reports.html${q}`},
    {key:"export",label:"Export",href:`export.html${q}`}
  ];
  const navLinks=links.map(function(l){
    if(projectId)return '<a href="'+l.href+'" class="'+(activePage===l.key?"active":"")+'">'+l.label+'</a>';
    return '<a class="disabled" title="Open a project first">'+l.label+'</a>';
  }).join("");
  container.innerHTML=
    '<div class="topbar">'+
      '<div class="brand">'+
        '<span class="brand-logo"><img src="img/orica-logo.png" alt="Orica"></span>'+
        '<span class="product">Time &amp; Motion Tracker</span>'+
      '</div>'+
      '<nav>'+
        '<a href="index.html" class="'+(activePage==="index"?"active":"")+'">Projects</a>'+
        navLinks+
      '</nav>'+
      '<div class="user-chip">'+
        '👤 '+escapeHtml(currentUser&&currentUser.display_name?currentUser.display_name:"")+
        ' <button onclick="signOut()">Sign out</button>'+
      '</div>'+
    '</div>'+
    '<div class="brand-accent"></div>';
}
