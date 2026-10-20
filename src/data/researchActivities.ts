export type ResearchActivityId='parabola'|'elipse'|'hiperbola';

export interface ResearchActivity{
 id:ResearchActivityId;
 title:string;
 subtitle:string;
 naturalizacion:{question:string;placeholder:string};
 desnaturalizacion:{instruction:string;prompt:string;observationQuestion:string;observationPlaceholder:string};
 reconstruccion:{question:string;placeholder:string};
}

export const researchActivities:ResearchActivity[]=[
 {
  id:'parabola',
  title:'Parábola',
  subtitle:'Apertura y coeficiente',
  naturalizacion:{
   question:'Antes de experimentar: ¿qué crees que ocurrirá con la apertura si comparamos y = x² con y = 4x²?',
   placeholder:'Creo que la parábola será… porque…'
  },
  desnaturalizacion:{
   instruction:'Activa el contraste y compara ambas curvas a una misma altura.',
   prompt:'Observa cuál curva necesita un valor de |x| menor para alcanzar la misma altura.',
   observationQuestion:'¿Qué observaste al comparar las dos parábolas?',
   observationPlaceholder:'Al activar el contraste observé que…'
  },
  reconstruccion:{
   question:'Revisa tu predicción inicial. ¿Cómo explicarías ahora la relación entre el coeficiente y la apertura?',
   placeholder:'Mi predicción inicial… Después de explorar, ahora explico que…'
  }
 },
 {
  id:'elipse',
  title:'Elipse',
  subtitle:'Semiejes y caso circular',
  naturalizacion:{
   question:'¿Qué figura crees que se obtiene si en x²/9 + y²/4 = 1 hacemos iguales los dos denominadores?',
   placeholder:'Pienso que se formará… porque…'
  },
  desnaturalizacion:{
   instruction:'Activa el contraste para comparar la elipse con x²/4 + y²/4 = 1.',
   prompt:'Compara la distancia desde el centro hasta los extremos sobre el eje x y sobre el eje y.',
   observationQuestion:'¿Qué diferencias y semejanzas observaste entre ambas figuras?',
   observationPlaceholder:'La elipse… mientras que la segunda figura…'
  },
  reconstruccion:{
   question:'¿Cómo explicarías ahora la relación entre una circunferencia y una elipse?',
   placeholder:'Ahora entiendo que una circunferencia puede considerarse…'
  }
 },
 {
  id:'hiperbola',
  title:'Hipérbola',
  subtitle:'Ramas y asíntotas',
  naturalizacion:{
   question:'¿Qué crees que ocurre entre las ramas de x²/9 − y²/4 = 1 y las rectas y = ±(2/3)x cuando nos alejamos del centro?',
   placeholder:'Creo que las ramas… porque…'
  },
  desnaturalizacion:{
   instruction:'Activa el contraste y usa la vista lejana para observar las ramas junto a sus asíntotas.',
   prompt:'La imagen orienta la observación, pero no demuestra por sí sola que no haya intersección.',
   observationQuestion:'¿Qué observaste al alejar la vista y comparar las ramas con las asíntotas?',
   observationPlaceholder:'Al ampliar la vista observé que…'
  },
  reconstruccion:{
   question:'Reconstruye tu explicación: ¿por qué las ramas se acercan a las asíntotas sin coincidir con ellas en un punto finito?',
   placeholder:'Después de explorar, explicaría que…'
  }
 }
];
