import React,{useEffect,useState} from 'react';
import ReactDOM from 'react-dom/client';
import AppPhase2 from './app/AppPhase2';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
function Root(){
 const [loading,setLoading]=useState(true);
 useEffect(()=>{const timer=window.setTimeout(()=>setLoading(false),1000);return()=>window.clearTimeout(timer);},[]);
 return <ErrorBoundary><div inert={loading} aria-hidden={loading}><AppPhase2/></div>{loading&&<SplashScreen/>}</ErrorBoundary>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
