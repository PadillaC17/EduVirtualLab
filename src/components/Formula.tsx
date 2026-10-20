import {useMemo} from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
export default function Formula({latex}:{latex:string}){
 const html=useMemo(()=>katex.renderToString(latex,{throwOnError:false,trust:false,strict:'error',maxExpand:100,output:'htmlAndMathml'}),[latex]);
 return <div className="math-formula" dangerouslySetInnerHTML={{__html:html}}/>;
}
