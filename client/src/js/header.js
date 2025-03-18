import { el, setChildren } from 'redom';
import { renderElement } from './auxiliary.js';
import imgLogo1440 from '../assets/image/header/logo-1440.png';
import imgLogo768 from '../assets/image/header/logo-768.png';

// функция отрисовки шапки приложения
export function render(control, root) {
  // создание контейнера
  const header = el('div.header__container.container.container2');

  control
    ? root.classList.add('is-control')
    : root.classList.remove('is-control');

  const wrapper = el('div.header__wrapper');
  setChildren(header, wrapper);

  // создание логотипа
  const logo = el('div.header__logo');
  const logoPicture = el('picture.header__logo-picture');
  const logoSrcMaxw768 = el('source.header__logo-source', {
    srcset: imgLogo768,
    media: '(max-width: 768px)',
  });
  const logoSrcMaxw1920 = el('source.header__logo-source', {
    srcset: imgLogo1440,
    media: '(max-width: 1920px)',
  });
  const logoSrcMinw1920 = el('source.header__logo-source', {
    srcset: imgLogo1440,
    media: '(min-width: 1920px)',
  });
  const logoImg = el('img.header__logo-img', { src: imgLogo1440 });
  setChildren(logo, logoPicture);
  setChildren(
    logoPicture,
    logoSrcMaxw768,
    logoSrcMaxw1920,
    logoSrcMinw1920,
    logoImg,
  );

  // создание навигации
  const nav = el('nav.header__nav');

  const navList = el('ul.header__nav-list.list-reset');

  // ..............................................................
  // кнопка Банкоматы
  // создаем обертку кнопки
  const navItemBanks = el('li.header__nav-item');
  // создаем кнопку
  const bthBanks = el(
    'a.header__nav-btn.btn.link-reset.btn-outline',
    {
      id: 'btnBanks',
      href: '#',
    },
    'Банкоматы',
  );
  // устанавливем на кнопку обработчик события клика на эту кнопку
  // для перехода на страницу карты банкоматов
  bthBanks.addEventListener('click', (event) => {
    // отменяем действия брауера по умолчанию по клику на кнопке
    event.preventDefault();
    // изменяем URL браузера
    history.pushState(null, '', '/banks');
    // вызываем функцию отрисовки страницы карты банкоматов
    renderElement('banks', document.querySelector('#appContainer'));
  });
  // помещаем кнопку в обертку
  setChildren(navItemBanks, bthBanks);
  // ..............................................................

  // ..............................................................
  // кнопка Счета
  // создаем обертку кнопки
  const navItemAccounts = el('li.header__nav-item');
  // создаем кнопку
  const bthAccounts = el(
    'a.header__nav-btn.btn.link-reset.btn-outline',
    {
      id: 'btnAccounts',
      href: '#',
    },
    'Счета',
  );
  // устанавливем на кнопку обработчик события клика на эту кнопку
  // для перехода на страницу списка счетов пользователя
  bthAccounts.addEventListener('click', (event) => {
    // отменяем действия брауера по умолчанию по клику на кнопке
    event.preventDefault();
    // изменяем URL браузера
    history.pushState(null, '', '/accounts');
    // вызываем функцию отрисовки страницы списка счетов пользователя
    renderElement('user', document.querySelector('#appContainer'));
  });
  // помещаем кнопку в обертку
  setChildren(navItemAccounts, bthAccounts);
  // ..............................................................

  // ..............................................................
  // кнопка Валюта
  // создаем обертку кнопки
  const navItemСurrency = el('li.header__nav-item');
  // создаем кнопку
  const bthСurrency = el(
    'a.header__nav-btn.btn.link-reset.btn-outline',
    {
      id: 'btnCurrency',
      href: '#',
    },
    'Валюта',
  );
  // устанавливем на кнопку обработчик события клика на эту кнопку
  // для перехода на страницу валютных инструментов
  bthСurrency.addEventListener('click', (event) => {
    // отменяем действия брауера по умолчанию по клику на кнопке
    event.preventDefault();
    // изменяем URL браузера
    history.pushState(null, '', '/coin-tools');
    // вызываем функцию отрисовки страницы валютных инструментов
    renderElement('coin-tools', document.querySelector('#appContainer'));
  });
  // помещаем кнопку в обертку
  setChildren(navItemСurrency, bthСurrency);
  // ..............................................................

  // ..............................................................
  // кнопка Выйти
  // создаем обертку кнопки
  const navItemExit = el('li.header__nav-item');
  // создаем кнопку
  const bthExit = el(
    'a.header__nav-btn.btn.link-reset.btn-outline',
    {
      id: 'btnExit',
      href: '#',
    },
    'Выйти',
  );
  // устанавливем на кнопку обработчик события клика на эту кнопку
  // для выхода из приложения
  bthExit.addEventListener('click', (event) => {
    // отменяем действия брауера по умолчанию по клику на кнопке
    event.preventDefault();
    // изменяем URL браузера
    history.pushState(null, '', '/login');
    // удаляем токен из SessionStorage
    sessionStorage.removeItem('token');
    // вызываем функцию отрисовки страницы авторизации пользователя
    renderElement(`header`, document.querySelector('#appHeader'), false);
    renderElement('auth', document.querySelector('#appContainer'));
  });
  // помещаем кнопку в обертку
  setChildren(navItemExit, bthExit);
  // ..............................................................

  setChildren(
    navList,
    navItemBanks,
    navItemAccounts,
    navItemСurrency,
    navItemExit,
  );

  setChildren(nav, navList);
  setChildren(wrapper, logo, nav);

  return header;
}
