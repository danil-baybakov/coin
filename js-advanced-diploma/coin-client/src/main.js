import 'babel-polyfill';
import { el, setChildren } from 'redom';
import { switchPage } from './js/auxiliary.js';
import { appSpinner } from './js/spinner.js';
import { appMessage } from './js/message.js';
import { domElement } from '../unit-test/summ.js';

import './resource/choises/js/choices.min.js';
import './resource/choises/css/choices.min.css';
import './resource/swiper/css/swiper-bundle.min.css';
import './resource/simplebar/css/simplebar.min.css';
import './style/style.scss';

export const appHeader = el('header.header', { id: 'appHeader' });
export const appContainer = el('main.main', { id: 'appContainer' });
export const appFooter = el('footer.footer', { id: 'appFooter' });

console.log(domElement().outerHTML);

setChildren(
  document.body,
  appHeader,
  appContainer,
  appFooter,
  appSpinner.element,
  appMessage.element,
);
const token = sessionStorage.getItem('token');

switchPage(token);

// вешаем обработчик события измения активный записи истории браузера
// для смены страницы
window.addEventListener('popstate', () => switchPage(token));
