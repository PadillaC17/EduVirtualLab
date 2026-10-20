import BrandLogo from './BrandLogo';
export default function SplashScreen(){
 return <div className="lab-splash" role="status" aria-live="polite" aria-label="Cargando EduVirtual Lab"><div className="lab-splash-center"><div className="lab-splash-tile"><BrandLogo size={51}/></div><strong>EduVirtual Lab</strong><p>Preparando tu laboratorio…</p><span className="lab-splash-progress" aria-hidden="true"/></div></div>;
}
