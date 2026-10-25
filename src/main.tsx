import React,{lazy,Suspense,useEffect,useState} from 'react';
import ReactDOM from 'react-dom/client';
import AppPhase2 from './app/AppPhase2';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
import './app/admin.css';

const AdminPanel=lazy(()=>import('./features/admin/AdminPanel'));
const QuizDemo=lazy(()=>import('./features/quiz/QuizDemo'));

function Root(){
 const adminPath=window.location.pathname.replace(/\/+$/,'')==='/admin';
 const quizDemoPath=window.location.pathname.replace(/\/+$/,'')==='/aula-demo';
 const [loading,setLoading]=useState(!adminPath&&!quizDemoPath);
 useEffect(()=>{if(adminPath||quizDemoPath)return;const timer=window.setTimeout(()=>setLoading(false),1000);return()=>window.clearTimeout(timer);},[adminPath]);
 if(quizDemoPath)return <ErrorBoundary><Suspense fallback={<p>Cargando cuestionario de ejemplo…</p>}><QuizDemo/></Suspense></ErrorBoundary>;
 if(adminPath)return <ErrorBoundary><Suspense fallback={<p className="empty" role="status">Cargando panel del administrador…</p>}><AdminPanel/></Suspense></ErrorBoundary>;
 return <ErrorBoundary><div inert={loading} aria-hidden={loading}><AppPhase2/></div>{loading&&<SplashScreen/>}</ErrorBoundary>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
