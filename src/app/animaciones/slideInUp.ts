import { trigger, state, style, animate, transition } from '@angular/animations';

export const slideInUp = trigger('slideInUp', [
    state('in', style({
      transform: 'translateY(0)',
      opacity: 1
    })),
    transition('void => *', [
      style({
        transform: 'translateY(-100%)', //positivo abajo -> arriba, negativo arriba -> abajo
        opacity: 0
      }),
      animate('0.4s ease-out')
    ])
  ]);