import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

export const slideInOut = trigger('slideInOut', [
  state(
    'in',
    style({
      transform: 'translateX(0)',
      opacity: 1,
    })
  ),
  transition('void => *', [
    style({
      transform: 'translateX(100%)', //positivo izq -> der, negativo der -> izq
      opacity: 0,
    }),
    animate('0.5s ease-out'),
  ])
  /*transition('* => void', [
    animate(
      '0.3s ease-in',
      style({
        transform: 'translateX(100%)',
        opacity: 0,
      })
    ),
  ]),*/
]);
