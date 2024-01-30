import 'babel-polyfill';
import { el, setChildren } from 'redom';
import {
  authorization,
  getAccounts,
  getAccount,
  createAccount,
  transferFunds,
  allCurrencies,
  getListCurrencies,
  currencyBuy,
  getBanks,
} from './js/server.js';

import './style/style.scss';

const appHeader = el('header.header', { id: 'appHeader' });
const appContainer = el('main.main', { id: 'appContainer' });
const appFooter = el('footer.footer', { id: 'appFooter' });
setChildren(document.body, appHeader, appContainer, appFooter);
const token = localStorage.getItem('token');

const pathName = location.pathname;
const params = new URLSearchParams(location.search);
console.log(pathName);

if (pathName === '/' || pathName === '/login' || !token) {
  import(`/src/js/auth.js`).then((pageModule) => {
    history.pushState(null, '', '/login');
    const container = document.querySelector('#appContainer');
    container.innerHTML = '';
    container.append(pageModule.render());
  });
} else if (pathName === '/accounts') {
  import(`/src/js/user.js`).then((pageModule) => {
    import(`/src/js/header.js`).then((pageModule) => {
      const header = document.querySelector('#appHeader');
      header.classList.add('is-visible');
      header.innerHTML = '';
      header.append(pageModule.render());
    });
    const container = document.querySelector('#appContainer');
    container.innerHTML = '';
    container.append(pageModule.render());
  });
}
